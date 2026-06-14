import { encodeFunctionData, type Address } from "viem";
import {
  MARKETPLACE_COMMISSION_BPS,
  NUCCA_SPEND_ROUTER_ADDRESS,
  NUCCA_TOKEN_ADDRESS,
  WORLD_CHAIN_ID,
} from "@/lib/constants";
import { PERMIT2_APPROVE_ABI, PERMIT2_WORLDCHAIN } from "@/lib/swap";

export type SpendCheckoutKind =
  | "official_item"
  | "marketplace_resale"
  | "clan_creation"
  | "map_extra_scan"
  | "music_export"
  | "battle_entry";

export const NUCCA_SPEND_ROUTER_ABI = [
  {
    type: "event",
    name: "Spent",
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "sink", type: "string" },
    ],
  },
  {
    type: "event",
    name: "MarketplaceSale",
    inputs: [
      { indexed: true, name: "buyer", type: "address" },
      { indexed: true, name: "seller", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "treasuryFee", type: "uint256" },
      { indexed: false, name: "listingId", type: "string" },
    ],
  },
  {
    type: "function",
    name: "spendWithPermit2",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amount", type: "uint160" },
      { name: "sink", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "spendToTreasuryWithPermit2",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amount", type: "uint160" },
      { name: "sink", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "marketplaceSaleWithPermit2",
    stateMutability: "nonpayable",
    inputs: [
      { name: "seller", type: "address" },
      { name: "amount", type: "uint160" },
      { name: "listingId", type: "string" },
    ],
    outputs: [],
  },
] as const;

export const SPEND_TOKEN_DECIMALS = 18;

export function nuccaToBaseUnits(amountNucca: number) {
  if (!Number.isFinite(amountNucca) || amountNucca <= 0) {
    throw new Error("Invalid NUCCA amount.");
  }

  return BigInt(Math.round(amountNucca * 1_000_000)) * BigInt(10) ** BigInt(12);
}

export function marketplaceSplit(amountNucca: number) {
  const fee = (amountNucca * MARKETPLACE_COMMISSION_BPS) / 10_000;
  return {
    treasuryFeeNucca: fee,
    sellerReceivesNucca: amountNucca - fee,
  };
}

export function buildSpendCheckout({
  amountNucca,
  kind,
  seller,
  sink,
}: {
  amountNucca: number;
  kind: SpendCheckoutKind;
  seller?: Address;
  sink: string;
}) {
  if (!NUCCA_SPEND_ROUTER_ADDRESS) {
    throw new Error("NUCCA spend router is not configured.");
  }

  const amount = nuccaToBaseUnits(amountNucca);
  const spendRouter = NUCCA_SPEND_ROUTER_ADDRESS as Address;
  const permitData = encodeFunctionData({
    abi: PERMIT2_APPROVE_ABI,
    functionName: "approve",
    args: [NUCCA_TOKEN_ADDRESS as Address, spendRouter, amount, 0],
  });

  let spendData: `0x${string}`;
  if (kind === "marketplace_resale") {
    if (!seller) throw new Error("Seller wallet is required for resale.");
    spendData = encodeFunctionData({
      abi: NUCCA_SPEND_ROUTER_ABI,
      functionName: "marketplaceSaleWithPermit2",
      args: [seller, amount, sink],
    });
  } else if (kind === "official_item" || kind === "clan_creation") {
    spendData = encodeFunctionData({
      abi: NUCCA_SPEND_ROUTER_ABI,
      functionName: "spendToTreasuryWithPermit2",
      args: [amount, sink],
    });
  } else {
    spendData = encodeFunctionData({
      abi: NUCCA_SPEND_ROUTER_ABI,
      functionName: "spendWithPermit2",
      args: [amount, sink],
    });
  }

  return {
    chainId: WORLD_CHAIN_ID,
    routerAddress: spendRouter,
    amount: amount.toString(),
    transactions: [
      {
        to: PERMIT2_WORLDCHAIN,
        data: permitData,
      },
      {
        to: spendRouter,
        data: spendData,
      },
    ],
  };
}
