/**
 * typed version of Object.entries
 */
export function typedEntries<T extends Record<PropertyKey, unknown>>(
  object: T,
): Array<[keyof T, T[keyof T]]> {
  return Object.entries(object) as Array<[keyof T, T[keyof T]]>;
}

/**
 * typed version of Object.keys
 */
export function typedKeys<T extends Record<PropertyKey, unknown>>(object: T): Array<keyof T> {
  return Object.keys(object) as Array<keyof T>;
}

/**
 * typed version of Object.values
 */
export function typedValues<T extends Record<PropertyKey, unknown>>(object: T): Array<T[keyof T]> {
  return Object.values(object) as Array<T[keyof T]>;
}
