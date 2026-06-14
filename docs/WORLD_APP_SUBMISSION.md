# World App Submission Checklist

## Portal Setup

Create the app in World Developer Portal:

- App name: `NuCCa Genesis Studio`
- App type: Mini App
- Production URL: `https://nucca.vercel.app`
- Terms URL: `https://nucca.vercel.app/terms`
- Privacy URL: `https://nucca.vercel.app/privacy`
- Chain: World Chain mainnet
- App ID: copy to `NEXT_PUBLIC_WORLD_APP_ID`
- RP ID: copy to `NEXT_PUBLIC_WORLD_RP_ID`
- RP signing key: copy once to `WORLD_RP_SIGNING_KEY`

Use production public values before review:

```bash
NEXT_PUBLIC_WORLD_ENV=production
NEXT_PUBLIC_WORLD_CHAIN_ID=480
NEXT_PUBLIC_NUCCA_TOKEN_ADDRESS=0x3f1F7daCdAb79FDedC16693871be7A63f05aB465
NEXT_PUBLIC_NUCCA_SWAP_ROUTER_ADDRESS=<deployed_router>
NEXT_PUBLIC_NUCCA_SPEND_ROUTER_ADDRESS=<deployed_spend_router>
```

Use server-only values in Vercel:

```bash
WORLD_RP_SIGNING_KEY=<portal_rp_signing_key>
SESSION_SECRET=<strong_random_32+_bytes>
SUPABASE_URL=<supabase_project_url>
SUPABASE_SERVICE_ROLE_KEY=<server_only_service_role>
ADMIN_WALLET_ADDRESS=<admin_wallet_address>
ADMIN_HEALTH_SECRET=<strong_random_health_secret>
AI_WORKER_SHARED_SECRET=<strong_random_worker_secret>
NUCCA_SPEND_ROUTER_ADDRESS=<deployed_spend_router>
REWARD_SIGNER_PRIVATE_KEY=<capped_reward_signer_key>
REWARD_RESERVE_CONTRACT_ADDRESS=<funded_reward_distributor>
WORLDCHAIN_RPC_URL=https://worldchain-mainnet.g.alchemy.com/public
```

## Description For Review

Short description:

`Create music, customize your creator identity, and compete in NUCCA-powered skill battles.`

Avoid:

- APY
- Yield
- Passive income
- Investment language
- Guaranteed rewards
- Gambling wording
- "Earn money"
- "Profit"

## MiniKit And World ID

Required live integrations:

- `MiniKit.walletAuth()` for login.
- IDKit 4.x for human verification.
- `MiniKit.sendTransaction()` for NUCCA spends/swaps after contract allowlisting.

## Transaction Permissions

Permit2 tokens:

- NUCCA: `0x3f1F7daCdAb79FDedC16693871be7A63f05aB465`
- WLD: `0x2cFc85d8E48F8EAB294be644d9E25C3030863003`
- USDC: `0x79A02482A880bCE3F13e09Da970dC34db4CD24d1`

Contract entrypoints:

- Permit2: `0x000000000022D473030F116dDEE9F6B43aC78BA3`
  - `approve(address,address,uint160,uint48)`
- NuccaSwapRouter: `<deployed_router>`
  - `swapV2ExactInputWithPermit2(address,address,uint160,uint256,uint64)`
  - `swapExactInputSingleWithPermit2((address,address,uint24,uint160,uint256,uint160,uint64))`
  - `swapV2ToV3WithPermit2(address,address,address,uint24,uint160,uint256,uint64)`
  - `swapV3ToV2WithPermit2(address,address,address,uint24,uint160,uint256,uint64)`
- NuccaSpendRouter: `<deployed_spend_router>`
  - `spendWithPermit2(uint160,string)`
  - `spendToTreasuryWithPermit2(uint160,string)`
  - `marketplaceSaleWithPermit2(address,uint160,string)`

## Review Risk Controls

The app should be submitted with:

- No fake token balances.
- No hidden admin wallet address in UI.
- No automatic burn promise.
- No yield/staking claims.
- No unlimited free AI promise.
- Clear "minimum received" for swap.
- Clear route quote before transaction.
- Swap execution disabled if router address is missing.
- Paid item/clan/map actions settle only after receipt confirmation.
- Referral rules transparent and capped.
- Spectator token betting disabled.
- Battles described as creator contests, not gambling.
- `/admin` restricted by WalletAuth session and admin wallet.
- `/api/admin/health` hidden unless `ADMIN_HEALTH_SECRET` is provided.

## Testing In World App

World docs state MiniKit commands must be tested inside World App. For production review:

1. Deploy production to Vercel.
2. Configure production URL in Developer Portal.
3. Scan the app QR from the Developer Portal testing page.
4. Test:
   - WalletAuth.
   - IDKit verification.
   - Daily claim no-error path.
   - Swap quote.
   - Small marketplace item payment after SpendRouter allowlisting.
   - Extra map scan payment and receipt confirmation.
   - Clan creation payment and receipt confirmation.
   - Small WLD/USDC swap after router allowlisting.
   - Small NUCCA/WLD swap after router allowlisting.
   - Rejected transaction path.
   - Poor connection/reload recovery.

## Developer Portal MCP Option

If you want me to automate Portal actions later, connect the official Developer
Portal MCP with a team API key. Without that token, app creation and review
submission require your manual Portal authentication.
