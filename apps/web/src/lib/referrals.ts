import { calculateReferralReward, type RewardInputs } from "@/lib/economy";

export function normalizeReferralCode(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 24);
}

export function createReferralCode(walletAddress: string) {
  const clean = walletAddress.toLowerCase().replace(/^0x/, "");
  return `nucca${clean.slice(0, 8)}`;
}

export function createReferralCodeFromUsername(username: string | null | undefined) {
  const normalized = normalizeReferralCode(username ?? "");
  return normalized.length >= 3 ? normalized : null;
}

export function createBestReferralCode({
  username,
  walletAddress,
}: {
  username?: string | null;
  walletAddress: string;
}) {
  return createReferralCodeFromUsername(username) ?? createReferralCode(walletAddress);
}

export function referralTransparency(inputs: RewardInputs) {
  const reward = calculateReferralReward(inputs);
  return {
    ...reward,
    rules: [
      "Max 100 qualified friends per account.",
      "A friend qualifies only after WalletAuth, World ID session verification, and first daily claim.",
      "Self-referrals and repeated World ID sessions do not qualify.",
      "Month 1 starts at 1 NUCCA, then halves monthly: 0.5, 0.25, 0.125, and so on.",
      "If market data is stale, illiquid, or unavailable, the token reward becomes XP/energy only.",
      "All token rewards are capped by the global daily and monthly reward budgets.",
    ],
  };
}
