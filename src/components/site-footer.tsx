import { cacheLife } from "next/cache";
import { Logo } from "@/components/logo";

async function CopyrightYear() {
  "use cache";
  cacheLife("days");

  return <>{new Date().getFullYear()}</>;
}

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-ink text-white">
      <div className="page-container flex flex-col gap-8 py-12 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-auto" />
            <span className="text-lg">Daily</span>
          </div>
          <p className="max-w-sm text-sm text-white/70">
            Articles from the{" "}
            <a
              href="https://www.ibmix.de/blog"
              className="underline underline-offset-4 hover:text-brand-light"
            >
              IBM iX blog
            </a>
            .
          </p>
        </div>
        <p className="text-sm text-white/70">
          © <CopyrightYear /> IBM iX
        </p>
      </div>
    </footer>
  );
}
