import {
  createPublicClient,
  http,
  parseEventLogs,
  type Address,
} from "viem";
import { worldchain } from "viem/chains";
import { NUCCA_SPEND_ROUTER_ADDRESS } from "@/lib/constants";
import { NUCCA_SPEND_ROUTER_ABI, nuccaToBaseUnits } from "@/lib/spend";

type SpendReceiptClient = {
  getTransactionReceipt: (input: { hash: `0x${string}` }) => Promise<{
    status: "success" | "reverted";
    logs: Parameters<typeof parseEventLogs>[0]["logs"];
  }>;
};

let spendReceiptClient: SpendReceiptClient | null = null;

function getSpendReceiptClient() {
  if (!spendReceiptClient) {
    spendReceiptClient = createPublicClient({
      chain: worldchain,
      transport: http(process.env.WORLDCHAIN_RPC_URL ?? worldchain.rpcUrls.default.http[0]),
    }) as SpendReceiptClient;
  }

  return spendReceiptClient;
}

export async function verifySpendReceipt({
  expectedAmountNucca,
  expectedSink,
  transactionHash,
  userWallet,
}: {
  expectedAmountNucca: number;
  expectedSink: string;
  transactionHash: `0x${string}`;
  userWallet: string;
}) {
  if (!NUCCA_SPEND_ROUTER_ADDRESS) {
    return { ok: false, message: "NUCCA payment verifier is not configured." };
  }

  const receipt = await getSpendReceiptClient().getTransactionReceipt({
    hash: transactionHash,
  });

  if (receipt.status !== "success") {
    return { ok: false, message: "NUCCA payment transaction failed." };
  }

  const logs = parseEventLogs({
    abi: NUCCA_SPEND_ROUTER_ABI,
    logs: receipt.logs,
    eventName: "Spent",
    strict: false,
  });
  const routerAddress = NUCCA_SPEND_ROUTER_ADDRESS.toLowerCase();
  const expectedAmount = nuccaToBaseUnits(expectedAmountNucca);
  const userAddress = userWallet.toLowerCase();

  const matchingSpend = logs.find((log) => {
    if (log.address.toLowerCase() !== routerAddress) return false;
    if (log.eventName !== "Spent") return false;

    const args = log.args as {
      user?: Address;
      amount?: bigint;
      sink?: string;
    };

    return (
      args.user?.toLowerCase() === userAddress &&
      args.amount === expectedAmount &&
      args.sink === expectedSink
    );
  });

  if (!matchingSpend) {
    return {
      ok: false,
      message: "NUCCA payment receipt does not match this action.",
    };
  }

  return {
    ok: true,
    transactionHash,
  };
}

export async function verifyMarketplaceReceipt({
  buyerWallet,
  expectedAmountNucca,
  expectedListingId,
  sellerWallet,
  transactionHash,
}: {
  buyerWallet: string;
  expectedAmountNucca: number;
  expectedListingId: string;
  sellerWallet: string;
  transactionHash: `0x${string}`;
}) {
  if (!NUCCA_SPEND_ROUTER_ADDRESS) {
    return { ok: false, message: "NUCCA payment verifier is not configured." };
  }

  const receipt = await getSpendReceiptClient().getTransactionReceipt({
    hash: transactionHash,
  });

  if (receipt.status !== "success") {
    return { ok: false, message: "Marketplace transaction failed." };
  }

  const logs = parseEventLogs({
    abi: NUCCA_SPEND_ROUTER_ABI,
    logs: receipt.logs,
    eventName: "MarketplaceSale",
    strict: false,
  });
  const routerAddress = NUCCA_SPEND_ROUTER_ADDRESS.toLowerCase();
  const expectedAmount = nuccaToBaseUnits(expectedAmountNucca);
  const buyerAddress = buyerWallet.toLowerCase();
  const sellerAddress = sellerWallet.toLowerCase();

  const matchingSale = logs.find((log) => {
    if (log.address.toLowerCase() !== routerAddress) return false;
    if (log.eventName !== "MarketplaceSale") return false;

    const args = log.args as {
      buyer?: Address;
      seller?: Address;
      amount?: bigint;
      listingId?: string;
    };

    return (
      args.buyer?.toLowerCase() === buyerAddress &&
      args.seller?.toLowerCase() === sellerAddress &&
      args.amount === expectedAmount &&
      args.listingId === expectedListingId
    );
  });

  if (!matchingSale) {
    return {
      ok: false,
      message: "Marketplace receipt does not match this listing.",
    };
  }

  return {
    ok: true,
    transactionHash,
  };
}
