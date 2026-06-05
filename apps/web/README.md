# NuCCa Genesis Studio Web

Next.js App Router Mini App for World App.

## Commands

```powershell
npm.cmd run dev
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

## Required Production Setup

- Register the Mini App and RP in World Developer Portal.
- Set the public World config and server secrets from `.env.example`.
- Configure Supabase using `supabase/migrations/202606050001_initial_schema.sql`.
- Allowlist NUCCA token and contract entrypoints in World Developer Portal before enabling `sendTransaction`.
- Deploy free AI workers separately and protect them with `AI_WORKER_SHARED_SECRET`.
