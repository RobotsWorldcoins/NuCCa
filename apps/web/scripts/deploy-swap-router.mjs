import fs from "node:fs";
import path from "node:path";
import solc from "solc";
import {
  createPublicClient,
  createWalletClient,
  getContract,
  http,
  parseAbi,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { worldchain } from "viem/chains";

const root = path.resolve(process.cwd(), "..", "..");
const srcDir = path.join(root, "contracts", "src");

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
if (!DEPLOYER_PRIVATE_KEY) {
  throw new Error("DEPLOYER_PRIVATE_KEY is required.");
}

const addresses = {
  permit2: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
  v2Router: "0x541aB7c31A119441eF3575F6973277DE0eF460bd",
  v3Router: "0x091AD9e2e6e5eD44c1c66dB50e49A601F9f36cF6",
  nucca: "0x3f1F7daCdAb79FDedC16693871be7A63f05aB465",
  wld: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
  usdc: "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1",
};

const account = privateKeyToAccount(
  DEPLOYER_PRIVATE_KEY.startsWith("0x")
    ? DEPLOYER_PRIVATE_KEY
    : `0x${DEPLOYER_PRIVATE_KEY}`,
);
const transport = http(process.env.WORLDCHAIN_RPC_URL || worldchain.rpcUrls.default.http[0]);
const publicClient = createPublicClient({ chain: worldchain, transport });
const walletClient = createWalletClient({ account, chain: worldchain, transport });

const output = compileContracts();
const artifact = output.contracts["contracts/src/NuccaSwapRouter.sol"].NuccaSwapRouter;

console.log(`Deploying NuccaSwapRouter from ${account.address}`);
const hash = await walletClient.deployContract({
  abi: artifact.abi,
  bytecode: `0x${artifact.evm.bytecode.object}`,
  args: [
    addresses.permit2,
    addresses.v2Router,
    addresses.v3Router,
    addresses.nucca,
    addresses.wld,
    addresses.usdc,
  ],
});
console.log(`Deployment tx: ${hash}`);

const receipt = await publicClient.waitForTransactionReceipt({ hash });
if (!receipt.contractAddress) {
  throw new Error("Deployment did not return a contract address.");
}
console.log(`NuccaSwapRouter: ${receipt.contractAddress}`);

const router = getContract({
  address: receipt.contractAddress,
  abi: parseAbi([
    "function setAllowedV2Pool(address tokenIn,address tokenOut,bool allowed)",
    "function setAllowedPool(address tokenIn,address tokenOut,uint24 fee,bool allowed)",
  ]),
  client: { public: publicClient, wallet: walletClient },
});

const setupCalls = [
  () => router.write.setAllowedV2Pool([addresses.nucca, addresses.wld, true]),
  () => router.write.setAllowedV2Pool([addresses.wld, addresses.nucca, true]),
];

for (const fee of [100, 500, 3000, 10000]) {
  setupCalls.push(() => router.write.setAllowedPool([addresses.wld, addresses.usdc, fee, true]));
  setupCalls.push(() => router.write.setAllowedPool([addresses.usdc, addresses.wld, fee, true]));
}

for (const call of setupCalls) {
  const setupHash = await call();
  console.log(`Setup tx: ${setupHash}`);
  await publicClient.waitForTransactionReceipt({ hash: setupHash });
}

console.log("");
console.log("Next steps:");
console.log(`1. Set NEXT_PUBLIC_NUCCA_SWAP_ROUTER_ADDRESS=${receipt.contractAddress}`);
console.log("2. Add Permit2 tokens in World Developer Portal: NUCCA, WLD, USDC");
console.log("3. Add contract entrypoints: Permit2.approve and NuccaSwapRouter swap methods");
console.log("4. Redeploy Vercel production.");

function compileContracts() {
  const sources = {};
  for (const file of fs.readdirSync(srcDir)) {
    if (!file.endsWith(".sol")) continue;
    const absolute = path.join(srcDir, file);
    sources[`contracts/src/${file}`] = {
      content: fs.readFileSync(absolute, "utf8"),
    };
  }

  const input = {
    language: "Solidity",
    sources,
    settings: {
      optimizer: { enabled: true, runs: 200 },
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode.object"],
        },
      },
    },
  };

  const result = JSON.parse(solc.compile(JSON.stringify(input)));
  const fatal = (result.errors ?? []).filter((error) => error.severity === "error");
  for (const error of result.errors ?? []) {
    const prefix = error.severity === "error" ? "ERROR" : "WARN";
    console.log(`${prefix}: ${error.formattedMessage}`);
  }
  if (fatal.length > 0) {
    throw new Error("Solidity compilation failed.");
  }
  return result;
}
