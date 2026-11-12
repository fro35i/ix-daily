import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { SubscribeForm } from "@/components/subscription-forms";
import type { ArticleListItem } from "@/lib/news";
import { isSubscribed } from "@/lib/subscription";

async function HeroSubscribe() {
  if (await isSubscribed()) return null;
  return <SubscribeForm size="large" variant="quiet" />;
}

type HeroProps = {
  featured: ArticleListItem;
  total: number;
};

export function Hero({ featured, total }: HeroProps) {
  return (
    <section
      aria-labelledby="hero-heading"
      className="grid gap-10 lg:grid-cols-[7fr_5fr] lg:items-center lg:gap-16"
    >
      <div className="flex flex-col items-start gap-6">
        <p className="text-muted text-sm uppercase tracking-[0.16em]">
          The IBM iX Daily
        </p>
        <h1 id="hero-heading" className="font-light text-display">
          News and insights on digital experience and AI.
        </h1>
        <p className="max-w-xl text-lead text-muted">
          {total} articles by IBM iX designers, engineers and consultants on AI,
          customer experience, commerce and digital transformation.
        </p>
        <div className="flex flex-wrap items-start gap-4">
          <Link
            href="/search"
            className="inline-flex h-12 items-center gap-2 bg-brand px-6 text-white hover:bg-brand-hover active:bg-brand-active"
          >
            Browse articles
            <span aria-hidden="true">→</span>
          </Link>
          <Suspense fallback={<div className="h-12 w-32" />}>
            <HeroSubscribe />
          </Suspense>
        </div>
      </div>
      <Link
        href={`/articles/${featured.slug}`}
        className="group flex flex-col gap-3"
      >
        <div className="relative aspect-4/3 overflow-hidden bg-surface">
          {featured.image ? (
            <Image
              src={featured.image.url}
              alt=""
              fill
              preload
              fetchPriority="high"
              sizes="(min-width: 1120px) 400px, (min-width: 1024px) 38vw, calc(100vw - 2rem)"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : null}
        </div>
        <p className="text-sm">
          <span className="text-brand text-label uppercase">
            Featured story
          </span>
          <span
            lang="de"
            className="mt-1 block font-semibold text-ink text-lg group-hover:text-brand-hover"
          >
            {featured.title}
          </span>
        </p>
      </Link>
    </section>
  );
}
