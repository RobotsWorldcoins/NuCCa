import {
  NUCCA_SWAP_ROUTER_ADDRESS,
  NUCCA_PRIMARY_PAIR_ADDRESS,
  NUCCA_TOKEN_ADDRESS,
  NUCCA_V2_LIQUIDITY_ROUTER_WORLDCHAIN,
  UNISWAP_QUOTER_V2_WORLDCHAIN,
  UNISWAP_SWAP_ROUTER_02_WORLDCHAIN,
  UNISWAP_UNIVERSAL_ROUTER_211_WORLDCHAIN,
  UNISWAP_UNIVERSAL_ROUTER_WORLDCHAIN,
  USDC_TOKEN_ADDRESS,
  WLD_TOKEN_ADDRESS,
} from "@/lib/constants";

export type SwapRouteId =
  | "nucca-wld"
  | "wld-nucca"
  | "nucca-usdc"
  | "usdc-nucca"
  | "wld-usdc"
  | "usdc-wld";
export type SwapSymbol = "NUCCA" | "WLD" | "USDC";

export type SwapRoute = {
  id: SwapRouteId;
  label: string;
  inputSymbol: SwapSymbol;
  outputSymbol: SwapSymbol;
  inputAddress: string;
  outputAddress: string;
  routeType: "direct_pool" | "routed";
  pathLabel: string;
  liquidityNote: string;
  uniswapUrl: string;
  dexscreenerUrl?: string;
};

export type NativeSwapQuote = {
  routeId: SwapRouteId;
  label: string;
  kind: "v2" | "v3" | "mixed-v2-v3" | "mixed-v3-v2";
  tokenIn: string;
  bridgeToken?: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  amountOutMinimum: string;
  slippageBps: number;
  deadline: number;
  ttlSeconds: number;
  fee?: number;
  fees: number[];
  routerAddress: string | null;
  executable: boolean;
};

const UNISWAP_SWAP_BASE = "https://app.uniswap.org/swap";
export const PERMIT2_WORLDCHAIN = "0x000000000022D473030F116dDEE9F6B43aC78BA3";
export const SWAP_TOKEN_DECIMALS: Record<SwapSymbol, number> = {
  NUCCA: 18,
  WLD: 18,
  USDC: 6,
};

export const PERMIT2_APPROVE_ABI = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "spender", type: "address" },
      { name: "amount", type: "uint160" },
      { name: "expiration", type: "uint48" },
    ],
    outputs: [],
  },
] as const;

export const NUCCA_SWAP_ROUTER_ABI = [
  {
    type: "function",
    name: "swapExactInputSingleWithPermit2",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "request",
        type: "tuple",
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "amountIn", type: "uint160" },
          { name: "amountOutMinimum", type: "uint256" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
          { name: "deadline", type: "uint64" },
        ],
      },
    ],
    outputs: [{ name: "amountOut", type: "uint256" }],
  },
  {
    type: "function",
    name: "swapExactInputWithPermit2",
    stateMutability: "nonpayable",
    inputs: [
      { name: "path", type: "bytes" },
      { name: "amountIn", type: "uint160" },
      { name: "amountOutMinimum", type: "uint256" },
      { name: "deadline", type: "uint64" },
    ],
    outputs: [{ name: "amountOut", type: "uint256" }],
  },
  {
    type: "function",
    name: "swapV2ExactInputWithPermit2",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenIn", type: "address" },
      { name: "tokenOut", type: "address" },
      { name: "amountIn", type: "uint160" },
      { name: "amountOutMinimum", type: "uint256" },
      { name: "deadline", type: "uint64" },
    ],
    outputs: [{ name: "amountOut", type: "uint256" }],
  },
  {
    type: "function",
    name: "swapV2ToV3WithPermit2",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenIn", type: "address" },
      { name: "bridgeToken", type: "address" },
      { name: "tokenOut", type: "address" },
      { name: "v3Fee", type: "uint24" },
      { name: "amountIn", type: "uint160" },
      { name: "amountOutMinimum", type: "uint256" },
      { name: "deadline", type: "uint64" },
    ],
    outputs: [{ name: "amountOut", type: "uint256" }],
  },
  {
    type: "function",
    name: "swapV3ToV2WithPermit2",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenIn", type: "address" },
      { name: "bridgeToken", type: "address" },
      { name: "tokenOut", type: "address" },
      { name: "v3Fee", type: "uint24" },
      { name: "amountIn", type: "uint160" },
      { name: "amountOutMinimum", type: "uint256" },
      { name: "deadline", type: "uint64" },
    ],
    outputs: [{ name: "amountOut", type: "uint256" }],
  },
] as const;

function uniswapSwapUrl(inputAddress: string, outputAddress: string) {
  const params = new URLSearchParams({
    chain: "worldchain",
    inputCurrency: inputAddress,
    outputCurrency: outputAddress,
  });
  return `${UNISWAP_SWAP_BASE}?${params.toString()}`;
}

