# World App Submission Checklist

## Portal Setup

Create the app in World Developer Portal:

- App name: `NuCCa Genesis Studio`
- App type: Mini App
- Production URL: `https://nucca.vercel.app`
- Chain: WorldChain mainnet
- App ID: copy to `NEXT_PUBLIC_WORLD_APP_ID`
- RP ID: copy to `NEXT_PUBLIC_WORLD_RP_ID`
- RP signing key: copy once to `WORLD_RP_SIGNING_KEY`

Use production values before review:

```bash
NEXT_PUBLIC_WORLD_ENV=production
NEXT_PUBLIC_WORLD_CHAIN_ID=480
NEXT_PUBLIC_NUCCA_TOKEN_ADDRESS=0x3f1F7daCdAb79FDedC16693871be7A63f05aB465
NEXT_PUBLIC_NUCCA_SWAP_ROUTER_ADDRESS=<deployed_router>
```

## Description For Review

Short description:

`Create music, customize your studio identity, join creator battles, and use NUCCA for in-app progression.`

Avoid:

- APY
- Yield
- Passive income
- Investment language
- Guaranteed rewards
- Gambling wording
- “Earn money”
- “Profit”

## MiniKit/World ID

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

## Review Risk Controls

The app should be submitted with:

- No fake token balances.
- No hidden admin wallet address in UI.
- No automatic burn promise.
- No yield/staking claims.
- No unlimited free AI promise.
- Clear “minimum received” for swap.
- Clear route quote before transaction.
- Swap execution disabled if router address is missing.
- Referral rules transparent and capped.
- Battles described as creator contests; avoid casino/gambling language in submission copy.

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
   - Small WLD/USDC swap.
   - Small NUCCA/WLD swap.
   - Rejected transaction path.
   - Poor connection/reload recovery.

## Developer Portal MCP Option

If you want me to automate Portal actions later, connect the official Developer Portal MCP with a team API key. Without that token, app creation and review submission require your manual Portal authentication.
