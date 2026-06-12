import { NextResponse } from "next/server";
import {
  createPublicClient,
  erc20Abi,
  formatUnits,
  http,
  isAddress,
  type Address,
} from "viem";
import { worldchain } from "viem/chains";
import {
  DEAD_WALLET_ADDRESS,
  NUCCA_TOKEN_ADDRESS,
  TOKEN_FACTS,
} from "@/lib/constants";
import { optionalServerEnv } from "@/lib/env";

function worldClient() {
  const rpcUrl = optionalServerEnv("WORLDCHAIN_RPC_URL");
  return createPublicClient({
    chain: worldchain,
    transport: http(rpcUrl ?? undefined),
  });
}

function optionalAddress(value: string | null): Address | null {
  return value && isAddress(value) ? value : null;
}

export async function GET() {
  try {
    const token = NUCCA_TOKEN_ADDRESS as Address;
    const client = worldClient();
    const rewardReserveAddress = optionalAddress(
      optionalServerEnv("REWARD_RESERVE_CONTRACT_ADDRESS"),
    );

    const [name, symbol, decimals, totalSupply, deadBalance, rewardReserveBalance] =
      await Promise.all([
        client.readContract({ address: token, abi: erc20Abi, functionName: "name" }),
        client.readContract({ address: token, abi: erc20Abi, functionName: "symbol" }),
        client.readContract({ address: token, abi: erc20Abi, functionName: "decimals" }),
        client.readContract({
          address: token,
          abi: erc20Abi,
          functionName: "totalSupply",
        }),
        client.readContract({
          address: token,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [DEAD_WALLET_ADDRESS],
        }),
        rewardReserveAddress
          ? client.readContract({
              address: token,
              abi: erc20Abi,
              functionName: "balanceOf",
              args: [rewardReserveAddress],
            })
          : Promise.resolve(null),
      ]);

    const totalSupplyTokens = Number(formatUnits(totalSupply, decimals));
    const burnedTokens = Number(formatUnits(deadBalance, decimals));
    const burnedPercent =
      totalSupplyTokens > 0
        ? Number(((burnedTokens / totalSupplyTokens) * 100).toFixed(4))
        : null;

    return NextResponse.json({
      ok: true,
      chain: {
        source: "worldchain_rpc",
        tokenAddress: token,
        name,
        symbol,
        decimals,
        totalSupply: totalSupplyTokens,
        burnedTokens,
        burnedPercent,
        reportedHolders: TOKEN_FACTS.holders,
        holdersSource:
          "manual_reported_metric_until_indexer_is_connected",
        rewardReserveBalance: rewardReserveBalance
          ? Number(formatUnits(rewardReserveBalance, decimals))
          : null,
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "WorldChain token read failed.",
      },
      { status: 503 },
    );
  }
}
