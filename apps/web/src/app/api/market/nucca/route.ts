import { NextResponse } from "next/server";
import { fetchNuccaMarket } from "@/lib/dexscreener";

export async function GET() {
  try {
    const market = await fetchNuccaMarket();
    return NextResponse.json({ ok: true, market });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        market: {
          priceUsd: null,
          liquidityUsd: null,
          volume24h: null,
          txns24h: 0,
          trustedForRewards: false,
          warning:
            error instanceof Error
              ? error.message
              : "Market data unavailable.",
          url: null,
        },
      },
      { status: 503 },
    );
  }
}
