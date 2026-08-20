import { PASTE_DELAY_MS } from "@/constants";

export function delay(ms: number = PASTE_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
