/** Use as a query's `placeholderData`. Keeps the previous page's rows visible
 * while fetching the next/previous page of the SAME filters — smooth
 * pagination, no flicker. Drops them the instant any filter other than `skip`
 * changes, so the old filter's results can't linger on screen looking like
 * "no results" or "the same results" for however long the new request takes. */
export function placeholderDataSamePage<F extends { skip?: number }, D>(
  previousData: D | undefined,
  previousQuery: { queryKey: readonly unknown[] } | undefined,
  currentFilters: F,
): D | undefined {
  if (!previousQuery) return undefined;
  const previousFilters = previousQuery.queryKey.at(-1) as F | undefined;
  if (!previousFilters) return undefined;

  const previousRest: Record<string, unknown> = { ...previousFilters };
  const currentRest: Record<string, unknown> = { ...currentFilters };
  delete previousRest.skip;
  delete currentRest.skip;
  return JSON.stringify(previousRest) === JSON.stringify(currentRest) ? previousData : undefined;
}
