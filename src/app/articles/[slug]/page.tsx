import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleBody, needsHeadingPromotion } from "@/components/article-body";
import { ArticleMeta } from "@/components/article-meta";
import {
  ArticleRest,
  ArticleRestSkeleton,
  PREVIEW_BLOCKS,
} from "@/components/paywall";
import { Trending, TrendingSkeleton } from "@/components/trending";
import { getArticle, getArticles } from "@/lib/news";

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/articles/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Article not found" };

  const url = `/articles/${article.slug}`;
  const images = article.image
    ? [{ url: article.image.url, alt: article.title }]
    : undefined;

  return {
    title: article.title,
    description: article.lead,
    authors: article.authors.map((name) => ({ name })),
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: article.title,
      description: article.lead,
      locale: "de_DE",
      publishedTime: article.date,
      authors: article.authors,
      section: article.category.name,
      tags: article.tags,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.lead,
      images,
    },
  };
}

function formatAuthors(authors: string[]): string {
  return new Intl.ListFormat("en", { type: "conjunction" }).format(authors);
}

export default function ArticlePage({ params }: PageProps<"/articles/[slug]">) {
  return (
    <div className="page-container flex flex-col gap-12 py-10 md:gap-16 md:py-16">
      <Suspense fallback={<ArticleSkeleton />}>
        <ArticleView params={params} />
      </Suspense>
    </div>
  );
}

function ArticleSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto flex w-full max-w-3xl flex-col gap-4"
    >
      <div className="h-3 w-16 animate-pulse bg-surface" />
      <div className="h-12 w-5/6 animate-pulse bg-surface" />
      <div className="h-6 w-full animate-pulse bg-surface" />
      <div className="h-6 w-2/3 animate-pulse bg-surface" />
      <div className="mt-4 aspect-video animate-pulse bg-surface" />
    </div>
  );
}

async function ArticleView({
  params,
}: Pick<PageProps<"/articles/[slug]">, "params">) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  return (
    <>
      <article className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="flex flex-col gap-4">
          <p lang="de" className="text-brand text-label uppercase">
            {article.category.name}
          </p>
          <h1 lang="de" className="text-h1">
            {article.title}
          </h1>
          <p lang="de" className="text-lead">
            {article.lead}
          </p>
          <div className="flex flex-col gap-1">
            <p className="text-ink">By {formatAuthors(article.authors)}</p>
            <ArticleMeta article={article} />
          </div>
        </header>
        {article.image ? (
          <div className="relative aspect-video overflow-hidden bg-surface">
            <Image
              src={article.image.url}
              alt=""
              fill
              preload
              fetchPriority="high"
              sizes="(min-width: 768px) 768px, calc(100vw - 2rem)"
              className="object-cover"
            />
          </div>
        ) : null}
        <div className="flex flex-col gap-5">
          <ArticleBody
            blocks={article.body.slice(0, PREVIEW_BLOCKS)}
            promoteHeadings={needsHeadingPromotion(article.body)}
          />
          <Suspense fallback={<ArticleRestSkeleton />}>
            <ArticleRest slug={article.slug} />
          </Suspense>
        </div>
        <p className="border-line border-t pt-6 text-muted text-sm">
          First published on the{" "}
          <a
            href={article.sourceUrl}
            className="text-brand underline underline-offset-4 hover:text-brand-hover"
          >
            IBM iX blog
          </a>
          .
        </p>
      </article>
      <Suspense fallback={<TrendingSkeleton />}>
        <Trending slug={article.slug} />
      </Suspense>
    </>
  );
}
