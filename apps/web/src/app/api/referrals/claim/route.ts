import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchNuccaMarket } from "@/lib/dexscreener";
import { readSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";
import { normalizeReferralCode, referralTransparency } from "@/lib/referrals";

const claimSchema = z.object({
  code: z.string().min(4).max(32),
});

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "WalletAuth is required." },
      { status: 401 },
    );
  }

  const body = claimSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json(
      { ok: false, message: "Invalid referral code." },
      { status: 400 },
    );
  }

  const market = await fetchNuccaMarket().catch(() => null);
  const reward = referralTransparency({
    launchDate: new Date("2026-06-01T00:00:00.000Z"),
    activeUsers: 1_000,
    priceUsd: market?.priceUsd ?? null,
    marketTrusted: market?.trustedForRewards ?? false,
  });

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({
      ok: false,
      message:
        "Referral DB is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      reward,
    });
  }

  const { error } = await supabase.from("referral_events").insert({
    referred_wallet: session.walletAddress,
    referral_code: normalizeReferralCode(body.data.code),
    reward_nucca: reward.referralReward,
    referred_bonus_nucca: reward.referredUserBonus,
    status: reward.referralReward > 0 ? "pending_reward" : "xp_only",
  });

  if (error) {
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true, reward });
}
