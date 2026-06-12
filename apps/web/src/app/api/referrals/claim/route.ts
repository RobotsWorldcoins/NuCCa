import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchNuccaMarket } from "@/lib/dexscreener";
import { readSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  createReferralCode,
  normalizeReferralCode,
  referralTransparency,
} from "@/lib/referrals";

const claimSchema = z.object({
  code: z.string().min(4).max(32),
  ownCode: z.string().min(3).max(32).optional(),
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

  const referralCode = normalizeReferralCode(body.data.code);
  const ownWalletCode = normalizeReferralCode(createReferralCode(session.walletAddress));
  const ownSubmittedCode = body.data.ownCode
    ? normalizeReferralCode(body.data.ownCode)
    : null;

  if (referralCode === ownWalletCode || (ownSubmittedCode && referralCode === ownSubmittedCode)) {
    return NextResponse.json(
      { ok: false, message: "You cannot use your own referral code." },
      { status: 409 },
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

  const { data: referrer } = await supabase
    .from("users")
    .select("wallet_address, referral_code")
    .eq("referral_code", referralCode)
    .maybeSingle();

  if (!referrer) {
    return NextResponse.json(
      { ok: false, message: "Referral code not found." },
      { status: 404 },
    );
  }

  if (referrer.wallet_address?.toLowerCase() === session.walletAddress.toLowerCase()) {
    return NextResponse.json(
      { ok: false, message: "You cannot use your own referral code." },
      { status: 409 },
    );
  }

  const { error } = await supabase.from("referral_events").insert({
    referred_wallet: session.walletAddress,
    referrer_wallet: referrer.wallet_address,
    referral_code: referralCode,
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
