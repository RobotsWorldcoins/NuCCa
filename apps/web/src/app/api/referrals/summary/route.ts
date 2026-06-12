import { NextResponse } from "next/server";
import { TOKEN_FACTS } from "@/lib/constants";
import { fetchNuccaMarket } from "@/lib/dexscreener";
import { referralTransparency } from "@/lib/referrals";

export async function GET() {
  const market = await fetchNuccaMarket().catch(() => null);
  const referral = referralTransparency({
    launchDate: new Date("2026-06-01T00:00:00.000Z"),
    activeUsers: TOKEN_FACTS.holders,
    priceUsd: market?.priceUsd ?? null,
    marketTrusted: market?.trustedForRewards ?? false,
  });

  return NextResponse.json({
    ok: true,
    referral,
    marketTrusted: market?.trustedForRewards ?? false,
  });
}
