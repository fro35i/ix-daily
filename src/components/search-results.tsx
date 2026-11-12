import type { ReactNode } from "react";
import { ArticleCard } from "@/components/article-card";
import type { ArticleListItem } from "@/lib/news";
import { getArticles, getCategories, searchArticles } from "@/lib/news";
import {
  MAX_RESULTS,
  MIN_QUERY_LENGTH,
  parseSearchParams,
} from "@/lib/search-params";

const RECENT_COUNT = 6;

type SearchResultsProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function Message({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-h3">{title}</h2>
      {children}
    </section>
  );
}

function ArticleGrid({
  title,
  articles,
  note,
}: {
  title: string;
  articles: ArticleListItem[];
  note?: string;
}) {
  return (
    <section aria-labelledby="results-heading" className="flex flex-col gap-8">
      <h2 id="results-heading" className="text-h3">
        {title}
      </h2>
      <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <li key={article.slug}>
            <ArticleCard article={article} />
          </li>
        ))}
      </ul>
      {note ? <p className="text-muted text-sm">{note}</p> : null}
    </section>
  );
}

export async function SearchResults({ searchParams }: SearchResultsProps) {
  const { q, category } = parseSearchParams(await searchParams);
  const categories = await getCategories();
  const topic = categories.find((entry) => entry.slug === category);

  if (!q && !topic) {
    const recent = await getArticles({ limit: RECENT_COUNT });
    return <ArticleGrid title="Recent articles" articles={recent} />;
  }

  if (q && q.length < MIN_QUERY_LENGTH) {
    return (
      <Message title={`Type at least ${MIN_QUERY_LENGTH} characters`}>
        <p>Short words match too many articles.</p>
      </Message>
    );
  }

  const results = await searchArticles({ query: q, category: topic?.slug });
  const scope = topic ? ` in ${topic.name}` : "";

  if (results.length === 0) {
    return (
      <Message
        title={q ? `No articles for “${q}”${scope}` : `No articles${scope}`}
      >
        <p>Try another word, or search all topics.</p>
      </Message>
    );
  }

  return (
    <ArticleGrid
      title={q ? `Top results for “${q}”${scope}` : `Latest${scope}`}
      articles={results}
      note={
        results.length === MAX_RESULTS
          ? `Showing the top ${MAX_RESULTS}. Use more words to narrow the search.`
          : undefined
      }
    />
  );
}

const skeletonKeys = ["a", "b", "c"];

export function SearchResultsSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-8">
      <div className="h-7 w-64 animate-pulse bg-surface" />
      <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {skeletonKeys.map((key) => (
          <div key={key} className="flex flex-col gap-4">
            <div className="aspect-video animate-pulse bg-surface" />
            <div className="h-3 w-20 animate-pulse bg-surface" />
            <div className="h-6 w-3/4 animate-pulse bg-surface" />
          </div>
        ))}
      </div>
    </div>
  );
}
