import { ArticleBody, needsHeadingPromotion } from "@/components/article-body";
import { SubscribeForm } from "@/components/subscription-forms";
import { getArticle } from "@/lib/news";
import { isSubscribed } from "@/lib/subscription";

export const PREVIEW_BLOCKS = 2;

function Paywall() {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-24 h-24 bg-linear-to-b from-white/0 to-white"
      />
      <section
        aria-labelledby="paywall-heading"
        className="flex flex-col items-start gap-4 bg-brand-soft p-6 md:p-10"
      >
        <h2 id="paywall-heading" className="text-h3">
          Subscribe to read the full article
        </h2>
        <p className="max-w-xl">
          The subscription is free and lasts until you close the browser. You
          can cancel it at any time from the header.
        </p>
        <SubscribeForm size="large" />
      </section>
    </div>
  );
}

/** Renders the rest of the article for subscribers and the paywall for everyone else. */
export async function ArticleRest({ slug }: { slug: string }) {
  if (!(await isSubscribed())) return <Paywall />;

  const article = await getArticle(slug);
  if (!article) return null;

  const rest = article.body.slice(PREVIEW_BLOCKS);
  return rest.length > 0 ? (
    <ArticleBody
      blocks={rest}
      promoteHeadings={needsHeadingPromotion(article.body)}
    />
  ) : null;
}

export function ArticleRestSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      <div className="h-4 w-full animate-pulse bg-surface" />
      <div className="h-4 w-11/12 animate-pulse bg-surface" />
      <div className="h-4 w-4/5 animate-pulse bg-surface" />
    </div>
  );
}
