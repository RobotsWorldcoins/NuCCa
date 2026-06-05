import Image from "next/image";
import {
  Activity,
  AlertTriangle,
  Shield,
  SlidersHorizontal,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { adminWalletConfigured } from "@/lib/admin";
import { ECONOMY_SPLIT, TOKEN_FACTS } from "@/lib/constants";
import { DAILY_REWARD_POLICY } from "@/lib/economy";

export default function AdminPage() {
  const adminConfigured = adminWalletConfigured();

  return (
    <main className="noise min-h-screen">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-5">
        <header className="holo-border overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_24px_70px_rgba(49,61,94,0.15)]">
          <div className="relative h-44">
            <Image
              alt="NuCCa Genesis Studio logo"
              className="object-cover object-center"
              fill
              priority
              sizes="448px"
              src="/brand/nucca-genesis-studio.png"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-transparent" />
          </div>
          <div className="-mt-10 p-5 pt-0">
            <Badge className="relative border-orange-200 bg-white/86 text-accent">
              Admin console
            </Badge>
            <h1 className="relative mt-3 text-3xl font-black tracking-tight">
              NuCCa Economy Ops
            </h1>
            <p className="relative mt-2 text-sm font-medium text-muted">
              Controls must be signed by the admin wallet. Keys never belong in app infrastructure.
            </p>
          </div>
        </header>

        <Card className="holo-border">
          <div className="flex items-center justify-between">
            <CardTitle>Access Boundary</CardTitle>
            <Shield className="text-accent" size={20} />
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-white/60 p-3">
            <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-white bg-white shadow-lg">
              <Image
                alt="NUCCA token logo"
                className="object-cover"
                fill
                sizes="56px"
                src="/brand/nucca-token.jpeg"
              />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
                Admin treasury wallet
              </p>
              <p className="font-mono text-sm font-black">
                {adminConfigured ? "Configured server-side" : "Missing env"}
              </p>
              <p className="mt-1 text-xs font-medium text-muted">
                Address is intentionally hidden from the UI.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardTitle>Reward Controls</CardTitle>
            <SlidersHorizontal className="text-accent" size={20} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Metric label="Daily cap" value={`${DAILY_REWARD_POLICY.dailyNuccaBudget} NUCCA`} />
            <Metric label="Referral cap" value={`${DAILY_REWARD_POLICY.referralMonthlyBudget} NUCCA/mo`} />
            <Metric label="Max friends" value={`${DAILY_REWARD_POLICY.maxReferralFriends}`} />
            <Metric label="Holders" value={`${TOKEN_FACTS.holders}`} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardTitle>Revenue Split</CardTitle>
            <Trophy className="text-accent" size={20} />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            <Metric label="Treasury" value={`${ECONOMY_SPLIT.treasury}%`} />
            <Metric label="Monthly" value={`${ECONOMY_SPLIT.monthlyLeagueReserve}%`} />
            <Metric label="AI" value={`${ECONOMY_SPLIT.aiReserve}%`} />
            <Metric label="Rewards" value={`${ECONOMY_SPLIT.rewardsReserve}%`} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardTitle>Premortem Watchlist</CardTitle>
            <AlertTriangle className="text-warning" size={20} />
          </div>
          <ul className="mt-4 space-y-2 text-sm font-medium text-muted">
            <li>- Free AI capacity exhaustion.</li>
            <li>- Referral farms trying to cycle accounts.</li>
            <li>- Thin liquidity making price displays volatile.</li>
            <li>- Review risk from chance rewards, yield language, or betting language.</li>
            <li>- Manual tokenomics actions being advertised before they are executed.</li>
          </ul>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <CardTitle>Monitoring</CardTitle>
            <Activity className="text-accent-2" size={20} />
          </div>
          <p className="mt-4 text-sm font-medium text-muted">
            Wire this page to `/api/admin/health`, Supabase audit logs, and contract events after production
            secrets are configured.
          </p>
        </Card>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white/58 p-2 text-center shadow-sm">
      <p className="truncate font-mono text-xs font-black">{value}</p>
      <p className="mt-1 truncate text-[10px] uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}
