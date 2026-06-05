export type BattleModeId = "genesis-duel" | "flash-battle";
export type BattleFormatId = "solo-1v1" | "crew-3v3";

export type BattleMode = {
  id: BattleModeId;
  name: string;
  durationHours: number;
  minimumCreatorEntryNucca: number;
  platformFeePercent: number;
  monthlyLeagueReservePercent: number;
  creatorPrizePercent: number;
  spectatorTokenBetting: "disabled";
  supporterMechanic: string;
};

export type BattleFormat = {
  id: BattleFormatId;
  name: string;
  teamSize: number;
  teams: number;
  description: string;
};

export const BATTLE_FORMATS: BattleFormat[] = [
  {
    id: "solo-1v1",
    name: "Solo 1v1",
    teamSize: 1,
    teams: 2,
    description: "One creator versus one creator. Fastest format to launch.",
  },
  {
    id: "crew-3v3",
    name: "Crew 3v3",
    teamSize: 3,
    teams: 2,
    description:
      "Three creators join each side. Bigger entry pool, higher prize, stronger clan value.",
  },
];

export const MIN_FLASH_CREATOR_ENTRY_NUCCA = 250;
export const MIN_GENESIS_CREATOR_ENTRY_NUCCA = 500;

export const BATTLE_MODES: BattleMode[] = [
  {
    id: "genesis-duel",
    name: "Genesis Duel",
    durationHours: 48,
    minimumCreatorEntryNucca: MIN_GENESIS_CREATOR_ENTRY_NUCCA,
    platformFeePercent: 18,
    monthlyLeagueReservePercent: 7,
    creatorPrizePercent: 75,
    spectatorTokenBetting: "disabled",
    supporterMechanic:
      "Fans back a side with non-transferable Hype. Correct backers win XP, rank points, and cosmetic shards only.",
  },
  {
    id: "flash-battle",
    name: "Flash Battle",
    durationHours: 24,
    minimumCreatorEntryNucca: MIN_FLASH_CREATOR_ENTRY_NUCCA,
    platformFeePercent: 15,
    monthlyLeagueReservePercent: 5,
    creatorPrizePercent: 80,
    spectatorTokenBetting: "disabled",
    supporterMechanic:
      "Fast predictions use daily free Hype. No NUCCA payout to spectators.",
  },
];

export const HOUSE_COMMISSION_RULES = [
  "Solo 24h battles require at least 500 NUCCA total: 250 NUCCA from each creator.",
  "Solo 48h battles require at least 1000 NUCCA total: 500 NUCCA from each creator.",
  "Crew 3v3 battles multiply the creator entry by six total creators: minimum 1500 NUCCA for 24h and 3000 NUCCA for 48h.",
  "The admin/platform commission and monthly league reserve are disclosed before entry.",
  "There is no maximum creator-funded contest pool in this MVP configuration.",
  "Entry fees are split into creator prize, admin commission, and monthly ranking reserve.",
  "Spectator NUCCA betting is disabled until a licensed gambling model exists.",
  "World ID verified votes count at full weight; unverified support is advisory.",
];

export function getBattleMode(id: BattleModeId) {
  return BATTLE_MODES.find((mode) => mode.id === id) ?? BATTLE_MODES[0];
}

export function getBattleFormat(id: BattleFormatId) {
  return BATTLE_FORMATS.find((format) => format.id === id) ?? BATTLE_FORMATS[0];
}

export function totalEntrantsForFormat(format: BattleFormat) {
  return format.teamSize * format.teams;
}

export function calculateMinimumContestNucca(
  mode: BattleMode,
  format: BattleFormat = BATTLE_FORMATS[0],
) {
  return mode.minimumCreatorEntryNucca * totalEntrantsForFormat(format);
}

export function calculateBattleSplit(
  mode: BattleMode,
  totalContestNucca = calculateMinimumContestNucca(mode),
  format: BattleFormat = BATTLE_FORMATS[0],
) {
  const minimumContestNucca = calculateMinimumContestNucca(mode, format);
  if (totalContestNucca < minimumContestNucca) {
    throw new Error(
      `${mode.name} ${format.name} requires at least ${minimumContestNucca} NUCCA total.`,
    );
  }

  const entrantCount = totalEntrantsForFormat(format);
  const creatorEntryNucca = Number((totalContestNucca / entrantCount).toFixed(4));
  const grossPool = Number(totalContestNucca.toFixed(4));
  const platformCommission = Number(
    ((grossPool * mode.platformFeePercent) / 100).toFixed(4),
  );
  const monthlyLeagueReserve = Number(
    ((grossPool * mode.monthlyLeagueReservePercent) / 100).toFixed(4),
  );
  const creatorPrize = Number(
    (grossPool - platformCommission - monthlyLeagueReserve).toFixed(4),
  );

  return {
    grossPool,
    format: format.id,
    teamSize: format.teamSize,
    entrantCount,
    minimumContestNucca,
    creatorEntryNucca,
    platformCommission,
    monthlyLeagueReserve,
    creatorPrize,
    loserReceives: 0,
    supporterTokenPayout: 0,
    supporterRewards: ["XP", "Hype rank", "cosmetic shards", "voting streak"],
  };
}
