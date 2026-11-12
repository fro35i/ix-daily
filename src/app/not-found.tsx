import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="page-container flex flex-col items-start gap-4 py-16">
      <p className="text-brand text-label uppercase">404</p>
      <h1 className="text-h1">Page not found</h1>
      <p className="max-w-xl text-lead text-muted">The page does not exist.</p>
      <Link
        href="/"
        className="text-brand underline underline-offset-4 hover:text-brand-hover"
      >
        Go to the homepage
      </Link>
    </div>
  );
}
