import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines dynamic Tailwind CSS class names with tailwind-merge and clsx.
 * This resolves conflict issues (e.g. padding overlays) in reusable components.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
