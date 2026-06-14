# World Developer Portal Copy

Use this copy for the NuCCa Genesis Studio production submission. Replace the
support email with a real monitored email before submitting.

## Core App Fields

**App name**

NuCCa Genesis Studio

**Production URL**

https://nucca.vercel.app

**Terms URL**

https://nucca.vercel.app/terms

**Privacy Policy URL**

https://nucca.vercel.app/privacy

**Support email**

support@YOUR_DOMAIN_HERE

**Category**

Entertainment / Music / Games

**Short description**

Create music, customize your creator identity, and compete in NUCCA-powered skill battles.

**Full description**

NuCCa Genesis Studio is a mobile music creator game for World App. Users sign in
with WalletAuth, verify human status with World ID, build in-app tracks from
samples and queued free AI tools, customize a creator performer, join clans,
enter skill-based battles, climb monthly rankings, and use NUCCA for progression
and marketplace utility.

The app is designed as a creator game, not an investment product. It does not
promise profit, yield, APY, staking returns, price appreciation, passive income,
or guaranteed token rewards. Token rewards are capped and can be reduced or
paused to protect the economy and prevent abuse.

**Review notes**

NuCCa Genesis Studio uses MiniKit WalletAuth for login, IDKit 4.x for human
verification, and MiniKit Send Transaction for user-approved World Chain
transactions. Spectator token betting is not enabled. Battles are skill-based
creator contests using in-app music compositions and ranking rules. Swap
execution remains disabled until the NuccaSwapRouter is deployed, audited,
configured in Vercel, and allowlisted in the World Developer Portal.
Marketplace purchases, clan creation, map extra scans, and future export fees
use NuccaSpendRouter with Permit2 and receipt confirmation before paid benefits
are settled.

**Keywords**

music, creator, game, NUCCA, World Chain, clans, rankings, battles, marketplace

## World Integration Fields

**World App ID**

Create in the World Developer Portal, then set it as `NEXT_PUBLIC_WORLD_APP_ID`.

**World ID RP ID**

Create/register the relying party in the World Developer Portal, then set it as
`NEXT_PUBLIC_WORLD_RP_ID`.

**World environment**

production

**Chain**

World Chain mainnet, chain ID `480`.

**Wallet authentication purpose**

Sign users into NuCCa Genesis Studio with their World App wallet so progress,
referrals, compositions, claims, clans, marketplace actions, and transactions can
be attached to one account.

**World ID purpose**

Verify that a user is a real human, reduce farming abuse, prevent self-referral
abuse, and protect capped reward systems. Session proofs are used for returning
user continuity; one-time uniqueness proofs are used only for one-time actions.

**Transaction permission purpose**

Allow users to approve NUCCA, WLD, or USDC transactions inside World App for
progression purchases, marketplace actions, contest entries, clan creation, and
optional in-app swaps after the contracts are allowlisted.

## Required Portal Permissions

Enable Mini App commands:

- Wallet Authentication
- Send Transaction
- Share

Permit2 tokens:

- NUCCA: `0x3f1F7daCdAb79FDedC16693871be7A63f05aB465`
- WLD: `0x2cFc85d8E48F8EAB294be644d9E25C3030863003`
- USDC: `0x79A02482A880bCE3F13e09Da970dC34db4CD24d1`

Contract entrypoints:

- Permit2: `0x000000000022D473030F116dDEE9F6B43aC78BA3`
  - `approve(address,address,uint160,uint48)`
- NuccaSwapRouter: `<DEPLOYED_ROUTER_ADDRESS>`
  - `swapV2ExactInputWithPermit2(address,address,uint160,uint256,uint64)`
  - `swapExactInputSingleWithPermit2((address,address,uint24,uint160,uint256,uint160,uint64))`
  - `swapV2ToV3WithPermit2(address,address,address,uint24,uint160,uint256,uint64)`
  - `swapV3ToV2WithPermit2(address,address,address,uint24,uint160,uint256,uint64)`
- NuccaSpendRouter: `<DEPLOYED_SPEND_ROUTER_ADDRESS>`
  - `spendWithPermit2(uint160,string)`
  - `spendToTreasuryWithPermit2(uint160,string)`
  - `marketplaceSaleWithPermit2(address,uint160,string)`

## Vercel Environment Variables

Public:

- `NEXT_PUBLIC_WORLD_APP_ID`
- `NEXT_PUBLIC_WORLD_RP_ID`
- `NEXT_PUBLIC_WORLD_ENV=production`
- `NEXT_PUBLIC_WORLD_CHAIN_ID=480`
- `NEXT_PUBLIC_NUCCA_TOKEN_ADDRESS=0x3f1F7daCdAb79FDedC16693871be7A63f05aB465`
- `NEXT_PUBLIC_NUCCA_SWAP_ROUTER_ADDRESS=<DEPLOYED_ROUTER_ADDRESS>`
- `NEXT_PUBLIC_NUCCA_SPEND_ROUTER_ADDRESS=<DEPLOYED_SPEND_ROUTER_ADDRESS>`

Server-only:

- `WORLD_RP_SIGNING_KEY`
- `SESSION_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_WALLET_ADDRESS`
- `ADMIN_HEALTH_SECRET`
- `AI_WORKER_SHARED_SECRET`
- `REWARD_SIGNER_PRIVATE_KEY`
- `REWARD_RESERVE_CONTRACT_ADDRESS`
- `NUCCA_SPEND_ROUTER_ADDRESS`
- `WORLDCHAIN_RPC_URL`

Never set or expose:

- Main admin wallet private key
- Treasury private key
- Supabase service role in public variables
- RP signing key in public variables
- Reward signer private key in public variables

## Asset Copy

**Icon guidance**

Use the NUCCA token logo as the small icon and the NuCCa Genesis Studio logo as
the hero/store image. Export square PNG/WebP versions at the exact portal sizes.

**Screenshot captions**

- Build in-app music loops from samples and queued free AI tools.
- Customize your creator performer with RPG-style music equipment.
- Buy RPG items with NUCCA; resale marketplace fee is 10%.
- Enter skill-based creator battles and climb monthly rankings.
- Join or create clans for 3v3 music competition.
- Swap NUCCA, WLD, and USDC only after router deployment and allowlisting.

## Submission Warnings

Do not use these words in the public listing:

- APY
- yield
- staking rewards
- passive income
- guaranteed rewards
- profit
- betting
- casino
- gamble
- investment

Use these safer phrases:

- creator game
- skill-based music battles
- capped rewards
- progression utility
- marketplace utility
- monthly rankings
- human-verified anti-abuse
