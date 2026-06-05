import { NextResponse } from "next/server";
import { z } from "zod";
import { ADMIN_WALLET, BURN_POLICY, ECONOMY_SPLIT } from "@/lib/constants";
import { DAILY_REWARD_POLICY } from "@/lib/economy";
import { readSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";

const economyPatchSchema = z.object({
  dailyNuccaBudget: z.number().positive().optional(),
  referralMonthlyBudget: z.number().positive().optional(),
  enabled: z.boolean().optional(),
});

export async function GET() {
  return NextResponse.json({
    ok: true,
    adminWallet: ADMIN_WALLET,
    split: ECONOMY_SPLIT,
    burnPolicy: BURN_POLICY,
    rewardPolicy: DAILY_REWARD_POLICY,
  });
}

export async function PATCH(request: Request) {
  const session = await readSession();
  if (session?.walletAddress.toLowerCase() !== ADMIN_WALLET.toLowerCase()) {
    return NextResponse.json(
      { ok: false, message: "Admin WalletAuth session required." },
      { status: 403 },
    );
  }

  const body = economyPatchSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json(
      { ok: false, message: "Invalid economy config." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, message: "Supabase admin client is not configured." },
      { status: 503 },
    );
  }

  const { error } = await supabase.from("economy_audit_logs").insert({
    actor_wallet: session.walletAddress,
    event_type: "economy_config_patch",
    payload: body.data,
  });

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
