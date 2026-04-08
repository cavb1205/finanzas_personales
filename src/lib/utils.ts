import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Generate a fingerprint from row values for optimistic concurrency checks. */
export function rowFingerprint(values: string[]): string {
  return values.join("|");
}
