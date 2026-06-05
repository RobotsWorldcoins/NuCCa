# NUCCA Market Data And Referral Rules

## Sources

- Dexscreener token-pairs API: `https://api.dexscreener.com/token-pairs/v1/worldchain/{tokenAddress}`
- World Chain oracle providers: Api3, Chainlink Data Streams, Pyth, RedStone, WitNet.
- Uniswap V2 TWAP is the preferred on-chain pattern if reward decisions ever become large enough to justify contract-level pricing.

## MVP Decision

Use Dexscreener for transparent UI metrics and reward risk guards. Do not use spot price as a direct payout oracle.

Referral rewards:

- Max `100` qualified friends per account.
- Qualification requires WalletAuth, World ID session proof, and first daily claim.
- Month 1 starts at `1 NUCCA`.
- Month 2 is `0.5 NUCCA`.
- Month 3 is `0.25 NUCCA`.
- The amount halves every month after launch.
- If market data is missing, stale, illiquid, or inactive, token reward becomes XP/energy only.
- All token rewards remain capped by global reward budgets.

This keeps the program aggressive psychologically without creating an uncapped liability.
