import Image from "next/image";
import Link from "next/link";
import { ArticleMeta } from "@/components/article-meta";
import type { ArticleListItem } from "@/lib/news";

export function ArticleCard({ article }: { article: ArticleListItem }) {
  return (
    <article className="group relative flex flex-col gap-4">
      <div className="relative aspect-video overflow-hidden bg-surface">
        {article.image ? (
          <Image
            src={article.image.url}
            alt=""
            fill
            sizes="(min-width: 1024px) 352px, (min-width: 640px) 50vw, calc(100vw - 2rem)"
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <p lang="de" className="text-brand text-label uppercase">
          {article.category.name}
        </p>
        <h3 lang="de" className="text-h3 group-hover:text-brand-hover">
          <Link
            href={`/articles/${article.slug}`}
            className="after:absolute after:inset-0"
          >
            {article.title}
          </Link>
        </h3>
        <p lang="de" className="line-clamp-2 text-muted">
          {article.lead}
        </p>
        <ArticleMeta article={article} />
      </div>
    </article>
  );
}
