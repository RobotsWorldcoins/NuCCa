import { NextResponse } from "next/server";
import { z } from "zod";
import { CREATOR_MARKETPLACE_LISTINGS } from "@/lib/game";
import { readSession } from "@/lib/session";
import {
  verifyMarketplaceReceipt,
  verifySpendReceipt,
} from "@/lib/spend-receipts";
import { getSupabaseAdmin } from "@/lib/supabase";

const settleSchema = z.object({
  listingId: z.string().min(1).max(120),
  transactionHash: z.string().startsWith("0x"),
});

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Connect wallet before settling an item." },
      { status: 401 },
    );
  }

  const body = settleSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json(
      { ok: false, message: "Invalid marketplace settlement." },
      { status: 400 },
    );
  }

  const listing = CREATOR_MARKETPLACE_LISTINGS.find(
    (item) => item.id === body.data.listingId,
  );
  if (!listing) {
    return NextResponse.json(
      { ok: false, message: "Marketplace listing not found." },
      { status: 404 },
    );
  }

  const transactionHash = body.data.transactionHash as `0x${string}`;
  const receipt =
    listing.saleKind === "marketplace_resale" && listing.sellerWallet
      ? await verifyMarketplaceReceipt({
          transactionHash,
          buyerWallet: session.walletAddress,
          sellerWallet: listing.sellerWallet,
          expectedAmountNucca: listing.priceNucca,
          expectedListingId: `${listing.saleKind}:${listing.id}:${listing.itemId}`,
        })
      : await verifySpendReceipt({
          transactionHash,
          userWallet: session.walletAddress,
          expectedAmountNucca: listing.priceNucca,
          expectedSink: `${listing.saleKind}:${listing.id}:${listing.itemId}`,
        });

  if (!receipt.ok) {
    return NextResponse.json(
      { ok: false, message: receipt.message },
      { status: 402 },
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({
      ok: true,
      inventoryItem: {
        itemId: listing.itemId,
        itemType: listing.itemType,
        transactionHash,
        persisted: false,
      },
      message: "Item confirmed. Inventory persistence needs Supabase.",
    });
  }

  const { data, error } = await supabase
    .from("user_inventory_items")
    .upsert(
      {
        wallet_address: session.walletAddress,
        item_id: listing.itemId,
        item_type: listing.itemType,
        source: listing.saleKind,
        listing_id: listing.id,
        rarity: listing.rarity,
        reputation_points: listing.reputationPoints,
        attributes: listing.attributes,
        gameplay_use: listing.gameplayUse,
        price_nucca: listing.priceNucca,
        transaction_hash: transactionHash,
      },
      { onConflict: "wallet_address,item_id" },
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: 409 },
    );
  }

  return NextResponse.json({
    ok: true,
    inventoryItem: data,
    message: `${listing.itemName} added to your inventory.`,
  });
}
