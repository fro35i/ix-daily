import "server-only";
import { cookies } from "next/headers";

export const SUBSCRIPTION_COOKIE = "ix_daily_subscriber";

export async function isSubscribed(): Promise<boolean> {
  const store = await cookies();
  return store.get(SUBSCRIPTION_COOKIE)?.value === "1";
}
