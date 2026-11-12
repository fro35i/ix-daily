import type { ReactNode } from "react";
import { ArticleCard } from "@/components/article-card";
import { getTrending } from "@/lib/news";

const TRENDING_COUNT = 3;

function TrendingFrame({ children }: { children: ReactNode }) {
  return (
    <section
      aria-labelledby="trending-heading"
      className="flex flex-col gap-8 border-line border-t pt-10"
    >
      <h2 id="trending-heading" className="text-h2">
        More on this topic
      </h2>
      <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </ul>
    </section>
  );
}

export async function Trending({ slug }: { slug: string }) {
  const articles = await getTrending(slug, TRENDING_COUNT);
  if (articles.length === 0) return null;

  return (
    <TrendingFrame>
      {articles.map((article) => (
        <li key={article.slug}>
          <ArticleCard article={article} />
        </li>
      ))}
    </TrendingFrame>
  );
}

const skeletonKeys = Array.from({ length: TRENDING_COUNT }, (_, i) => `s${i}`);

export function TrendingSkeleton() {
  return (
    <TrendingFrame>
      {skeletonKeys.map((key) => (
        <li key={key} className="flex flex-col gap-4">
          <div className="aspect-video animate-pulse bg-surface" />
          <div className="h-3 w-1/4 animate-pulse bg-surface" />
          <div className="h-6 w-5/6 animate-pulse bg-surface" />
        </li>
      ))}
    </TrendingFrame>
  );
}
