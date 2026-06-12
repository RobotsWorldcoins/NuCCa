export const DAILY_REWARD_POLICY = {
  monthOneClaim: 1,
  maxReferralFriends: 100,
  dailyNuccaBudget: 3_000,
  dailyDiscoveryNuccaPool: 1_000,
  maxPaidMapScansPerDay: 10,
  paidMapScanCostNucca: 100,
  referralMonthlyBudget: 25_000,
  minimumTrustedLiquidityUsd: 1_000,
  staleMarketDataSeconds: 10 * 60,
  referralUsdCap: 0.02,
};

export type RewardInputs = {
  launchDate: Date;
  now?: Date;
  activeUsers: number;
  priceUsd: number | null;
  marketTrusted: boolean;
};

export function monthIndexSinceLaunch(launchDate: Date, now = new Date()) {
  const months =
    (now.getUTCFullYear() - launchDate.getUTCFullYear()) * 12 +
    (now.getUTCMonth() - launchDate.getUTCMonth());
  return Math.max(0, months);
}

export function halvingReward(monthIndex: number) {
  return 1 / 2 ** monthIndex;
}

export function activeUserMultiplier(activeUsers: number) {
  if (activeUsers <= 5_000) return 1;
  if (activeUsers <= 15_000) return 0.75;
  if (activeUsers <= 33_000) return 0.5;
  return 0.25;
}

export function priceGuardMultiplier(priceUsd: number | null, trusted: boolean) {
  if (!trusted || !priceUsd || priceUsd <= 0) return 0;
  return 1;
}

export function calculateDailyClaim(inputs: RewardInputs) {
  const monthIndex = monthIndexSinceLaunch(inputs.launchDate, inputs.now);
  const base = halvingReward(monthIndex);
  const userLoad = activeUserMultiplier(inputs.activeUsers);
  const priceGuard = priceGuardMultiplier(inputs.priceUsd, inputs.marketTrusted);
  const tokenReward = Number((base * userLoad * priceGuard).toFixed(6));

  return {
    monthIndex,
    baseReward: base,
    userLoadMultiplier: userLoad,
    priceGuardMultiplier: priceGuard,
    tokenReward,
    xpReward: 25,
    energyReward: 10,
  };
}

export function calculateReferralReward(inputs: RewardInputs) {
  const daily = calculateDailyClaim(inputs);
  const priceCapped =
    inputs.priceUsd && inputs.priceUsd > 0
      ? Math.min(daily.tokenReward, DAILY_REWARD_POLICY.referralUsdCap / inputs.priceUsd)
      : 0;

  return {
    ...daily,
    maxFriends: DAILY_REWARD_POLICY.maxReferralFriends,
    referralReward: Number(priceCapped.toFixed(6)),
    referredUserBonus: Number((priceCapped / 2).toFixed(6)),
    xpReward: 100,
    studioEnergyBonus: 25,
  };
}
