import { NextResponse } from "next/server";
import {
  BATTLE_FORMATS,
  BATTLE_MODES,
  HOUSE_COMMISSION_RULES,
  calculateBattleSplit,
  calculateMinimumContestNucca,
} from "@/lib/battle-economy";

export async function GET() {
  return NextResponse.json({
    ok: true,
    minimums: {
      solo: {
        flash24h: calculateMinimumContestNucca(BATTLE_MODES[1], BATTLE_FORMATS[0]),
        genesis48h: calculateMinimumContestNucca(BATTLE_MODES[0], BATTLE_FORMATS[0]),
      },
      crew3v3: {
        flash24h: calculateMinimumContestNucca(BATTLE_MODES[1], BATTLE_FORMATS[1]),
        genesis48h: calculateMinimumContestNucca(BATTLE_MODES[0], BATTLE_FORMATS[1]),
      },
    },
    maxContestNucca: null,
    licensedBettingEnabled: false,
    formats: BATTLE_FORMATS,
    modes: BATTLE_MODES.map((mode) => ({
      ...mode,
      split: calculateBattleSplit(mode),
    })),
    rules: HOUSE_COMMISSION_RULES,
    compliance:
      "Spectator NUCCA betting is intentionally disabled. It can only be enabled after legal licensing, geofencing, KYC/AML, responsible gaming controls, odds/risk controls, and World App review.",
  });
}
