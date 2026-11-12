"use client";

import Link from "next/link";
import { useEffect } from "react";

type ErrorProps = {
  error: unknown;
  retry: () => void;
};

export default function ArticleError({ error, retry }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest =
    error instanceof Error &&
    "digest" in error &&
    typeof error.digest === "string"
      ? error.digest
      : undefined;

  return (
    <div className="page-container flex flex-col items-start gap-4 py-16">
      <h1 className="text-h1">The article did not load</h1>
      <p className="max-w-xl text-lead text-muted">
        Try again. If the problem continues, go back to the homepage.
      </p>
      {digest ? <p className="text-muted text-sm">Error ID: {digest}</p> : null}
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={() => retry()}
          className="h-12 bg-brand px-4 font-normal text-sm text-white hover:bg-brand-hover active:bg-brand-active"
        >
          Try again
        </button>
        <Link
          href="/"
          className="text-brand underline underline-offset-4 hover:text-brand-hover"
        >
          Go to the homepage
        </Link>
      </div>
    </div>
  );
}
