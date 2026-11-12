import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";

type SiteHeaderProps = {
  subscription?: ReactNode;
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
] as const;

export function SiteHeader({ subscription }: SiteHeaderProps) {
  return (
    <header className="border-line border-b bg-white">
      <div className="page-container flex flex-wrap items-center gap-x-4 pt-3 sm:h-16 sm:flex-nowrap sm:pt-0 md:gap-x-8">
        <Link
          href="/"
          className="flex items-center gap-2 py-2 text-ink"
          aria-label="IBM iX Daily, home"
        >
          <Logo className="h-6 w-auto" />
          <span className="font-normal text-lg leading-none">Daily</span>
        </Link>
        <nav
          aria-label="Main"
          className="order-last w-full sm:order-none sm:w-auto sm:flex-1"
        >
          <ul className="flex gap-4 md:gap-6">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-block py-2 text-ink underline-offset-4 hover:text-brand hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {subscription ? (
          <div className="ml-auto flex items-center sm:ml-0">
            {subscription}
          </div>
        ) : null}
      </div>
    </header>
  );
}
