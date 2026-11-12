import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchForm, SearchFormSkeleton } from "@/components/search-form";
import {
  SearchResults,
  SearchResultsSkeleton,
} from "@/components/search-results";
import {
  PendingResults,
  SearchTransitionProvider,
} from "@/components/search-transition";
import { getCategories } from "@/lib/news";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the IBM iX Daily articles by keyword and topic.",
  alternates: { canonical: "/search" },
};

export default async function SearchPage({
  searchParams,
}: PageProps<"/search">) {
  const categories = await getCategories();
  const total = categories.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <div className="page-container flex flex-col gap-10 py-10 md:py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-h1">Search</h1>
        <p className="max-w-2xl text-lead text-muted">
          Search {total} articles by keyword and topic.
        </p>
      </header>
      <SearchTransitionProvider>
        <Suspense fallback={<SearchFormSkeleton />}>
          <SearchForm categories={categories} />
        </Suspense>
        <PendingResults>
          <Suspense fallback={<SearchResultsSkeleton />}>
            <SearchResults searchParams={searchParams} />
          </Suspense>
        </PendingResults>
      </SearchTransitionProvider>
    </div>
  );
}
