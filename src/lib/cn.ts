import { clsx, type ClassValue } from "clsx";

/** Junta classes condicionais. (Sem tailwind-merge: evitamos dependência extra.) */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
