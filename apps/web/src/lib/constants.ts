export const NUCCA_TOKEN_ADDRESS =
  process.env.NEXT_PUBLIC_NUCCA_TOKEN_ADDRESS ??
  "0x3f1F7daCdAb79FDedC16693871be7A63f05aB465";

export const WORLD_CHAIN_ID = Number(
  process.env.NEXT_PUBLIC_WORLD_CHAIN_ID ?? "480",
);

export const WORLD_CHAIN_DEXSCREENER_ID = "worldchain";
export const NUCCA_PRIMARY_PAIR_ADDRESS =
  "0x05ca223daaebe0dcf796d759d210d1ace3f59db9";
export const WLD_TOKEN_ADDRESS = "0x2cFc85d8E48F8EAB294be644d9E25C3030863003";
export const USDC_TOKEN_ADDRESS = "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1";
export const UNISWAP_UNIVERSAL_ROUTER_WORLDCHAIN =
  "0x8ac7bee993bb44dab564ea4bc9ea67bf9eb5e743";
export const UNISWAP_UNIVERSAL_ROUTER_211_WORLDCHAIN =
  "0x8b844f885672f333bc0042cb669255f93a4c1e6b";
export const UNISWAP_SWAP_ROUTER_02_WORLDCHAIN =
  "0x091AD9e2e6e5eD44c1c66dB50e49A601F9f36cF6";
export const UNISWAP_QUOTER_V2_WORLDCHAIN =
  "0x10158D43e6cc414deE1Bd1eB0EfC6a5cBCfF244c";
export const UNISWAP_V3_FACTORY_WORLDCHAIN =
  "0x7a5028BDa40e7B173C278C5342087826455ea25a";
export const UNISWAP_V2_FACTORY_WORLDCHAIN =
  "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
export const NUCCA_V2_LIQUIDITY_ROUTER_WORLDCHAIN =
  "0x541aB7c31A119441eF3575F6973277DE0eF460bd";
export const NUCCA_SWAP_ROUTER_ADDRESS =
  process.env.NEXT_PUBLIC_NUCCA_SWAP_ROUTER_ADDRESS ?? "";
export const NUCCA_SPEND_ROUTER_ADDRESS =
  process.env.NUCCA_SPEND_ROUTER_ADDRESS ??
  process.env.NEXT_PUBLIC_NUCCA_SPEND_ROUTER_ADDRESS ??
  "";

export const TOKEN_FACTS = {
  name: "NUCCA",
  burned: 6_000_000,
  burnedPercent: 6,
  holders: 42_000,
  patilopesBalance: 3_500_000,
  lockedPercent: 37.5,
  visibleLocked: 23_500_000,
  originalSupply: 100_000_000,
};

export const DEAD_WALLET_ADDRESS = "0x000000000000000000000000000000000000dEaD";

export const COMMUNITY_LOCKS = [
  {
    id: "puf-lock-2026-06-13",
    amountNucca: 5_000_000,
    usdValue: 62.52,
    unlocksAt: "2026-06-13T04:50:00.000+01:00",
  },
  {
    id: "puf-lock-2026-06-14",
    amountNucca: 5_000_000,
    usdValue: 62.52,
    unlocksAt: "2026-06-14T04:50:00.000+01:00",
  },
  {
    id: "puf-lock-2026-11-08",
    amountNucca: 5_000_000,
    usdValue: 62.52,
    unlocksAt: "2026-11-08T04:50:00.000+00:00",
  },
  {
    id: "puf-lock-2026-11-11",
    amountNucca: 2_500_000,
    usdValue: 32.98,
    unlocksAt: "2026-11-11T04:50:00.000+00:00",
  },
  {
    id: "puf-lock-2027-05-10",
    amountNucca: 5_000_000,
    usdValue: 62.52,
    unlocksAt: "2027-05-10T04:50:00.000+01:00",
  },
  {
    id: "puf-lock-2027-05-25",
    amountNucca: 1_000_000,
    usdValue: 13.64,
    unlocksAt: "2027-05-25T04:50:00.000+01:00",
  },
] as const;

export const ECONOMY_SPLIT = {
  treasury: 35,
  monthlyLeagueReserve: 35,
  aiReserve: 15,
  rewardsReserve: 15,
};

export const MARKETPLACE_COMMISSION_BPS = 1_000;
export const MARKETPLACE_COMMISSION_PERCENT = 10;

export const TREASURY_POLICY = {
  publicRule:
    "All platform commissions route to the admin treasury. The treasury address is intentionally not displayed in the app UI.",
  rewardSource:
    "Claims, referrals, rankings, and tournament prizes should be paid from a capped pre-funded reward reserve, not by exposing or automating the main admin wallet.",
};

export const BURN_POLICY = {
  automaticBurnsEnabled: false,
  manualOnly: true,
  publicRule:
    "NuCCa Genesis Studio does not promise automatic burns. Any token burn is a manual admin decision and must be reported later with a WorldChain transaction hash.",
};
