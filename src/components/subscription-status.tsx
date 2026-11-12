import {
  SubscribeForm,
  UnsubscribeForm,
} from "@/components/subscription-forms";
import { isSubscribed } from "@/lib/subscription";

export async function SubscriptionStatus() {
  if (!(await isSubscribed())) return <SubscribeForm />;

  return (
    <div className="flex items-center gap-3">
      <span className="hidden items-center gap-2 text-ink text-sm sm:flex">
        <span aria-hidden="true" className="size-2 rounded-full bg-brand" />
        Subscribed
      </span>
      <span className="sr-only sm:hidden">You are subscribed.</span>
      <UnsubscribeForm />
    </div>
  );
}

export function SubscriptionStatusSkeleton() {
  return <div className="h-10 w-24 animate-pulse bg-surface" />;
}
