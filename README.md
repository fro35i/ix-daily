# IBM iX Daily

A news site built with Next.js 16 and Cache Components. The articles are real posts from the [IBM iX blog](https://www.ibmix.de/blog), stored as JSON in this repo.

## Features

- Homepage with a breaking news banner, a hero article and the latest articles
- Article pages with metadata, trending articles and a server-side paywall
- Free subscription stored in an `httpOnly` cookie, set by Server Actions
- Search with debounce, topic filter and the state in the URL
- `proxy.ts` returns a real 404 for unknown article slugs

## Requirements

- Node 24
- pnpm 12

## Getting started

```bash
pnpm install
pnpm dev
```

Open http://localhost:3002.

## Scripts

| Command          | Action                                                                           |
| ---------------- | -------------------------------------------------------------------------------- |
| `pnpm dev`       | Start the dev server on port 3002                                                |
| `pnpm build`     | Make a production build                                                          |
| `pnpm start`     | Serve the build on port 3002                                                     |
| `pnpm lint`      | Run Biome                                                                        |
| `pnpm format`    | Fix Biome findings and format                                                    |
| `pnpm typecheck` | Generate route types and run `tsc`                                               |
| `pnpm ingest`    | Fetch the IBM iX blog and write `content/articles.json` and `content/slugs.json` |

## Project structure

| Path                       | Content                                                                                 |
| -------------------------- | --------------------------------------------------------------------------------------- |
| `src/app`                  | Routes: `/`, `/articles/[slug]`, `/search`, not-found, Open Graph image, Server Actions |
| `src/components`           | UI components. Client components: search form, subscription forms                       |
| `src/lib/news`             | Server-only data layer with `use cache`                                                 |
| `src/lib/search-params.ts` | Search limits and a Zod parser, shared by server and client                             |
| `src/proxy.ts`             | 404 for unknown article slugs                                                           |
| `scripts`                  | Ingest script and HTML extraction                                                       |
| `content`                  | Article data, slug list and the banner                                                  |

## Content

- `pnpm ingest` reads the WordPress REST API of ibmix.de and fetches each article page one at a time.
- The script validates every record with Zod and skips records that fail.
- The build and the app never call ibmix.de for text. Images load from ibmix.de through `next/image`.
- The articles are in German. The interface is in English.
- The breaking news banner in `content/banner.json` is fictional. All other content is real.
