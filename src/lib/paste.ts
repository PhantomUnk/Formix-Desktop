import { PASTE_DELAY_MS } from "@/lib/constants";

export function delay(ms: number = PASTE_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
