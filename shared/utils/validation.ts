export function isNil<T>(
  value: T | undefined | null
): value is null | undefined {
  return value === null || value === undefined;
}

export function isNotNil<T>(value: T | undefined | null): value is T {
  return !isNil(value);
}

export function isEmpty<T>(
  value: T | undefined | null
): value is null | undefined {
  if (isNil(value)) return true;
  if (typeof value === 'string') return value.length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object')
    return Object.keys(value as object).length === 0;
  return false;
}
