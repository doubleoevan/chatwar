/**
 * typed version of Object.entries
 */
export function typedEntries<T extends Record<PropertyKey, unknown>>(
  object: T,
): Array<[keyof T, T[keyof T]]> {
  return Object.entries(object) as Array<[keyof T, T[keyof T]]>;
}
