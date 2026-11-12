import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { z } from "zod";
import {
  type Article,
  ArticleSchema,
  type BodyBlock,
  type Category,
} from "../src/lib/news/schema";
import { decodeText, extractPage } from "./extract";

const API_URL = "https://ibmix.de/wp-json/wp/v2/posts";
const USER_AGENT = "ix-daily-ingest/0.1";
const DELAY_MS = 400;
const MAX_REDIRECTS = 5;
const OUTPUT_FILE = path.join(process.cwd(), "content", "articles.json");

// Small slug list for proxy.ts, which must not load the full article file.
const SLUGS_FILE = path.join(process.cwd(), "content", "slugs.json");

// Some posts redirect to the IBM iX public sector site, which uses the same page builder.
const OWN_HOSTS = new Set([
  "ibmix.de",
  "www.ibmix.de",
  "staat-digital.de",
  "www.staat-digital.de",
]);

const FALLBACK_AUTHOR = "IBM iX";

// The blog spells some names in more than one way.
const AUTHOR_ALIASES: Record<string, string> = {
  "Dusan Salovic": "Dušan Šalović",
};
const FALLBACK_CATEGORY: Category = { slug: "insights", name: "Insights" };

const TermSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  taxonomy: z.string(),
});

const PostSchema = z.object({
  id: z.number(),
  slug: z.string(),
  date_gmt: z.string(),
  link: z.url(),
  title: z.object({ rendered: z.string() }),
  blog_topic: z.array(z.number()).default([]),
  yoast_head_json: z
    .object({
      description: z.string().optional(),
      og_description: z.string().optional(),
      og_image: z.array(z.object({ url: z.string() })).optional(),
    })
    .optional(),
  _embedded: z
    .object({
      "wp:featuredmedia": z
        .array(
          z.object({
            source_url: z.string().optional(),
            alt_text: z.string().optional(),
          }),
        )
        .optional(),
      "wp:term": z.array(z.array(TermSchema)).optional(),
    })
    .optional(),
});

type Post = z.infer<typeof PostSchema>;
type Term = z.infer<typeof TermSchema>;

class SkipError extends Error {}

async function get(url: string): Promise<Response> {
  return fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    redirect: "manual",
  });
}

async function fetchPosts(): Promise<unknown[]> {
  const posts: unknown[] = [];
  let totalPages = 1;
  for (let page = 1; page <= totalPages; page++) {
    const url = `${API_URL}?per_page=100&page=${page}&_embed=1`;
    const res = await get(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    totalPages = Number(res.headers.get("x-wp-totalpages") ?? 1);
    const batch: unknown = await res.json();
    if (!Array.isArray(batch)) throw new Error(`Unexpected payload for ${url}`);
    posts.push(...batch);
    console.log(`REST page ${page}/${totalPages}: ${batch.length} posts`);
    await sleep(DELAY_MS);
  }
  return posts;
}

async function fetchArticleHtml(link: string): Promise<string> {
  let url = link;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const host = new URL(url).hostname;
    if (!OWN_HOSTS.has(host)) {
      throw new SkipError(`links to external site ${host}`);
    }
    const res = await get(url);
    const location = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && location) {
      url = new URL(location, url).href;
      continue;
    }
    if (!res.ok) throw new SkipError(`HTTP ${res.status} for ${url}`);
    return res.text();
  }
  throw new SkipError(`too many redirects for ${link}`);
}

function termsOf(post: Post, taxonomy: string): Term[] {
  return (post._embedded?.["wp:term"] ?? [])
    .flat()
    .filter((term) => term.taxonomy === taxonomy);
}

function categoryOf(post: Post): Category {
  const topics = termsOf(post, "blog_topic");
  const primary = post.blog_topic
    .map((id) => topics.find((term) => term.id === id))
    .find((term) => term !== undefined);
  return primary
    ? { slug: primary.slug, name: decodeText(primary.name) }
    : FALLBACK_CATEGORY;
}

