/** Shallow compare two plain objects (or values via Object.is). */
export function shallow(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) {
    return true;
  }
  if (
    typeof a !== "object" ||
    a === null ||
    typeof b !== "object" ||
    b === null
  ) {
    return false;
  }

  const aKeys = Reflect.ownKeys(a as object);
  const bKeys = Reflect.ownKeys(b as object);
  if (aKeys.length !== bKeys.length) {
    return false;
  }

  for (const key of aKeys) {
    if (
      !Reflect.has(b as object, key) ||
      !Object.is(
        (a as Record<PropertyKey, unknown>)[key],
        (b as Record<PropertyKey, unknown>)[key],
      )
    ) {
      return false;
    }
  }

  return true;
}
