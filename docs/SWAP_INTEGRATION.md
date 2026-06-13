# NuCCa Native Swap Integration

## Current Reality

- NUCCA/WLD is not a Uniswap V3 pool.
- The tracked NUCCA/WLD pair is V2-like:
  - Pair: `0x05ca223dAAebe0dcf796d759D210d1aCe3F59Db9`
  - Factory: `0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f`
  - Router: `0x541aB7c31A119441eF3575F6973277DE0eF460bd`
  - Router source is verified as `UniswapV2Router02`.
- WLD/USDC can be quoted through Uniswap V3 on WorldChain.
- NUCCA/USDC must be a mixed route:
  - NUCCA -> WLD through V2
  - WLD -> USDC through V3
- USDC/NUCCA must be the reverse mixed route:
  - USDC -> WLD through V3
  - WLD -> NUCCA through V2

## Addresses

- NUCCA: `0x3f1F7daCdAb79FDedC16693871be7A63f05aB465`
- WLD: `0x2cFc85d8E48F8EAB294be644d9E25C3030863003`
- USDC: `0x79A02482A880bCE3F13e09Da970dC34db4CD24d1`
- Permit2: `0x000000000022D473030F116dDEE9F6B43aC78BA3`
- PUF/V2 router: `0x541aB7c31A119441eF3575F6973277DE0eF460bd`
- V2 factory: `0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f`
- Uniswap V3 QuoterV2: `0x10158D43e6cc414deE1Bd1eB0EfC6a5cBCfF244c`
- Uniswap V3 SwapRouter02: `0x091AD9e2e6e5eD44c1c66dB50e49A601F9f36cF6`

## Production Architecture

The app uses `NuccaSwapRouter` as the direct MiniKit target.

Frontend flow:

1. User selects route and amount.
2. `/api/swap/quote` quotes the live route:
   - V2 router for NUCCA/WLD.
   - V3 QuoterV2 for WLD/USDC.
   - Mixed V2/V3 route for NUCCA/USDC.
3. User taps execute inside World App.
4. App sends two transactions with `MiniKit.sendTransaction`:
   - `Permit2.approve(tokenIn, NuccaSwapRouter, amountIn, 0)`
   - `NuccaSwapRouter` swap method for the quoted route.
5. App receives `userOpHash`; final receipt must be polled before marking complete.

## Router Deployment

Set a local deployer key only on the machine doing deployment:

```bash
DEPLOYER_PRIVATE_KEY=0x...
WORLDCHAIN_RPC_URL=https://worldchain-mainnet.g.alchemy.com/public
npm run deploy:swap-router
```

The script deploys `NuccaSwapRouter` and configures:

- NUCCA -> WLD V2
- WLD -> NUCCA V2
- WLD -> USDC V3 fee tiers `100`, `500`, `3000`, `10000`
- USDC -> WLD V3 fee tiers `100`, `500`, `3000`, `10000`

After deployment:

1. Set `NEXT_PUBLIC_NUCCA_SWAP_ROUTER_ADDRESS` in Vercel.
2. Redeploy production.
3. Add World Developer Portal permissions.

## World Developer Portal Permissions

Permit2 tokens:

- NUCCA
- WLD
- USDC

Contract entrypoints:

- Permit2 `approve(address,address,uint160,uint48)`
- `NuccaSwapRouter.swapV2ExactInputWithPermit2`
- `NuccaSwapRouter.swapExactInputSingleWithPermit2`
- `NuccaSwapRouter.swapV2ToV3WithPermit2`
- `NuccaSwapRouter.swapV3ToV2WithPermit2`

The PUF/V2 router and Uniswap V3 router are contract dependencies called by `NuccaSwapRouter`; the mini app does not call them directly.

## Current Safety Limits

- No swap fee is added by NuCCa router.
- User must see quote and minimum received.
- `amountOutMinimum` is mandatory.
- Deadline is short-lived.
- Admin can pause router.
- Admin must allowlist every V2/V3 route.
- Execution is disabled until `NEXT_PUBLIC_NUCCA_SWAP_ROUTER_ADDRESS` is set.

## Sources

- World MiniKit Send Transaction: https://docs.world.org/mini-apps/commands/send-transaction
- World Mini App Store Review: https://docs.world.org/mini-apps/quick-start/app-store
- World App Review Guidelines: https://docs.world.org/mini-apps/guidelines/policy
- Uniswap WorldChain Deployments: https://developers.uniswap.org/docs/protocols/v3/deployments/v3-world-chain-deployments
