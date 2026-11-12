import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArticleCard } from "@/components/article-card";
import { BreakingNews, BreakingNewsSkeleton } from "@/components/breaking-news";
import { Hero } from "@/components/hero";
import { getArticles, getCategories } from "@/lib/news";
import { site } from "@/lib/site";

const FEATURED_COUNT = 6;

export const metadata: Metadata = {
  description: site.description,
  alternates: { canonical: "/" },
};

export default async function Home() {
  const [articles, categories] = await Promise.all([
    getArticles({ limit: FEATURED_COUNT + 1 }),
    getCategories(),
  ]);
  const [lead, ...featured] = articles;
  const total = categories.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <>
      <Suspense fallback={<BreakingNewsSkeleton />}>
        <BreakingNews />
      </Suspense>
      <div className="page-container flex flex-col gap-16 py-12 md:gap-24 md:py-20">
        {lead ? <Hero featured={lead} total={total} /> : null}
        <section
          aria-labelledby="featured-heading"
          className="flex flex-col gap-8"
        >
          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 id="featured-heading" className="text-h2">
                Featured
              </h2>
              <p className="text-muted">The latest stories from the blog.</p>
            </div>
            <Link
              href="/search"
              className="shrink-0 py-2 text-muted underline-offset-4 hover:text-brand hover:underline"
            >
              View all
            </Link>
          </div>
          <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((article) => (
              <li key={article.slug}>
                <ArticleCard article={article} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
