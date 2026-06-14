import { NextResponse } from "next/server";
import { z } from "zod";
import {
  CLAN_CREATION_COST_NUCCA,
  CLAN_MAX_MEMBERS,
} from "@/lib/game";
import { readSession } from "@/lib/session";
import { verifySpendReceipt } from "@/lib/spend-receipts";
import { clanCreationSink, clanIdFromName } from "@/lib/spend-sinks";
import { getSupabaseAdmin } from "@/lib/supabase";

const clanSchema = z.object({
  name: z.string().min(3).max(32),
  style: z.string().min(3).max(80),
  focus: z.string().min(3).max(120),
  logoUrl: z.string().url().optional(),
  paymentTxHash: z.string().startsWith("0x").optional(),
});

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
        "Clan preview created. A live clan requires a confirmed 100,000 NUCCA payment.",
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

  const expectedSink = clanCreationSink(body.data.name);
  const receipt = await verifySpendReceipt({
    transactionHash: body.data.paymentTxHash as `0x${string}`,
    userWallet: session.walletAddress,
    expectedAmountNucca: CLAN_CREATION_COST_NUCCA,
    expectedSink,
  });

  if (!receipt.ok) {
    return NextResponse.json(
      { ok: false, message: receipt.message },
      { status: 402 },
    );
  }

  const { data, error } = await supabase
    .from("clans")
    .insert({
      id,
      name: body.data.name,
      style: body.data.style,
      focus: body.data.focus,
      logo_url: body.data.logoUrl ?? null,
      owner_wallet: session.walletAddress,
      creation_fee_nucca: CLAN_CREATION_COST_NUCCA,
      max_members: CLAN_MAX_MEMBERS,
      payment_tx_hash: body.data.paymentTxHash,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: 409 },
    );
  }

  const { error: memberError } = await supabase.from("clan_members").insert({
    clan_id: id,
    wallet_address: session.walletAddress,
    role: "captain",
  });

  if (memberError) {
    return NextResponse.json(
      { ok: false, message: memberError.message },
      { status: 409 },
    );
  }

  return NextResponse.json({
    ok: true,
    clan: data,
    message: "Clan created and captain seat assigned.",
  });
}
