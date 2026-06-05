# NuCCa Swap Integration

## Current Reality

- NUCCA has a tracked Uniswap WorldChain pool against WLD.
- Dexscreener currently returns the NUCCA/WLD pair:
  - Pair: `0x05ca223dAAebe0dcf796d759D210d1aCe3F59Db9`
  - Base: NUCCA `0x3f1F7daCdAb79FDedC16693871be7A63f05aB465`
  - Quote: WLD `0x2cFc85d8E48F8EAB294be644d9E25C3030863003`
- No direct NUCCA/USDC pool is currently tracked in Dexscreener. NUCCA/USDC should be treated as a routed Uniswap swap, likely NUCCA -> WLD -> USDC.
- "USD" in-app means USDC on World Chain, not bank dollars.

## Addresses

- WLD: `0x2cFc85d8E48F8EAB294be644d9E25C3030863003`
- USDC: `0x79A02482A880bCE3F13e09Da970dC34db4CD24d1`
- Uniswap Universal Router on World Chain: `0x8ac7bee993bb44dab564ea4bc9ea67bf9eb5e743`
- Uniswap Universal Router 2.1.1 on World Chain: `0x8b844f885672f333bc0042cb669255f93a4c1e6b`
- Uniswap SwapRouter02 on World Chain: `0x091AD9e2e6e5eD44c1c66dB50e49A601F9f36cF6`
- Uniswap QuoterV2 on World Chain: `0x10158D43e6cc414deE1Bd1eB0EfC6a5cBCfF244c`

## MVP Implementation

The app exposes real Uniswap swap URLs for:

- NUCCA -> WLD
- WLD -> NUCCA
- NUCCA -> USDC
- USDC -> NUCCA

This is real execution via Uniswap, not fake internal accounting.

## Native MiniKit Swap Requirements

Before the app can submit swaps directly with `MiniKit.sendTransaction`, the World Developer Portal must allowlist:

- NUCCA token
- WLD token
- USDC token
- Permit2
- selected Uniswap router

The native flow must also include:

- quote validation
- slippage limits
- minimum received
- route expiry
- user operation receipt polling
- liquidity warnings for thin NUCCA pools

## Sources

- World MiniKit Send Transaction: https://docs.world.org/mini-apps/commands/send-transaction
- World Chain useful contracts: https://docs.world.org/world-chain/reference/useful-contracts
- Uniswap World Chain deployments: https://developers.uniswap.org/docs/protocols/v3/deployments/v3-world-chain-deployments
- Uniswap supported chains and tokens: https://developers.uniswap.org/docs/trading/swapping-api/supported-chains
