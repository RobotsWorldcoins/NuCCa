import "server-only";

import { createPublicClient, http, type Address } from "viem";
import { worldchain } from "viem/chains";
import {
  NUCCA_SWAP_ROUTER_ADDRESS,
  NUCCA_V2_LIQUIDITY_ROUTER_WORLDCHAIN,
  UNISWAP_QUOTER_V2_WORLDCHAIN,
  WLD_TOKEN_ADDRESS,
} from "@/lib/constants";
import {
  SWAP_ROUTES,
  SWAP_TOKEN_DECIMALS,
  decimalToBaseUnits,
  type NativeSwapQuote,
  type SwapRoute,
  type SwapRouteId,
} from "@/lib/swap";

const FEE_TIERS = [100, 500, 3000, 10_000] as const;
const DEFAULT_SLIPPAGE_BPS = 100;
const MAX_SLIPPAGE_BPS = 500;
const QUOTE_TTL_SECONDS = 180;

const quoterV2Abi = [
  {
    type: "function",
    name: "quoteExactInputSingle",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "amountIn", type: "uint256" },
          { name: "fee", type: "uint24" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
      },
    ],
    outputs: [
      { name: "amountOut", type: "uint256" },
      { name: "sqrtPriceX96After", type: "uint160" },
      { name: "initializedTicksCrossed", type: "uint32" },
      { name: "gasEstimate", type: "uint256" },
    ],
  },
] as const;

const v2RouterAbi = [
  {
    type: "function",
    name: "getAmountsOut",
    stateMutability: "view",
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "path", type: "address[]" },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
] as const;

const publicClient = createPublicClient({
  chain: worldchain,
  transport: http(process.env.WORLDCHAIN_RPC_URL ?? worldchain.rpcUrls.default.http[0]),
});

type QuoteCandidate = {
  kind: NativeSwapQuote["kind"];
  amountOut: bigint;
  bridgeToken?: string;
  fee?: number;
  fees: number[];
};

export async function quoteNativeSwap({
  routeId,
  amount,
  slippageBps = DEFAULT_SLIPPAGE_BPS,
}: {
  routeId: SwapRouteId;
  amount: string;
  slippageBps?: number;
}): Promise<NativeSwapQuote> {
  const route = SWAP_ROUTES.find((candidate) => candidate.id === routeId);
  if (!route) {
    throw new Error("Unsupported swap route.");
  }

  const decimals = SWAP_TOKEN_DECIMALS[route.inputSymbol];
  const amountInBaseUnits = decimalToBaseUnits(amount, decimals);
  if (!amountInBaseUnits || BigInt(amountInBaseUnits) <= BigInt(0)) {
    throw new Error("Invalid swap amount.");
  }

  const safeSlippageBps = Math.min(Math.max(Math.trunc(slippageBps), 1), MAX_SLIPPAGE_BPS);
  const amountIn = BigInt(amountInBaseUnits);
  const candidates = await quoteCandidates(route, amountIn);
  const best = candidates.sort((a, b) => (a.amountOut > b.amountOut ? -1 : 1))[0];

  if (!best || best.amountOut <= BigInt(0)) {
    throw new Error("No live Uniswap route returned a valid quote.");
  }

  const amountOutMinimum =
    (best.amountOut * BigInt(10_000 - safeSlippageBps)) / BigInt(10_000);
  const deadline = Math.floor(Date.now() / 1000) + QUOTE_TTL_SECONDS;

  return {
    routeId,
    label: route.label,
    kind: best.kind,
    tokenIn: route.inputAddress,
    bridgeToken: best.bridgeToken,
    tokenOut: route.outputAddress,
    amountIn: amountIn.toString(),
    amountOut: best.amountOut.toString(),
    amountOutMinimum: amountOutMinimum.toString(),
    slippageBps: safeSlippageBps,
    deadline,
    ttlSeconds: QUOTE_TTL_SECONDS,
    fee: best.fee,
    fees: best.fees,
    routerAddress: NUCCA_SWAP_ROUTER_ADDRESS || null,
    executable: Boolean(NUCCA_SWAP_ROUTER_ADDRESS),
  };
}

