import { z } from "zod";

export const MIN_QUERY_LENGTH = 3;
export const MAX_QUERY_LENGTH = 100;
export const MAX_RESULTS = 5;

const firstValue = (value: unknown) =>
  Array.isArray(value) ? value[0] : value;

const SearchParamsSchema = z.object({
  q: z.preprocess(
    firstValue,
    z
      .string()
      .transform((value) => value.trim().slice(0, MAX_QUERY_LENGTH))
      .catch(""),
  ),
  category: z.preprocess(
    firstValue,
    z
      .string()
      .regex(/^[a-z0-9-]+$/)
      .optional()
      .catch(undefined),
  ),
});

export type SearchState = z.infer<typeof SearchParamsSchema>;

/** Turns raw search params into a safe query and category. Bad values become empty. */
export function parseSearchParams(
  params: Record<string, string | string[] | undefined>,
): SearchState {
  return SearchParamsSchema.parse({
    q: params.q ?? "",
    category: params.category,
  });
}
