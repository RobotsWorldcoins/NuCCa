import {
  DAILY_REWARD_POLICY,
} from "@/lib/economy";
import {
  NUCCA_PRIMARY_PAIR_ADDRESS,
  NUCCA_TOKEN_ADDRESS,
  WORLD_CHAIN_DEXSCREENER_ID,
} from "@/lib/constants";

export type NuccaMarket = {
  source: "dexscreener";
  chainId: string;
  pairAddress: string | null;
  dexId: string | null;
  url: string | null;
  priceUsd: number | null;
  priceNative: string | null;
  liquidityUsd: number | null;
  volume24h: number | null;
  txns24h: number;
  priceChange24h: number | null;
  fetchedAt: string;
  trustedForRewards: boolean;
  warning: string | null;
};

type DexPair = {
  chainId?: string;
  dexId?: string;
  url?: string;
  pairAddress?: string;
  priceUsd?: string | null;
  priceNative?: string | null;
  volume?: { h24?: number };
  txns?: { h24?: { buys?: number; sells?: number } };
  priceChange?: { h24?: number };
  liquidity?: { usd?: number };
};

function numberOrNull(value: unknown) {
  const number = typeof value === "string" ? Number(value) : Number(value);
  return Number.isFinite(number) ? number : null;
}

export async function fetchNuccaMarket(): Promise<NuccaMarket> {
  const url = `https://api.dexscreener.com/token-pairs/v1/${WORLD_CHAIN_DEXSCREENER_ID}/${NUCCA_TOKEN_ADDRESS}`;
  const response = await fetch(url, { next: { revalidate: 60 } });

  if (!response.ok) {
    throw new Error(`Dexscreener returned ${response.status}`);
  }

  const pairs = (await response.json()) as DexPair[];
  const pair =
    pairs.find((candidate) =>
      candidate.pairAddress?.toLowerCase() ===
      NUCCA_PRIMARY_PAIR_ADDRESS.toLowerCase(),
    ) ??
    pairs
      .filter((candidate) => candidate.chainId === WORLD_CHAIN_DEXSCREENER_ID)
      .sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];

  const liquidityUsd = numberOrNull(pair?.liquidity?.usd);
  const priceUsd = numberOrNull(pair?.priceUsd);
  const txns24h =
    (pair?.txns?.h24?.buys ?? 0) + (pair?.txns?.h24?.sells ?? 0);
  const trusted =
    Boolean(priceUsd && priceUsd > 0) &&
    Boolean(liquidityUsd && liquidityUsd >= DAILY_REWARD_POLICY.minimumTrustedLiquidityUsd) &&
    txns24h > 0;

  return {
    source: "dexscreener",
    chainId: WORLD_CHAIN_DEXSCREENER_ID,
    pairAddress: pair?.pairAddress ?? null,
    dexId: pair?.dexId ?? null,
    url: pair?.url ?? null,
    priceUsd,
    priceNative: pair?.priceNative ?? null,
    liquidityUsd,
    volume24h: numberOrNull(pair?.volume?.h24),
    txns24h,
    priceChange24h: numberOrNull(pair?.priceChange?.h24),
    fetchedAt: new Date().toISOString(),
    trustedForRewards: trusted,
    warning: trusted
      ? null
      : "Market data is visible but not trusted for token reward sizing until liquidity and activity thresholds are met.",
  };
}
