"use client";

import {
  createContext,
  type ReactNode,
  type TransitionStartFunction,
  use,
  useTransition,
} from "react";

type SearchTransition = {
  isPending: boolean;
  startTransition: TransitionStartFunction;
};

const SearchTransitionContext = createContext<SearchTransition | null>(null);

/** Shares one transition between the search form and the server-rendered results. */
export function SearchTransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <SearchTransitionContext value={{ isPending, startTransition }}>
      {children}
    </SearchTransitionContext>
  );
}

export function useSearchTransition(): SearchTransition {
  const context = use(SearchTransitionContext);
  if (!context) {
    throw new Error("useSearchTransition needs a SearchTransitionProvider.");
  }
  return context;
}

export function PendingResults({ children }: { children: ReactNode }) {
  const { isPending } = useSearchTransition();

  return (
    <div
      aria-busy={isPending}
      className={`transition-opacity duration-200 ${isPending ? "opacity-40" : ""}`}
    >
      {children}
    </div>
  );
}
