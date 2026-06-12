import {
  NUCCA_PRIMARY_PAIR_ADDRESS,
  NUCCA_TOKEN_ADDRESS,
  UNISWAP_UNIVERSAL_ROUTER_211_WORLDCHAIN,
  UNISWAP_UNIVERSAL_ROUTER_WORLDCHAIN,
  USDC_TOKEN_ADDRESS,
  WLD_TOKEN_ADDRESS,
} from "@/lib/constants";

export type SwapRouteId = "nucca-wld" | "wld-nucca" | "nucca-usdc" | "usdc-nucca";
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

const UNISWAP_SWAP_BASE = "https://app.uniswap.org/swap";
export const WORLD_SWAP_QUICK_ACTION_APP_ID = "app_6c5c5717c77abe83be8814c032c3a6f9";
const WORLD_ACTION_BASE = "https://worldcoin.org/mini-app";
export const SWAP_TOKEN_DECIMALS: Record<SwapSymbol, number> = {
  NUCCA: 18,
  WLD: 18,
  USDC: 6,
};

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
    pathLabel: "NUCCA/WLD Uniswap pool",
    liquidityNote: "Direct NUCCA/WLD pool tracked on Dexscreener.",
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
    pathLabel: "WLD/NUCCA Uniswap pool",
    liquidityNote: "Direct WLD/NUCCA pool tracked on Dexscreener.",
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
      "No direct NUCCA/USDC pool is currently tracked; Uniswap must route through available liquidity.",
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
      "No direct USDC/NUCCA pool is currently tracked; Uniswap must route through available liquidity.",
    uniswapUrl: uniswapSwapUrl(USDC_TOKEN_ADDRESS, NUCCA_TOKEN_ADDRESS),
    dexscreenerUrl: `https://dexscreener.com/worldchain/${NUCCA_PRIMARY_PAIR_ADDRESS}`,
  },
];

export function decimalToBaseUnits(input: string, decimals: number) {
  const normalized = input.trim();
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;

  const [whole, fractional = ""] = normalized.split(".");
  const paddedFractional = fractional.slice(0, decimals).padEnd(decimals, "0");
  return `${BigInt(whole || "0") * BigInt(10) ** BigInt(decimals) + BigInt(paddedFractional || "0")}`;
}

export function worldSwapQuickActionUrl({
  route,
  amountBaseUnits,
  sourceAppId,
}: {
  route: SwapRoute;
  amountBaseUnits: string;
  sourceAppId?: string;
}) {
  const params = new URLSearchParams({
    fromToken: route.inputAddress,
    toToken: route.outputAddress,
    amount: amountBaseUnits,
    sourceAppId: sourceAppId || "app_nucca_pending",
    sourceAppName: "NuCCa Genesis Studio",
  });
  const path = `/?${params.toString()}`;
  const actionParams = new URLSearchParams({
    app_id: WORLD_SWAP_QUICK_ACTION_APP_ID,
    path,
  });
  return `${WORLD_ACTION_BASE}?${actionParams.toString()}`;
}

export const SWAP_INTEGRATION_STATUS = {
  execution: "world_swap_quick_action_ready",
  nativeMiniKit: "requires_developer_portal_allowlist",
  requiredAllowlist: [
    NUCCA_TOKEN_ADDRESS,
    WLD_TOKEN_ADDRESS,
    USDC_TOKEN_ADDRESS,
    UNISWAP_UNIVERSAL_ROUTER_WORLDCHAIN,
    UNISWAP_UNIVERSAL_ROUTER_211_WORLDCHAIN,
  ],
  note:
    "Real in-app MiniKit execution requires World Developer Portal allowlisting and production quote/slippage handling before enabling transaction signing.",
};
