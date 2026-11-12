"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useId, useRef, useState } from "react";
import { useSearchTransition } from "@/components/search-transition";
import { MAX_QUERY_LENGTH, MIN_QUERY_LENGTH } from "@/lib/search-params";

const DEBOUNCE_MS = 300;

type CategoryOption = { slug: string; name: string; count: number };

const fieldStyles =
  "h-12 border border-field bg-white px-3 text-ink focus-visible:border-brand";

export function SearchForm({ categories }: { categories: CategoryOption[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const { isPending, startTransition } = useSearchTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hintId = useId();

  useEffect(() => () => clearTimeout(timer.current), []);

  function navigate(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const search = params.toString();
    startTransition(() => {
      router.replace(search ? `${pathname}?${search}` : pathname, {
        scroll: false,
      });
    });
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    clearTimeout(timer.current);

    const trimmed = value.trim();
    if (trimmed === "") {
      navigate({ q: "" });
      return;
    }
    if (trimmed.length < MIN_QUERY_LENGTH) return;
    timer.current = setTimeout(() => navigate({ q: trimmed }), DEBOUNCE_MS);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearTimeout(timer.current);
    navigate({ q: query.trim() });
  }

  function handleCategoryChange(value: string) {
    clearTimeout(timer.current);
    navigate({ q: query.trim(), category: value });
  }

  const tooShort =
    query.trim().length > 0 && query.trim().length < MIN_QUERY_LENGTH;

  return (
    <search>
      <form
        action="/search"
        onSubmit={handleSubmit}
        className="flex flex-col gap-3"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <label className="flex flex-1 flex-col gap-2">
            <span className="text-ink text-sm">Search articles</span>
            <input
              type="search"
              name="q"
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              maxLength={MAX_QUERY_LENGTH}
              autoComplete="off"
              aria-describedby={hintId}
              className={fieldStyles}
            />
          </label>
          <label className="flex flex-col gap-2 md:w-64">
            <span className="text-ink text-sm">Topic</span>
            <span className="relative flex flex-col">
              <select
                name="category"
                defaultValue={searchParams.get("category") ?? ""}
                onChange={(event) => handleCategoryChange(event.target.value)}
                className={`${fieldStyles} appearance-none pr-12`}
              >
                <option value="">All topics</option>
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-ink"
              >
                <path
                  d="M3 6l5 5 5-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </span>
          </label>
          <button
            type="submit"
            className="h-12 bg-brand px-6 font-normal text-sm text-white hover:bg-brand-hover active:bg-brand-active"
          >
            Search
          </button>
        </div>
        <p
          id={hintId}
          aria-live="polite"
          className="min-h-6 text-muted text-sm"
        >
          {isPending
            ? "Searching…"
            : tooShort
              ? `Type at least ${MIN_QUERY_LENGTH} characters.`
              : ""}
        </p>
      </form>
    </search>
  );
}

export function SearchFormSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col gap-3 md:flex-row md:items-end"
    >
      <div className="h-[4.5rem] flex-1 animate-pulse bg-surface" />
      <div className="h-[4.5rem] animate-pulse bg-surface md:w-64" />
      <div className="h-12 w-24 animate-pulse bg-surface" />
    </div>
  );
}
