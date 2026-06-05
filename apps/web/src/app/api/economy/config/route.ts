import { NextResponse } from "next/server";
import { ECONOMY_SPLIT, TOKEN_FACTS } from "@/lib/constants";
import { DAILY_REWARD_POLICY } from "@/lib/economy";

export async function GET() {
  return NextResponse.json({
    ok: true,
    tokenFacts: TOKEN_FACTS,
    split: ECONOMY_SPLIT,
    dailyRewardPolicy: DAILY_REWARD_POLICY,
    warnings: [
      "No APY or yield is offered.",
      "NUCCA rewards are capped by reserve budgets.",
      "Spot price data is not used without trust guards.",
    ],
  });
}
