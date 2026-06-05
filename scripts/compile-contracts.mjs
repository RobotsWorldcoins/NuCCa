import fs from "node:fs";
import path from "node:path";
import solc from "solc";

const root = process.cwd();
const srcDir = path.join(root, "contracts", "src");
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

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const errors = output.errors ?? [];
const fatal = errors.filter((error) => error.severity === "error");

for (const error of errors) {
  const prefix = error.severity === "error" ? "ERROR" : "WARN";
  console.log(`${prefix}: ${error.formattedMessage}`);
}

if (fatal.length > 0) {
  process.exit(1);
}

console.log(`Compiled ${Object.keys(sources).length} Solidity source files.`);
