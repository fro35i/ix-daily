import { z } from "zod";

const text = z.string().trim().min(1);

const CategorySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: text,
});

const BodyBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("paragraph"), text }),
  z.object({
    type: z.literal("heading"),
    level: z.union([z.literal(2), z.literal(3)]),
    text,
  }),
  z.object({
    type: z.literal("list"),
    ordered: z.boolean(),
    items: z
      .array(z.object({ title: text.optional(), text: z.string().trim() }))
      .min(1),
  }),
  z.object({
    type: z.literal("quote"),
    text,
    attribution: text.optional(),
  }),
]);

export const ArticleSchema = z.object({
  id: z.number().int().positive(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: text,
  lead: text,
  date: z.iso.datetime(),
  category: CategorySchema,
  tags: z.array(text),
  authors: z.array(text).min(1),
  image: z.object({ url: z.url(), alt: z.string() }).nullable(),
  sourceUrl: z.url(),
  readingMinutes: z.number().int().positive(),
  body: z.array(BodyBlockSchema).min(1),
});

export const BannerSchema = z.object({
  id: text,
  headline: text,
  articleSlug: z.string().regex(/^[a-z0-9-]+$/),
});

export type Category = z.infer<typeof CategorySchema>;
export type BodyBlock = z.infer<typeof BodyBlockSchema>;
export type Article = z.infer<typeof ArticleSchema>;
export type ArticleListItem = Omit<Article, "body">;
export type Banner = z.infer<typeof BannerSchema>;
