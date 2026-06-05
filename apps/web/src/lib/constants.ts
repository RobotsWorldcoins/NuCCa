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

export const ADMIN_WALLET =
  "0xd81ca2d5e0138d73e3a953a0fc7eee2e0e186969";

export const TOKEN_FACTS = {
  name: "NUCCA",
  burned: 5_000_000,
  burnedPercent: 5,
  holders: 33_000,
  patilopesBalance: 3_500_000,
  pufLockedPercent: 37.5,
  originalSupply: 100_000_000,
};

export const ECONOMY_SPLIT = {
  treasury: 35,
  monthlyLeagueReserve: 35,
  aiReserve: 15,
  rewardsReserve: 15,
};

export const BURN_POLICY = {
  automaticBurnsEnabled: false,
  manualOnly: true,
  publicRule:
    "NuCCa Genesis Studio does not promise automatic burns. Any token burn is a manual admin decision and must be reported later with a WorldChain transaction hash.",
};
