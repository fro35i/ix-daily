import Link from "next/link";

export default function ArticleNotFound() {
  return (
    <div className="page-container flex flex-col items-start gap-4 py-16">
      <p className="text-brand text-label uppercase">404</p>
      <h1 className="text-h1">Article not found</h1>
      <p className="max-w-xl text-lead text-muted">
        The article does not exist or was removed.
      </p>
      <div className="flex gap-6">
        <Link
          href="/"
          className="text-brand underline underline-offset-4 hover:text-brand-hover"
        >
          Go to the homepage
        </Link>
        <Link
          href="/search"
          className="text-brand underline underline-offset-4 hover:text-brand-hover"
        >
          Search articles
        </Link>
      </div>
    </div>
  );
}
