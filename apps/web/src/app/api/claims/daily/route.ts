import { NextResponse } from "next/server";
import { fetchNuccaMarket } from "@/lib/dexscreener";
import { calculateDailyClaim } from "@/lib/economy";
import { TOKEN_FACTS } from "@/lib/constants";
import { readSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST() {
  const session = await readSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Connect with WalletAuth first." },
      { status: 401 },
    );
  }

  const market = await fetchNuccaMarket().catch(() => null);
  const claim = calculateDailyClaim({
    launchDate: new Date("2026-06-01T00:00:00.000Z"),
    activeUsers: TOKEN_FACTS.holders,
    priceUsd: market?.priceUsd ?? null,
    marketTrusted: market?.trustedForRewards ?? false,
  });

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabase.from("daily_claims").insert({
      wallet_address: session.walletAddress,
      claim_date: today,
      token_reward: claim.tokenReward,
      xp_reward: claim.xpReward,
      energy_reward: claim.energyReward,
      market_trusted: market?.trustedForRewards ?? false,
    });

    if (error) {
      return NextResponse.json(
        { ok: false, message: "Daily claim already used or DB rejected it." },
        { status: 409 },
      );
    }
  }

  return NextResponse.json({ ok: true, claim });
}
