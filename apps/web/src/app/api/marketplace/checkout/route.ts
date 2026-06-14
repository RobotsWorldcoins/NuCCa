import { NextResponse } from "next/server";
import { z } from "zod";
import { MARKETPLACE_COMMISSION_PERCENT } from "@/lib/constants";
import { CREATOR_MARKETPLACE_LISTINGS } from "@/lib/game";
import { readSession } from "@/lib/session";
import { buildSpendCheckout, marketplaceSplit } from "@/lib/spend";

const checkoutSchema = z.object({
  listingId: z.string().min(1).max(120),
});

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Connect with WalletAuth before buying items." },
      { status: 401 },
    );
  }

  const body = checkoutSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json(
      { ok: false, message: "Invalid marketplace checkout." },
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

  if (
    listing.sellerWallet &&
    listing.sellerWallet.toLowerCase() === session.walletAddress.toLowerCase()
  ) {
    return NextResponse.json(
      { ok: false, message: "You cannot buy your own marketplace listing." },
      { status: 400 },
    );
  }

  if (listing.saleKind === "marketplace_resale" && !listing.sellerWallet) {
    return NextResponse.json(
      { ok: false, message: "Resale listing is missing a seller wallet." },
      { status: 503 },
    );
  }

  try {
    const checkout = buildSpendCheckout({
      amountNucca: listing.priceNucca,
      kind: listing.saleKind,
      seller: listing.sellerWallet,
      sink: `${listing.saleKind}:${listing.id}:${listing.itemId}`,
    });
    const split = marketplaceSplit(listing.priceNucca);

    return NextResponse.json({
      ok: true,
      checkout,
      listing: {
        id: listing.id,
        itemId: listing.itemId,
        itemName: listing.itemName,
        saleKind: listing.saleKind,
        priceNucca: listing.priceNucca,
        rarity: listing.rarity,
        attributes: listing.attributes,
        reputationPoints: listing.reputationPoints,
      },
      settlement:
        listing.saleKind === "marketplace_resale"
          ? {
              marketplaceCommissionPercent: MARKETPLACE_COMMISSION_PERCENT,
              treasuryFeeNucca: split.treasuryFeeNucca,
              sellerReceivesNucca: split.sellerReceivesNucca,
            }
          : {
              marketplaceCommissionPercent: 0,
              treasuryFeeNucca: listing.priceNucca,
              sellerReceivesNucca: 0,
            },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Marketplace checkout unavailable.",
      },
      { status: 503 },
    );
  }
}
