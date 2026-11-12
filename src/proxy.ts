import { type NextRequest, NextResponse } from "next/server";
import slugs from "../content/slugs.json";

const knownSlugs = new Set<string>(slugs);

// Pages stream with status 200 before notFound() runs, so unknown slugs get their 404 here.
export function proxy(request: NextRequest) {
  const slug = decodeURIComponent(request.nextUrl.pathname.split("/")[2] ?? "");
  if (knownSlugs.has(slug)) return NextResponse.next();

  return NextResponse.rewrite(new URL("/404", request.url), { status: 404 });
}

export const config = {
  matcher: "/articles/:slug",
};
