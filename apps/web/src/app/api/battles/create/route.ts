import { NextResponse } from "next/server";
import { z } from "zod";
import {
  calculateBattleSplit,
  calculateMinimumContestNucca,
  getBattleFormat,
  getBattleMode,
} from "@/lib/battle-economy";
import { readSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";

const battleSchema = z.object({
  compositionId: z.string().min(8),
  opponentWallet: z.string().startsWith("0x").optional(),
  mode: z.enum(["open", "direct"]).default("open"),
  battleModeId: z.enum(["genesis-duel", "flash-battle"]).default("genesis-duel"),
  battleFormatId: z.enum(["solo-1v1", "crew-3v3"]).default("solo-1v1"),
  totalContestNucca: z.number().positive().optional(),
});

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "WalletAuth is required to create battles." },
      { status: 401 },
    );
  }

  const body = battleSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ ok: false, message: "Invalid battle." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const battleMode = getBattleMode(body.data.battleModeId);
  const battleFormat = getBattleFormat(body.data.battleFormatId);
  const split = calculateBattleSplit(
    battleMode,
    body.data.totalContestNucca ??
      calculateMinimumContestNucca(battleMode, battleFormat),
    battleFormat,
  );

  if (!supabase) {
    return NextResponse.json({
      ok: true,
      battle: {
        id: crypto.randomUUID(),
        creatorWallet: session.walletAddress,
        compositionId: body.data.compositionId,
        mode: body.data.mode,
        battleFormat,
        battleMode,
        split,
        status: "preview_open",
        ranked: false,
      },
      message:
        "Preview battle. Spectator NUCCA betting is disabled; supporters earn Hype/XP/cosmetics.",
    });
  }

  const { data: composition } = await supabase
    .from("compositions")
    .select("id, ranked_eligible")
    .eq("id", body.data.compositionId)
    .eq("wallet_address", session.walletAddress)
    .maybeSingle();

  if (!composition?.ranked_eligible) {
    return NextResponse.json(
      { ok: false, message: "Only in-app builder compositions can enter ranked battles." },
      { status: 403 },
    );
  }

  const { data, error } = await supabase
    .from("battles")
    .insert({
      creator_wallet: session.walletAddress,
      opponent_wallet: body.data.opponentWallet ?? null,
      composition_a_id: body.data.compositionId,
      mode: body.data.mode,
      status: "open",
      ranked: true,
      duration_hours: battleMode.durationHours,
      battle_format: battleFormat.id,
      team_size: battleFormat.teamSize,
      entry_fee_nucca: split.creatorEntryNucca,
      platform_fee_nucca: split.platformCommission,
      league_reserve_fee_nucca: split.monthlyLeagueReserve,
      reward_nucca: split.creatorPrize,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, battle: data, battleMode, battleFormat, split });
}
