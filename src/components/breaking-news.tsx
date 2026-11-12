import Link from "next/link";
import type { ReactNode } from "react";
import { getBreakingNews } from "@/lib/news";

function BreakingNewsFrame({ children }: { children: ReactNode }) {
  return (
    <aside aria-label="Breaking news" className="bg-brand-deep text-white">
      <div className="page-container flex min-h-18 items-center sm:min-h-12 gap-3 py-3">
        <span className="shrink-0 bg-brand-light px-2 py-0.5 font-normal text-brand-deep text-label uppercase">
          Breaking
        </span>
        {children}
      </div>
    </aside>
  );
}

export async function BreakingNews() {
  const banner = await getBreakingNews();
  if (!banner) return null;

  return (
    <BreakingNewsFrame>
      <Link
        href={`/articles/${banner.articleSlug}`}
        className="underline-offset-4 hover:underline"
      >
        {banner.headline}
      </Link>
    </BreakingNewsFrame>
  );
}

export function BreakingNewsSkeleton() {
  return (
    <BreakingNewsFrame>
      <span className="h-4 w-2/3 max-w-md animate-pulse bg-white/20" />
    </BreakingNewsFrame>
  );
}
