import { formatDate } from "@/lib/format";
import type { ArticleListItem } from "@/lib/news";

type ArticleMetaProps = {
  article: Pick<ArticleListItem, "date" | "readingMinutes">;
  className?: string;
};

export function ArticleMeta({ article, className }: ArticleMetaProps) {
  return (
    <p className={`text-muted text-sm ${className ?? ""}`}>
      <time dateTime={article.date}>{formatDate(article.date)}</time>
      <span aria-hidden="true"> · </span>
      {article.readingMinutes} min read
    </p>
  );
}
