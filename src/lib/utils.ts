import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Generate a fingerprint from row values for optimistic concurrency checks. */
export function rowFingerprint(values: string[]): string {
  // Trim trailing empty strings to match Google Sheets API behavior
  // (the API omits trailing empty cells when reading a row)
  let end = values.length;
  while (end > 0 && values[end - 1] === "") end--;
  return values.slice(0, end).join("|");
}
