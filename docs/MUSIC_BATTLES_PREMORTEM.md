# NuCCa Music Battles, Creator Identity, Clans, And Provenance

## Trend Check

- Base is pushing mini apps as fast social surfaces through OnchainKit/MiniKit and Base App discovery. The important pattern is embedded consumer UX, not forcing users to think about chains.
- Solana gaming and creator apps lean on low-cost asset distribution, especially compressed NFTs through Metaplex Bubblegum V2. The important pattern is cheap inventory/status assets at scale.
- For NuCCa on WorldChain, copy the retention mechanics, not the chain-specific stack: avatar identity, inventory, missions, social battles, and proof-of-human voting.

Sources:

- Base OnchainKit: https://docs.base.org/builderkits/onchainkit/getting-started
- Base Mini Apps: https://www.base.org/build/minikit
- Coinbase Base mini apps help: https://help.coinbase.com/en/base/social-feed/mini-apps
- Metaplex Bubblegum V2: https://www.metaplex.com/docs/bubblegum-v2
- Solana game assets guide: https://solana.com/fi/developers/guides/games/nfts-in-games

## Product Logic

NuCCa must become a creator RPG, not a token faucet.

Core loop:

1. User verifies human identity.
2. User receives an avatar/studio profile.
3. User unlocks samples by XP, missions, battles, and limited drops.
4. User builds songs only from approved in-app samples, AI jobs, and builder arrangements.
5. The app creates a provenance manifest and hash for every ranked composition.
6. Only ranked-eligible compositions can enter solo battles, crew 3v3 battles, and tournaments.
7. Voters need World ID for full vote weight.
8. Winners receive XP/status/items first; NUCCA rewards remain capped.

## Battle Economy Decision

Do not launch spectator NUCCA betting in the MVP.

The requested mechanic, where spectators stake NUCCA and win NUCCA from other spectators if they picked the winner, has the core markers of regulated betting: consideration, uncertain outcome, and prize with transferable value. A `1000 NUCCA` cap reduces exposure size but does not change the legal character.

Safe MVP:

- `Genesis Duel`: 48 hours, minimum `1000 NUCCA` total contest value, minimum `500 NUCCA` entry per creator.
- `Flash Battle`: 24 hours, minimum `500 NUCCA` total contest value, minimum `250 NUCCA` entry per creator.
- `Crew 3v3 Genesis`: 48 hours, minimum `3000 NUCCA` total contest value, six creators at minimum `500 NUCCA` each.
- `Crew 3v3 Flash`: 24 hours, minimum `1500 NUCCA` total contest value, six creators at minimum `250 NUCCA` each.
- No maximum creator-funded contest pool in the current config.
- House/admin commission is disclosed.
- Monthly ranking reserve is disclosed.
- No automatic app burn is promised. Manual burns can be reported only after the admin executes them on-chain.
- Creator winner can receive the capped creator-funded prize pool.
- Spectators can back a creator with non-transferable Hype and earn XP/cosmetics/status only.
- Spectator token payouts remain disabled unless the project becomes a licensed gambling product with geofencing, KYC/AML, responsible gaming controls, and legal review.

## Creator Identity And Items

The earlier "RPG avatar" concept should be treated as a profile identity system, not a stat-heavy character.

Recommended item model:

- profile image frame
- leaderboard badge
- battle entrance animation
- clan stage background
- limited title

These items are valuable because they make the user look premium. They should not secretly decide battles or become aggressive pay-to-win mechanics.

## Clans And Monthly Rankings

Clans give the app a larger purpose than one-off songs.

- Four starter labels: Genesis Sound, Neon Syndicate, Shadow Records, Eternal Frequency.
- Users join one clan.
- Solo battles give creator points.
- Crew 3v3 battles give creator and clan points.
- Monthly ranking rewards must be published before the month starts.
- Prize sizes must be reduced if reserves are weak.
- World ID weighting is required so clans do not farm votes with fake accounts.

## Music Provenance

Ranked music must not accept arbitrary uploads.

Every ranked song needs:

- `sample_ids`
- arrangement data
- builder version
- user wallet
- creation timestamp
- app provenance marker
- SHA-256 manifest hash

Outside uploads can exist only as practice/reference files. They cannot enter ranked battles or receive NUCCA rewards unless recreated inside the builder from approved samples.

## Brutal Premortem

- The token is fragile. NUCCA rewards must be small and capped; otherwise referrals and battles drain reserves or invite farming.
- Battle rewards should be mostly XP, rank, cosmetics, sample unlocks, and status. NUCCA should be a seasoning, not the meal.
- If the music builder is weak, users will not care about battles. The builder must be fun before token rewards matter.
- If uploaded music is allowed into ranked battles, provenance breaks and cheating becomes normal.
- If voting is not World ID weighted, crews can farm votes.
- If premium items give too much power, the app becomes pay-to-win. Cosmetics and light boosts are safer.
- The first MVP should avoid wagering language. Entry fees should be framed as tournament access with admin commission and monthly prize allocation, not gambling.
- If spectator NUCCA betting is enabled without licensing, this becomes the fastest path to rejection, legal exposure, and reputation damage.
- If the app advertises automatic burns but the admin must execute them manually, users will call it fake tokenomics. Keep burns out of app flows unless they are already executed and publicly verifiable.