async function quoteCandidates(route: SwapRoute, amountIn: bigint) {
  if (route.id === "nucca-wld" || route.id === "wld-nucca") {
    return quoteV2DirectRoute(route, amountIn);
  }

  if (route.id === "wld-usdc" || route.id === "usdc-wld") {
    return quoteV3DirectRoute(route, amountIn);
  }

  if (route.id === "nucca-usdc") {
    return quoteV2ToV3Route(route, amountIn);
  }

  if (route.id === "usdc-nucca") {
    return quoteV3ToV2Route(route, amountIn);
  }

  return [];
}

async function quoteV2DirectRoute(route: SwapRoute, amountIn: bigint): Promise<QuoteCandidate[]> {
  const amountOut = await quoteV2ExactInput(
    route.inputAddress as Address,
    route.outputAddress as Address,
    amountIn,
  );

  return [
    {
      kind: "v2",
      amountOut,
      fees: [300],
    },
  ];
}

async function quoteV3DirectRoute(route: SwapRoute, amountIn: bigint): Promise<QuoteCandidate[]> {
  const attempts = await Promise.allSettled(
    FEE_TIERS.map(async (fee) => {
      const amountOut = await quoteExactInputSingle(
        route.inputAddress as Address,
        route.outputAddress as Address,
        amountIn,
        fee,
      );
      return {
        kind: "v3" as const,
        amountOut,
        fee,
        fees: [fee],
      };
    }),
  );

  return attempts.reduce<QuoteCandidate[]>((quotes, result) => {
    if (result.status === "fulfilled") quotes.push(result.value);
    return quotes;
  }, []);
}

async function quoteV2ToV3Route(route: SwapRoute, amountIn: bigint): Promise<QuoteCandidate[]> {
  const bridgeAmount = await quoteV2ExactInput(
    route.inputAddress as Address,
    WLD_TOKEN_ADDRESS as Address,
    amountIn,
  );

  const attempts = await Promise.allSettled(
    FEE_TIERS.map(async (fee) => {
      const amountOut = await quoteExactInputSingle(
        WLD_TOKEN_ADDRESS as Address,
        route.outputAddress as Address,
        bridgeAmount,
        fee,
      );
      return {
        kind: "mixed-v2-v3" as const,
        amountOut,
        bridgeToken: WLD_TOKEN_ADDRESS,
        fee,
        fees: [300, fee],
      };
    }),
  );

  return attempts.reduce<QuoteCandidate[]>((quotes, result) => {
    if (result.status === "fulfilled") quotes.push(result.value);
    return quotes;
  }, []);
}

async function quoteV3ToV2Route(route: SwapRoute, amountIn: bigint): Promise<QuoteCandidate[]> {
  const attempts = await Promise.allSettled(
    FEE_TIERS.map(async (fee) => {
      const bridgeAmount = await quoteExactInputSingle(
        route.inputAddress as Address,
        WLD_TOKEN_ADDRESS as Address,
        amountIn,
        fee,
      );
      const amountOut = await quoteV2ExactInput(
        WLD_TOKEN_ADDRESS as Address,
        route.outputAddress as Address,
        bridgeAmount,
      );
      return {
        kind: "mixed-v3-v2" as const,
        amountOut,
        bridgeToken: WLD_TOKEN_ADDRESS,
        fee,
        fees: [fee, 300],
      };
    }),
  );

  return attempts.reduce<QuoteCandidate[]>((quotes, result) => {
    if (result.status === "fulfilled") quotes.push(result.value);
    return quotes;
  }, []);
}

async function quoteV2ExactInput(tokenIn: Address, tokenOut: Address, amountIn: bigint) {
  const amounts = await publicClient.readContract({
    address: NUCCA_V2_LIQUIDITY_ROUTER_WORLDCHAIN as Address,
    abi: v2RouterAbi,
    functionName: "getAmountsOut",
    args: [amountIn, [tokenIn, tokenOut]],
  });

  return amounts[amounts.length - 1];
}

async function quoteExactInputSingle(
  tokenIn: Address,
  tokenOut: Address,
  amountIn: bigint,
  fee: number,
) {
  const { result } = await publicClient.simulateContract({
    address: UNISWAP_QUOTER_V2_WORLDCHAIN as Address,
    abi: quoterV2Abi,
    functionName: "quoteExactInputSingle",
    args: [
      {
        tokenIn,
        tokenOut,
        amountIn,
        fee,
        sqrtPriceLimitX96: BigInt(0),
      },
    ],
  });

  return result[0];
}
