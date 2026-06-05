# NuCCa Genesis Studio

Production-oriented World App Mini App for the NUCCA creator economy.

## Current Build

- Web app: `apps/web`
- Database migrations: `supabase/migrations`
- Contracts: `contracts`
- Token: `0x3f1F7daCdAb79FDedC16693871be7A63f05aB465`
- Chain: World Chain, chain id `480`

## Hard Rules

- No paid AI providers.
- No APY, yield, or securities-style staking.
- World App login uses MiniKit WalletAuth.
- Human verification uses IDKit 4.x sessions.
- NUCCA rewards are capped and transparent.
- Dexscreener/Uniswap price data is display and risk input, not a blind payout oracle.
- No automatic burn promises inside the app. Manual burns are external admin actions and need public tx proof.
- Battles support solo 1v1 and crew 3v3 creator-funded contests; spectator NUCCA betting stays disabled.

## Run

```powershell
npm.cmd --workspace apps/web run dev
```

Copy `.env.example` to `apps/web/.env.local` or provide equivalent Vercel env vars before production use.

## Vercel

Use the Git integration with:

- Root Directory: `apps/web`
- Framework: `Next.js`
- Install Command: `npm install`
- Build Command: `npm run build`

Production requires the World/Supabase/session/reward/AI worker secrets from `.env.example`. Never add those secrets to GitHub.
