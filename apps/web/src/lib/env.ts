export function publicWorldConfig() {
  return {
    appId: process.env.NEXT_PUBLIC_WORLD_APP_ID ?? "",
    rpId: process.env.NEXT_PUBLIC_WORLD_RP_ID ?? "",
    environment:
      process.env.NEXT_PUBLIC_WORLD_ENV === "production"
        ? "production"
        : "staging",
  } as const;
}

export function requiredServerEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

export function optionalServerEnv(name: string) {
  const value = process.env[name];
  return value && value.length > 0 ? value : null;
}
