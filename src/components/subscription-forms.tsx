"use client";

import { type ReactNode, useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  type SubscriptionState,
  subscribe,
  unsubscribe,
} from "@/app/actions/subscription";

const initialState: SubscriptionState = { status: "idle" };

const buttonStyles = {
  primary:
    "bg-brand text-white hover:bg-brand-hover active:bg-brand-active disabled:bg-brand/60",
  quiet:
    "border border-line text-ink hover:border-brand hover:text-brand disabled:opacity-60",
};

const buttonSizes = {
  compact: "h-10 px-3 text-sm",
  large: "h-12 px-6 text-base",
};

type FormProps = {
  size?: keyof typeof buttonSizes;
  variant?: keyof typeof buttonStyles;
};

function SubmitButton({
  children,
  pendingLabel,
  className,
}: {
  children: ReactNode;
  pendingLabel: string;
  className: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`whitespace-nowrap font-normal ${className}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

function ErrorMessage({ state }: { state: SubscriptionState }) {
  if (state.status !== "error") return null;
  return (
    <p role="alert" className="text-error text-sm">
      {state.message}
    </p>
  );
}

export function SubscribeForm({
  size = "compact",
  variant = "primary",
}: FormProps) {
  const [state, formAction] = useActionState(subscribe, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <SubmitButton
        pendingLabel="Subscribing…"
        className={`${buttonStyles[variant]} ${buttonSizes[size]}`}
      >
        Subscribe
      </SubmitButton>
      <ErrorMessage state={state} />
    </form>
  );
}

export function UnsubscribeForm() {
  const [state, formAction] = useActionState(unsubscribe, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <SubmitButton
        pendingLabel="Saving…"
        className={`${buttonStyles.quiet} ${buttonSizes.compact}`}
      >
        Unsubscribe
      </SubmitButton>
      <ErrorMessage state={state} />
    </form>
  );
}
