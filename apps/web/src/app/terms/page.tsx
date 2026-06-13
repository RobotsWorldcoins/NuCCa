import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms | NuCCa Genesis Studio",
  description: "Terms for NuCCa Genesis Studio.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground">
      <div className="mx-auto max-w-2xl space-y-4 pb-16">
        <Link className="text-sm font-bold text-accent" href="/">
          Back to NuCCa Genesis Studio
        </Link>

        <section className="glass rounded-lg border border-line p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-accent">
            Terms Of Use
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">
            NuCCa Genesis Studio
          </h1>
          <p className="mt-3 text-sm font-medium leading-6 text-muted">
            Last updated: June 13, 2026. These terms apply to the NuCCa Genesis
            Studio World App Mini App and web experience.
          </p>
        </section>

        <PolicyBlock title="Product Purpose">
          <p>
            NuCCa Genesis Studio is a music creator game. Users can build
            in-app tracks, collect samples and RPG equipment, join clans,
            compete in skill-based battles, use creator tools, and participate
            in rankings.
          </p>
        </PolicyBlock>

        <PolicyBlock title="No Investment Promise">
          <p>
            NUCCA activity inside the app is game utility. The app does not
            promise profit, yield, APY, staking returns, price appreciation, or
            financial guarantees. Token prices can move up or down and users
            should not treat the game as investment advice.
          </p>
        </PolicyBlock>

        <PolicyBlock title="Battles And Rewards">
          <p>
            Battles are designed around in-app music creation, creator
            reputation, rankings, and skill-based competition. Spectator token
            betting is not enabled. Reward budgets can be capped, reduced,
            delayed, or paused to protect the economy and prevent abuse.
          </p>
        </PolicyBlock>

        <PolicyBlock title="Content Rights">
          <p>
            Users are responsible for the music, voice, image, sample, and
            prompt content they upload or create. Do not upload copyrighted
            material, public-figure voice clones, non-consensual vocals, or
            content you do not have rights to use.
          </p>
        </PolicyBlock>

        <PolicyBlock title="Transactions">
          <p>
            World Chain transactions require user approval through World App.
            Fees, swaps, marketplace purchases, contest entries, and clan
            creation payments are final once confirmed on-chain unless a smart
            contract refund path explicitly applies.
          </p>
        </PolicyBlock>

        <PolicyBlock title="Safety Controls">
          <p>
            The app can rate-limit, pause claims, pause marketplace actions,
            block abusive accounts, reject invalid content, and adjust reward
            rules when required for security, legal, or operational reasons.
          </p>
        </PolicyBlock>
      </div>
    </main>
  );
}

function PolicyBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-line bg-white/70 p-5">
      <h2 className="text-base font-black">{title}</h2>
      <div className="mt-2 text-sm font-medium leading-6 text-muted">
        {children}
      </div>
    </section>
  );
}
