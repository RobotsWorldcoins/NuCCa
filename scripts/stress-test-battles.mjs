const scenarios = [
  {
    mode: "Genesis Duel 48h solo minimum",
    dau: 1000,
    battleRate: 0.08,
    avgVotes: 12,
    creatorEntry: 500,
    entrants: 2,
    platformPct: 10,
    leaguePct: 10,
  },
  {
    mode: "Genesis Duel 48h crew 3v3 minimum",
    dau: 1000,
    battleRate: 0.03,
    avgVotes: 24,
    creatorEntry: 500,
    entrants: 6,
    platformPct: 10,
    leaguePct: 10,
  },
  {
    mode: "Flash Battle 24h solo minimum",
    dau: 10000,
    battleRate: 0.06,
    avgVotes: 18,
    creatorEntry: 250,
    entrants: 2,
    platformPct: 10,
    leaguePct: 10,
  },
  {
    mode: "Flash Battle 24h crew 3v3 high pool at 42k user base",
    dau: 42000,
    battleRate: 0.02,
    avgVotes: 36,
    creatorEntry: 1000,
    entrants: 6,
    platformPct: 10,
    leaguePct: 10,
  },
];

const days = 30;

for (const scenario of scenarios) {
  const dailyBattles = Math.round(scenario.dau * scenario.battleRate);
  const monthlyBattles = dailyBattles * days;
  const monthlyVotes = monthlyBattles * scenario.avgVotes;
  const contestGross = scenario.creatorEntry * scenario.entrants;
  const grossCreatorEntry = monthlyBattles * contestGross;
  const platformRevenue = grossCreatorEntry * (scenario.platformPct / 100);
  const monthlyLeagueReserve = grossCreatorEntry * (scenario.leaguePct / 100);
  const creatorPrizes = grossCreatorEntry - platformRevenue - monthlyLeagueReserve;
  const voteWritesPerDay = dailyBattles * scenario.avgVotes;

  console.log(
    JSON.stringify(
      {
        mode: scenario.mode,
        dau: scenario.dau,
        dailyBattles,
        monthlyBattles,
        monthlyVotes,
        voteWritesPerDay,
        entrants: scenario.entrants,
        contestGross,
        grossCreatorEntry,
        platformRevenue,
        monthlyLeagueReserve,
        creatorPrizes,
        externalManualTokenomicsActions: "not modeled inside the app",
        spectatorTokenPayout: 0,
        brutalRead:
          voteWritesPerDay > 50000
            ? "Too much voting load for a simple free-tier backend."
            : "Backend load is plausible if anti-abuse and batching are in place.",
        legalRead:
          "Spectator NUCCA betting remains disabled. Hype backing avoids unlicensed betting mechanics.",
      },
      null,
      2,
    ),
  );
}
