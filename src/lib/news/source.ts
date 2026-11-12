import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import {
  type Article,
  ArticleSchema,
  type Banner,
  BannerSchema,
} from "./schema";

const CONTENT_DIR = path.join(process.cwd(), "content");

export type SearchEntry = {
  article: Article;
  title: string;
  lead: string;
  body: string;
};

async function readJson(file: string): Promise<unknown> {
  return JSON.parse(await readFile(path.join(CONTENT_DIR, file), "utf8"));
}

/** Runs the loader once per server process and retries after a failure. */
function once<T>(load: () => Promise<T>): () => Promise<T> {
  let pending: Promise<T> | undefined;
  return () => {
    pending ??= load().catch((error: unknown) => {
      pending = undefined;
      throw error;
    });
    return pending;
  };
}

// The article JSON only changes with a deploy, so one parse per process is enough.
export const readArticles = once(async () =>
  z.array(ArticleSchema).parse(await readJson("articles.json")),
);

export async function readBanner(): Promise<Banner> {
  return BannerSchema.parse(await readJson("banner.json"));
}

export function normalize(value: string): string {
  return value
    .normalize("NFC")
    .toLocaleLowerCase("de-DE")
    .replace(/\s+/g, " ")
    .trim();
}

function plainText(article: Article): string {
  return article.body
    .flatMap((block) =>
      block.type === "list"
        ? block.items.map((item) => `${item.title ?? ""} ${item.text}`)
        : [block.text],
    )
    .join(" ");
}

export const readSearchIndex = once(
  async (): Promise<SearchEntry[]> =>
    (await readArticles()).map((article) => ({
      article,
      title: normalize(article.title),
      lead: normalize(article.lead),
      body: normalize(plainText(article)),
    })),
);