export const SWAP_ROUTES: SwapRoute[] = [
  {
    id: "nucca-wld",
    label: "NUCCA -> WLD",
    inputSymbol: "NUCCA",
    outputSymbol: "WLD",
    inputAddress: NUCCA_TOKEN_ADDRESS,
    outputAddress: WLD_TOKEN_ADDRESS,
    routeType: "direct_pool",
    pathLabel: "NUCCA/WLD V2 pool",
    liquidityNote:
      "Direct NUCCA/WLD pool tracked on Dexscreener.",
    uniswapUrl: uniswapSwapUrl(NUCCA_TOKEN_ADDRESS, WLD_TOKEN_ADDRESS),
    dexscreenerUrl: `https://dexscreener.com/worldchain/${NUCCA_PRIMARY_PAIR_ADDRESS}`,
  },
  {
    id: "wld-nucca",
    label: "WLD -> NUCCA",
    inputSymbol: "WLD",
    outputSymbol: "NUCCA",
    inputAddress: WLD_TOKEN_ADDRESS,
    outputAddress: NUCCA_TOKEN_ADDRESS,
    routeType: "direct_pool",
    pathLabel: "WLD/NUCCA V2 pool",
    liquidityNote:
      "Direct WLD/NUCCA pool tracked on Dexscreener.",
    uniswapUrl: uniswapSwapUrl(WLD_TOKEN_ADDRESS, NUCCA_TOKEN_ADDRESS),
    dexscreenerUrl: `https://dexscreener.com/worldchain/${NUCCA_PRIMARY_PAIR_ADDRESS}`,
  },
  {
    id: "nucca-usdc",
    label: "NUCCA -> USDC",
    inputSymbol: "NUCCA",
    outputSymbol: "USDC",
    inputAddress: NUCCA_TOKEN_ADDRESS,
    outputAddress: USDC_TOKEN_ADDRESS,
    routeType: "routed",
    pathLabel: "NUCCA -> WLD -> USDC",
    liquidityNote:
      "Mixed route: NUCCA/WLD through V2, then WLD/USDC through Uniswap V3.",
    uniswapUrl: uniswapSwapUrl(NUCCA_TOKEN_ADDRESS, USDC_TOKEN_ADDRESS),
    dexscreenerUrl: `https://dexscreener.com/worldchain/${NUCCA_PRIMARY_PAIR_ADDRESS}`,
  },
  {
    id: "usdc-nucca",
    label: "USDC -> NUCCA",
    inputSymbol: "USDC",
    outputSymbol: "NUCCA",
    inputAddress: USDC_TOKEN_ADDRESS,
    outputAddress: NUCCA_TOKEN_ADDRESS,
    routeType: "routed",
    pathLabel: "USDC -> WLD -> NUCCA",
    liquidityNote:
      "Mixed route: USDC/WLD through Uniswap V3, then WLD/NUCCA through V2.",
    uniswapUrl: uniswapSwapUrl(USDC_TOKEN_ADDRESS, NUCCA_TOKEN_ADDRESS),
    dexscreenerUrl: `https://dexscreener.com/worldchain/${NUCCA_PRIMARY_PAIR_ADDRESS}`,
  },
  {
    id: "wld-usdc",
    label: "WLD -> USDC",
    inputSymbol: "WLD",
    outputSymbol: "USDC",
    inputAddress: WLD_TOKEN_ADDRESS,
    outputAddress: USDC_TOKEN_ADDRESS,
    routeType: "direct_pool",
    pathLabel: "WLD/USDC Uniswap pool",
    liquidityNote:
      "Direct WLD/USDC route for stablecoin liquidity inside the NuCCa swap screen.",
    uniswapUrl: uniswapSwapUrl(WLD_TOKEN_ADDRESS, USDC_TOKEN_ADDRESS),
  },
  {
    id: "usdc-wld",
    label: "USDC -> WLD",
    inputSymbol: "USDC",
    outputSymbol: "WLD",
    inputAddress: USDC_TOKEN_ADDRESS,
    outputAddress: WLD_TOKEN_ADDRESS,
    routeType: "direct_pool",
    pathLabel: "USDC/WLD Uniswap pool",
    liquidityNote:
      "Direct USDC/WLD route. Useful for users who enter with stablecoin and need WLD liquidity.",
    uniswapUrl: uniswapSwapUrl(USDC_TOKEN_ADDRESS, WLD_TOKEN_ADDRESS),
  },
];

export function decimalToBaseUnits(input: string, decimals: number) {
  const normalized = input.trim();
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;

  const [whole, fractional = ""] = normalized.split(".");
  const paddedFractional = fractional.slice(0, decimals).padEnd(decimals, "0");
  return `${BigInt(whole || "0") * BigInt(10) ** BigInt(decimals) + BigInt(paddedFractional || "0")}`;
}

export const NATIVE_SWAP_EXECUTION_STEPS = [
  "Quote route with QuoterV2 on World Chain",
  "Calculate amountOutMinimum with slippage guard",
  "Approve exact input through Permit2 AllowanceTransfer",
  "Call NuCCa swap router or Universal Router with MiniKit.sendTransaction",
  "Poll userOp receipt before showing the swap as complete",
] as const;

export const SWAP_INTEGRATION_STATUS = {
  execution: "native_minikit_required",
  quickActionFallback: "disabled_by_product_decision",
  chainId: 480,
  routerAddress: NUCCA_SWAP_ROUTER_ADDRESS || null,
  executable: Boolean(NUCCA_SWAP_ROUTER_ADDRESS),
  requiredAllowlist: [
    NUCCA_TOKEN_ADDRESS,
    WLD_TOKEN_ADDRESS,
    USDC_TOKEN_ADDRESS,
    PERMIT2_WORLDCHAIN,
    ...(NUCCA_SWAP_ROUTER_ADDRESS ? [NUCCA_SWAP_ROUTER_ADDRESS] : []),
  ],
  contractDependencies: [
    NUCCA_V2_LIQUIDITY_ROUTER_WORLDCHAIN,
    UNISWAP_QUOTER_V2_WORLDCHAIN,
    UNISWAP_SWAP_ROUTER_02_WORLDCHAIN,
    UNISWAP_UNIVERSAL_ROUTER_WORLDCHAIN,
    UNISWAP_UNIVERSAL_ROUTER_211_WORLDCHAIN,
  ],
  note:
    "The NuCCa UI executes swaps in-app after World Developer Portal allowlisting, quote/slippage protection, Permit2 approval, sendTransaction, and userOp receipt polling.",
};
