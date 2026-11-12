"use server";

import { cookies } from "next/headers";
import { SUBSCRIPTION_COOKIE } from "@/lib/subscription";

export type SubscriptionState = {
  status: "idle" | "error";
  message?: string;
};

export async function subscribe(
  _previous: SubscriptionState,
): Promise<SubscriptionState> {
  try {
    const store = await cookies();
    store.set(SUBSCRIPTION_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    return { status: "idle" };
  } catch {
    return {
      status: "error",
      message: "The subscription did not save. Try again.",
    };
  }
}

export async function unsubscribe(
  _previous: SubscriptionState,
): Promise<SubscriptionState> {
  try {
    const store = await cookies();
    store.delete(SUBSCRIPTION_COOKIE);
    return { status: "idle" };
  } catch {
    return { status: "error", message: "The change did not save. Try again." };
  }
}
