import { NextResponse } from "next/server";
import { z } from "zod";
import { DAILY_REWARD_POLICY } from "@/lib/economy";
import {
  CLAN_CREATION_COST_NUCCA,
  GENESIS_MAP_ZONES,
  MUSIC_EXPORT_COST_NUCCA,
} from "@/lib/game";
import { readSession } from "@/lib/session";
import { buildSpendCheckout, type SpendCheckoutKind } from "@/lib/spend";
import {
  clanCreationSink,
  mapExtraScanSink,
  musicExportSink,
} from "@/lib/spend-sinks";

const spendCheckoutSchema = z.object({
  kind: z.enum(["clan_creation", "map_extra_scan", "music_export"]),
  targetId: z.string().min(1).max(120),
});

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Connect wallet before confirming a NUCCA payment." },
      { status: 401 },
    );
  }

  const body = spendCheckoutSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json(
      { ok: false, message: "Invalid NUCCA checkout." },
      { status: 400 },
    );
  }

  let amountNucca: number;
  let sink: string;
  let kind: SpendCheckoutKind = body.data.kind;

  try {
    if (body.data.kind === "clan_creation") {
      amountNucca = CLAN_CREATION_COST_NUCCA;
      sink = clanCreationSink(body.data.targetId);
    } else if (body.data.kind === "map_extra_scan") {
      const zone = GENESIS_MAP_ZONES.find((item) => item.id === body.data.targetId);
      if (!zone) {
        return NextResponse.json(
          { ok: false, message: "Unknown map zone." },
          { status: 404 },
        );
      }

      amountNucca = DAILY_REWARD_POLICY.paidMapScanCostNucca;
      sink = mapExtraScanSink({
        walletAddress: session.walletAddress,
        scanDate: todayKey(),
        zoneId: zone.id,
      });
    } else {
      amountNucca = MUSIC_EXPORT_COST_NUCCA;
      sink = musicExportSink({
        walletAddress: session.walletAddress,
        compositionId: body.data.targetId,
      });
      kind = "music_export";
    }

    const checkout = buildSpendCheckout({
      amountNucca,
      kind,
      sink,
    });

    return NextResponse.json({
      ok: true,
      checkout,
      spend: {
        kind,
        amountNucca,
        sink,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "NUCCA checkout unavailable.",
      },
      { status: 503 },
    );
  }
}
