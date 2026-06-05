import { NextResponse } from "next/server";
import { fetchNuccaMarket } from "@/lib/dexscreener";
import { referralTransparency } from "@/lib/referrals";

export async function GET() {
  const market = await fetchNuccaMarket().catch(() => null);
  const referral = referralTransparency({
    launchDate: new Date("2026-06-01T00:00:00.000Z"),
    activeUsers: 1_000,
    priceUsd: market?.priceUsd ?? null,
    marketTrusted: market?.trustedForRewards ?? false,
  });

  return NextResponse.json({
    ok: true,
    referral,
    marketTrusted: market?.trustedForRewards ?? false,
  });
}
