import { NextResponse } from "next/server";
import { z } from "zod";
import {
  CLAN_CREATION_COST_NUCCA,
  CLAN_MAX_MEMBERS,
} from "@/lib/game";
import { readSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";

const clanSchema = z.object({
  name: z.string().min(3).max(32),
  style: z.string().min(3).max(80),
  focus: z.string().min(3).max(120),
  logoUrl: z.string().url().optional(),
  paymentTxHash: z.string().startsWith("0x").optional(),
});

function clanIdFromName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "WalletAuth is required to create a clan." },
      { status: 401 },
    );
  }

  const body = clanSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json(
      { ok: false, message: "Invalid clan details." },
      { status: 400 },
    );
  }

  const id = clanIdFromName(body.data.name);
  if (!id) {
    return NextResponse.json(
      { ok: false, message: "Clan name must include letters or numbers." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({
      ok: true,
      clan: {
        id,
        name: body.data.name,
        style: body.data.style,
        focus: body.data.focus,
        logoUrl: body.data.logoUrl ?? null,
        ownerWallet: session.walletAddress,
        members: 1,
        maxMembers: CLAN_MAX_MEMBERS,
        creationCostNucca: CLAN_CREATION_COST_NUCCA,
        persisted: false,
      },
      message:
        "Preview clan created. Production requires a confirmed 100,000 NUCCA treasury payment.",
    });
  }

  if (!body.data.paymentTxHash) {
    return NextResponse.json(
      {
        ok: false,
        requiresPayment: true,
        costNucca: CLAN_CREATION_COST_NUCCA,
        maxMembers: CLAN_MAX_MEMBERS,
        message:
          "Pay 100,000 NUCCA to create a clan. The app must verify the WorldChain transaction before persistence.",
      },
      { status: 402 },
    );
  }

  return NextResponse.json(
    {
      ok: false,
      message:
        "Clan payment receipt verification is not deployed yet. Do not persist paid clans until contract receipt verification is wired.",
    },
    { status: 503 },
  );
}
