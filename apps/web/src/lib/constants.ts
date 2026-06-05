export const NUCCA_TOKEN_ADDRESS =
  process.env.NEXT_PUBLIC_NUCCA_TOKEN_ADDRESS ??
  "0x3f1F7daCdAb79FDedC16693871be7A63f05aB465";

export const WORLD_CHAIN_ID = Number(
  process.env.NEXT_PUBLIC_WORLD_CHAIN_ID ?? "480",
);

export const WORLD_CHAIN_DEXSCREENER_ID = "worldchain";
export const NUCCA_PRIMARY_PAIR_ADDRESS =
  "0x05ca223daaebe0dcf796d759d210d1ace3f59db9";

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
  treasury: 45,
  monthlyLeagueReserve: 25,
  aiReserve: 15,
  rewardsReserve: 15,
};

export const BURN_POLICY = {
  automaticBurnsEnabled: false,
  manualOnly: true,
  publicRule:
    "NuCCa Genesis Studio does not promise automatic burns. Any token burn is a manual admin decision and must be reported later with a WorldChain transaction hash.",
};
