import { NextResponse } from "next/server";
import { adminWalletConfigured } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  const configuredSecret = process.env.ADMIN_HEALTH_SECRET;
  const providedSecret = request.headers.get("x-admin-health-secret");
  const canInspect = Boolean(
    configuredSecret && providedSecret && providedSecret === configuredSecret,
  );

  return NextResponse.json({
    ok: true,
    checks: canInspect
      ? {
          adminWalletConfigured: adminWalletConfigured(),
          supabase: Boolean(getSupabaseAdmin()),
          rpSigning: Boolean(process.env.WORLD_RP_SIGNING_KEY),
          aiWorkerSecret: Boolean(process.env.AI_WORKER_SHARED_SECRET),
          rewardSigner: Boolean(process.env.REWARD_SIGNER_PRIVATE_KEY),
          rewardReserve: Boolean(process.env.REWARD_RESERVE_CONTRACT_ADDRESS),
        }
      : "restricted",
  });
}
