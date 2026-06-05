import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNucca(amount: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: amount >= 10 ? 0 : 4,
  }).format(amount);
}

export function formatUsd(amount: number | null | undefined) {
  if (amount == null || Number.isNaN(amount)) return "Unavailable";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amount < 0.01 ? 6 : 4,
  }).format(amount);
}

export function shortAddress(address?: string | null) {
  if (!address) return "Not connected";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
