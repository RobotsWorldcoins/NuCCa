import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | NuCCa Genesis Studio",
  description: "Privacy policy for NuCCa Genesis Studio.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground">
      <div className="mx-auto max-w-2xl space-y-4 pb-16">
        <Link className="text-sm font-bold text-accent" href="/">
          Back to NuCCa Genesis Studio
        </Link>

        <section className="glass rounded-lg border border-line p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-accent">
            Privacy Policy
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">
            NuCCa Genesis Studio
          </h1>
          <p className="mt-3 text-sm font-medium leading-6 text-muted">
            Last updated: June 13, 2026. This policy explains what data the app
            uses to run a World App creator game with wallet login, human
            verification, progression, referrals, battles, marketplace actions,
            and optional in-app swaps.
          </p>
        </section>

        <PolicyBlock title="Data We Use">
          <p>
            We store the minimum data needed to operate the app: wallet address,
            World username/profile metadata when available through MiniKit,
            referral code, game progress, missions, claims, music composition
            manifests, clan data, marketplace records, and audit logs for abuse
            prevention.
          </p>
        </PolicyBlock>

        <PolicyBlock title="World ID And WalletAuth">
          <p>
            WalletAuth is used for sign-in. World ID is used to verify human
            status and reduce abuse. World ID nullifiers are not used as
            permanent user identifiers. Session identifiers are stored only for
            continuity and replay protection where required by World ID 4.x.
          </p>
        </PolicyBlock>

        <PolicyBlock title="Generated Content">
          <p>
            Music, prompts, thumbnails, samples, and creator assets may be stored
            so users can submit in-app tracks to rankings and battles. Users must
            only upload or generate content they have the right to use.
          </p>
        </PolicyBlock>

        <PolicyBlock title="Blockchain Data">
          <p>
            Token balances, swaps, and transactions happen on World Chain and are
            public blockchain data. The app may read public chain data and market
            data to show token, routing, and activity information.
          </p>
        </PolicyBlock>

        <PolicyBlock title="Sharing And Deletion">
          <p>
            We do not sell personal data. Operational data may be processed by
            hosting, database, storage, analytics, and security providers used to
            run the app. Users can request support through the contact listed in
            the World App store profile.
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
