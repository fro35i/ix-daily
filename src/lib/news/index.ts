import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { MAX_RESULTS, MIN_QUERY_LENGTH } from "@/lib/search-params";
import type { Article, ArticleListItem, Banner } from "./schema";
import {
  normalize,
  readArticles,
  readBanner,
  readSearchIndex,
  type SearchEntry,
} from "./source";

export type {
  Article,
  ArticleListItem,
  Banner,
  BodyBlock,
} from "./schema";

export type CategorySummary = { slug: string; name: string; count: number };

function toListItem({ body: _body, ...item }: Article): ArticleListItem {
  return item;
}

export async function getArticles({
  limit,
  category,
}: {
  limit?: number;
  category?: string;
} = {}): Promise<ArticleListItem[]> {
  "use cache";
  cacheLife("articles");
  cacheTag("articles");

  const articles = await readArticles();
  const matching = category
    ? articles.filter((article) => article.category.slug === category)
    : articles;
  return matching.slice(0, limit).map(toListItem);
}

export async function getArticle(slug: string): Promise<Article | null> {
  "use cache";
  cacheLife("articles");
  cacheTag("articles", `article:${slug}`);

  const articles = await readArticles();
  return articles.find((article) => article.slug === slug) ?? null;
}

/** Newest articles from the same category, excluding the given one. */
export async function getTrending(
  slug: string,
  limit = 4,
): Promise<ArticleListItem[]> {
  "use cache";
  cacheLife("trending");
  cacheTag("articles", `article:${slug}`);

  const articles = await readArticles();
  const current = articles.find((article) => article.slug === slug);
  if (!current) return [];
  return articles
    .filter(
      (article) =>
        article.slug !== slug &&
        article.category.slug === current.category.slug,
    )
    .slice(0, limit)
    .map(toListItem);
}

function rank(entry: SearchEntry, needle: string): number {
  if (entry.title.includes(needle)) return 3;
  if (entry.lead.includes(needle)) return 2;
  if (entry.body.includes(needle)) return 1;
  return 0;
}

/**
 * Matches title, lead and body. Title hits rank first, then lead, then body,
 * newest first within a rank. A query shorter than MIN_QUERY_LENGTH is
 * ignored, so a category alone acts as a filter.
 */
export async function searchArticles({
  query = "",
  category,
  limit = MAX_RESULTS,
}: {
  query?: string;
  category?: string;
  limit?: number;
}): Promise<ArticleListItem[]> {
  "use cache";
  cacheLife("articles");
  cacheTag("articles");

  const needle = normalize(query);
  const hasQuery = needle.length >= MIN_QUERY_LENGTH;
  if (!hasQuery && !category) return [];

  const entries = (await readSearchIndex()).filter(
    (entry) => !category || entry.article.category.slug === category,
  );
  const hits = hasQuery
    ? entries
        .map((entry) => ({ entry, score: rank(entry, needle) }))
        .filter((hit) => hit.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((hit) => hit.entry)
    : entries;
  return hits.slice(0, limit).map((entry) => toListItem(entry.article));
}

export async function getCategories(): Promise<CategorySummary[]> {
  "use cache";
  cacheLife("articles");
  cacheTag("articles");

  const counts = new Map<string, CategorySummary>();
  for (const { category } of await readArticles()) {
    const entry = counts.get(category.slug) ?? { ...category, count: 0 };
    entry.count++;
    counts.set(category.slug, entry);
  }
  return [...counts.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name, "de"),
  );
}

/** Returns null when the banner points to an article that does not exist. */
export async function getBreakingNews(): Promise<Banner | null> {
  "use cache";
  cacheLife("banner");
  cacheTag("banner");

  const banner = await readBanner();
  const articles = await readArticles();
  return articles.some((article) => article.slug === banner.articleSlug)
    ? banner
    : null;
}
