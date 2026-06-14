export function clanIdFromName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export function clanCreationSink(clanName: string) {
  const clanId = clanIdFromName(clanName);
  if (!clanId) throw new Error("Clan name must include letters or numbers.");
  return `clan_creation:${clanId}`;
}

export function mapExtraScanSink({
  scanDate,
  walletAddress,
  zoneId,
}: {
  scanDate: string;
  walletAddress: string;
  zoneId: string;
}) {
  return `map_extra_scan:${walletAddress.toLowerCase()}:${scanDate}:${zoneId}`;
}

export function musicExportSink({
  compositionId,
  walletAddress,
}: {
  compositionId: string;
  walletAddress: string;
}) {
  return `music_export:${walletAddress.toLowerCase()}:${compositionId}`;
}
