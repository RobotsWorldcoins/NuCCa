import { NextResponse } from "next/server";
import { z } from "zod";
import { createBestReferralCode, createReferralCode } from "@/lib/referrals";
import { createSession, readSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";

const profileSchema = z.object({
  username: z.string().min(2).max(64).optional().nullable(),
  profilePictureUrl: z.string().url().optional().nullable(),
});

export async function GET() {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Connect wallet first." }, { status: 401 });
  }

  const fallbackCode = createReferralCode(session.walletAddress);
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json({
      ok: true,
      profile: {
        walletAddress: session.walletAddress,
        username: session.username ?? null,
        referralCode: createBestReferralCode({
          username: session.username,
          walletAddress: session.walletAddress,
        }),
        persisted: false,
      },
    });
  }

  const { data } = await supabase
    .from("users")
    .select("wallet_address, username, referral_code")
    .eq("wallet_address", session.walletAddress)
    .maybeSingle();

  return NextResponse.json({
    ok: true,
    profile: {
      walletAddress: session.walletAddress,
      username: data?.username ?? session.username ?? null,
      referralCode: data?.referral_code ?? fallbackCode,
      persisted: Boolean(data),
    },
  });
}

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Connect wallet first." }, { status: 401 });
  }

  const body = profileSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ ok: false, message: "Invalid profile." }, { status: 400 });
  }

  const username = body.data.username?.trim() || null;
  const primaryCode = createBestReferralCode({
    username,
    walletAddress: session.walletAddress,
  });
  const fallbackCode = createReferralCode(session.walletAddress);
  const supabase = getSupabaseAdmin();

  await createSession({
    ...session,
    username: username ?? session.username,
  });

  if (!supabase) {
    return NextResponse.json({
      ok: true,
      profile: {
        walletAddress: session.walletAddress,
        username,
        referralCode: primaryCode,
        persisted: false,
      },
    });
  }

  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        wallet_address: session.walletAddress,
        username,
        referral_code: primaryCode,
      },
      { onConflict: "wallet_address" },
    )
    .select("wallet_address, username, referral_code")
    .single();

  if (!error) {
    return NextResponse.json({ ok: true, profile: data });
  }

  if (primaryCode !== fallbackCode) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("users")
      .upsert(
        {
          wallet_address: session.walletAddress,
          username,
          referral_code: fallbackCode,
        },
        { onConflict: "wallet_address" },
      )
      .select("wallet_address, username, referral_code")
      .single();

    if (!fallbackError) {
      return NextResponse.json({
        ok: true,
        profile: fallbackData,
        message: "Username referral code was taken; wallet fallback code assigned.",
      });
    }
  }

  return NextResponse.json({ ok: false, message: error.message }, { status: 409 });
}
