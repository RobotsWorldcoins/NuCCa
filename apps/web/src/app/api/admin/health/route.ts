import { NextResponse } from "next/server";
import { ADMIN_WALLET } from "@/lib/constants";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  return NextResponse.json({
    ok: true,
    adminWallet: ADMIN_WALLET,
    checks: {
      supabase: Boolean(getSupabaseAdmin()),
      rpSigning: Boolean(process.env.WORLD_RP_SIGNING_KEY),
      aiWorkerSecret: Boolean(process.env.AI_WORKER_SHARED_SECRET),
      rewardSigner: Boolean(process.env.REWARD_SIGNER_PRIVATE_KEY),
    },
  });
}
