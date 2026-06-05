import { optionalServerEnv } from "@/lib/env";

export function getAdminWalletAddress() {
  return optionalServerEnv("ADMIN_WALLET_ADDRESS") ?? optionalServerEnv("ADMIN_WALLET");
}

export function isAdminWallet(walletAddress: string | null | undefined) {
  const adminWallet = getAdminWalletAddress();
  return Boolean(
    adminWallet &&
      walletAddress &&
      walletAddress.toLowerCase() === adminWallet.toLowerCase(),
  );
}

export function adminWalletConfigured() {
  return Boolean(getAdminWalletAddress());
}
