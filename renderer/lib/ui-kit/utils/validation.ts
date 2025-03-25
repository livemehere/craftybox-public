export function isNil<T>(value: T | undefined | null): value is null | undefined {
  return value === null || value === undefined;
}

export function isNotNil<T>(value: T | undefined | null): value is T {
  return !isNil(value);
}