function tagsOf(post: Post): string[] {
  const names = ["blog_topic", "blog_industry", "blog_format"]
    .flatMap((taxonomy) => termsOf(post, taxonomy))
    .map((term) => decodeText(term.name));
  return [...new Set(names)];
}

function imageOf(post: Post): Article["image"] {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  const url = media?.source_url ?? post.yoast_head_json?.og_image?.[0]?.url;
  return url ? { url, alt: decodeText(media?.alt_text ?? "") } : null;
}

function readingMinutes(lead: string, body: BodyBlock[]): number {
  const text = [
    lead,
    ...body.flatMap((block) =>
      block.type === "list"
        ? block.items.map((entry) => `${entry.title ?? ""} ${entry.text}`)
        : [block.text],
    ),
  ].join(" ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

async function buildArticle(post: Post): Promise<{
  article: Article;
  hasAuthors: boolean;
}> {
  const page = extractPage(await fetchArticleHtml(post.link));
  const body = [...page.body];
  const seoLead = decodeText(
    post.yoast_head_json?.description ||
      post.yoast_head_json?.og_description ||
      "",
  );
  let lead = page.lead || seoLead;
  if (!lead) {
    const index = body.findIndex((block) => block.type === "paragraph");
    const [first] = index >= 0 ? body.splice(index, 1) : [];
    if (first?.type === "paragraph") lead = first.text;
  }

  const article = ArticleSchema.parse({
    id: post.id,
    slug: post.slug,
    title: decodeText(post.title.rendered),
    lead,
    date: new Date(`${post.date_gmt}Z`).toISOString(),
    category: categoryOf(post),
    tags: tagsOf(post),
    authors:
      page.authors.length > 0
        ? page.authors.map((name) => AUTHOR_ALIASES[name] ?? name)
        : [FALLBACK_AUTHOR],
    image: imageOf(post),
    sourceUrl: post.link,
    readingMinutes: readingMinutes(lead, body),
    body,
  });
  return { article, hasAuthors: page.authors.length > 0 };
}

function describe(error: unknown): string {
  if (error instanceof z.ZodError) {
    return error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
  }
  return error instanceof Error ? error.message : String(error);
}

async function main(): Promise<void> {
  const rawPosts = await fetchPosts();
  const articles: Article[] = [];
  const skipped: { id: string; reason: string }[] = [];
  let withAuthors = 0;

  for (const [index, raw] of rawPosts.entries()) {
    const parsed = PostSchema.safeParse(raw);
    if (!parsed.success) {
      skipped.push({ id: `#${index}`, reason: describe(parsed.error) });
      continue;
    }
    const post = parsed.data;
    try {
      const { article, hasAuthors } = await buildArticle(post);
      if (articles.some((existing) => existing.slug === article.slug)) {
        throw new SkipError("duplicate slug");
      }
      articles.push(article);
      if (hasAuthors) withAuthors++;
      console.log(`ok    ${post.slug} (${article.body.length} blocks)`);
    } catch (error) {
      skipped.push({ id: post.slug, reason: describe(error) });
      console.warn(`skip  ${post.slug}: ${describe(error)}`);
    }
    await sleep(DELAY_MS);
  }

  articles.sort(
    (a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug),
  );
  const json = `${JSON.stringify(articles, null, 2)}\n`;
  await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await writeFile(OUTPUT_FILE, json);
  await writeFile(
    SLUGS_FILE,
    `${JSON.stringify(articles.map((article) => article.slug).sort())}\n`,
  );

  const blocks = articles.reduce((sum, a) => sum + a.body.length, 0);
  console.log("\nSummary");
  console.table({
    posts: rawPosts.length,
    written: articles.length,
    skipped: skipped.length,
    withAuthors,
    withImage: articles.filter((a) => a.image).length,
    avgBodyBlocks: Number((blocks / Math.max(1, articles.length)).toFixed(1)),
    sizeKB: Math.round(Buffer.byteLength(json) / 1024),
  });
  for (const { id, reason } of skipped) console.log(`skipped ${id}: ${reason}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
