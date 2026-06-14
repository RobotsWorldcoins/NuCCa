import { NextResponse } from "next/server";
import { DAILY_REWARD_POLICY } from "@/lib/economy";
import {
  DISCOVERY_RULES,
  GENESIS_MAP_ZONES,
  pickDiscoveryReward,
} from "@/lib/game";
import { TOKEN_FACTS } from "@/lib/constants";
import { readSession } from "@/lib/session";
import { verifySpendReceipt } from "@/lib/spend-receipts";
import { mapExtraScanSink } from "@/lib/spend-sinks";
import { getSupabaseAdmin } from "@/lib/supabase";

type ScanBody = {
  zoneId?: string;
  paid?: boolean;
  paymentReference?: string;
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Connect with WalletAuth first." },
      { status: 401 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as ScanBody;
  const paid = Boolean(body.paid);
  const zone =
    GENESIS_MAP_ZONES.find((candidate) => candidate.id === body.zoneId) ??
    GENESIS_MAP_ZONES[0];
  const scanDate = todayKey();
  const supabase = getSupabaseAdmin();

  if (paid && (!body.paymentReference || !body.paymentReference.startsWith("0x"))) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Extra scans cost 100 NUCCA and require a confirmed payment transaction before rewards are granted.",
      },
      { status: 402 },
    );
  }

  if (paid && body.paymentReference) {
    const expectedSink = mapExtraScanSink({
      walletAddress: session.walletAddress,
      scanDate,
      zoneId: zone.id,
    });
    const receipt = await verifySpendReceipt({
      transactionHash: body.paymentReference as `0x${string}`,
      userWallet: session.walletAddress,
      expectedAmountNucca: DAILY_REWARD_POLICY.paidMapScanCostNucca,
      expectedSink,
    });

    if (!receipt.ok) {
      return NextResponse.json(
        { ok: false, message: receipt.message },
        { status: 402 },
      );
    }
  }

  if (supabase) {
    const { data: previousScans, error: countError } = await supabase
      .from("map_scans")
      .select("id, paid")
      .eq("wallet_address", session.walletAddress)
      .eq("scan_date", scanDate);

    if (countError) {
      return NextResponse.json(
        { ok: false, message: "Map scan database check failed." },
        { status: 500 },
      );
    }

    const freeUsed = previousScans?.some((scan) => !scan.paid) ?? false;
    const paidUsed = previousScans?.filter((scan) => scan.paid).length ?? 0;

    if (!paid && freeUsed) {
      return NextResponse.json(
        { ok: false, message: "Free daily map scan already used." },
        { status: 409 },
      );
    }

    if (paid && paidUsed >= DAILY_REWARD_POLICY.maxPaidMapScansPerDay) {
      return NextResponse.json(
        { ok: false, message: "Maximum 10 extra map scans used today." },
        { status: 409 },
      );
    }
  }

  const scanIndex = Date.now().toString(36);
  const reward = pickDiscoveryReward(
    `${session.walletAddress}:${scanDate}:${zone.id}:${paid}:${scanIndex}`,
    paid,
  );
  const tokenReward =
    reward.type === "nucca" && !paid
      ? Number(
          (
            DAILY_REWARD_POLICY.dailyDiscoveryNuccaPool /
            Math.max(1, TOKEN_FACTS.holders)
          ).toFixed(6),
        )
      : 0;

  if (supabase) {
    const { error } = await supabase.from("map_scans").insert({
      wallet_address: session.walletAddress,
      scan_date: scanDate,
      zone_id: zone.id,
      paid,
      paid_cost_nucca: paid ? DAILY_REWARD_POLICY.paidMapScanCostNucca : 0,
      reward_id: reward.id,
      reward_type: reward.type,
      token_reward: tokenReward,
      xp_reward: reward.xp ?? 0,
      reputation_points: reward.reputationPoints ?? 0,
      attributes: reward.attributes ?? {},
    });

    if (error) {
      return NextResponse.json(
        { ok: false, message: "Map scan could not be saved." },
        { status: 409 },
      );
    }
  }

  return NextResponse.json({
    ok: true,
    scan: {
      zone,
      paid,
      paidCostNucca: paid ? DAILY_REWARD_POLICY.paidMapScanCostNucca : 0,
      reward,
      tokenReward,
      rankingPoints: 15,
      dailyNuccaPool: DAILY_REWARD_POLICY.dailyDiscoveryNuccaPool,
      maxPaidScans: DAILY_REWARD_POLICY.maxPaidMapScansPerDay,
      rules: DISCOVERY_RULES,
      productionNote: paid
        ? "Production must require confirmed NUCCA payment before granting this scan."
        : "Free daily scan result.",
    },
  });
}
