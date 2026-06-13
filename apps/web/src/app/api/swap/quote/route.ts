import { NextRequest, NextResponse } from "next/server";
import { quoteNativeSwap } from "@/lib/swap-quote";
import { type SwapRouteId } from "@/lib/swap";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  return handleQuote({
    routeId: searchParams.get("routeId"),
    amount: searchParams.get("amount"),
    slippageBps: searchParams.get("slippageBps"),
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    routeId?: string;
    amount?: string;
    slippageBps?: number;
  };

  return handleQuote({
    routeId: body.routeId ?? null,
    amount: body.amount ?? null,
    slippageBps:
      typeof body.slippageBps === "number"
        ? String(body.slippageBps)
        : null,
  });
}

async function handleQuote({
  routeId,
  amount,
  slippageBps,
}: {
  routeId: string | null;
  amount: string | null;
  slippageBps: string | null;
}) {
  try {
    if (!routeId || !amount) {
      return NextResponse.json(
        { ok: false, message: "routeId and amount are required." },
        { status: 400 },
      );
    }

    const quote = await quoteNativeSwap({
      routeId: routeId as SwapRouteId,
      amount,
      slippageBps: slippageBps ? Number(slippageBps) : undefined,
    });

    return NextResponse.json({
      ok: true,
      quote,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Swap quote unavailable.",
      },
      { status: 503 },
    );
  }
}
