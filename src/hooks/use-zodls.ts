"use client";

import { useCallback, useState } from "react";
import { type z } from "zod";

type ValueSetter<T> = (currentValue: T) => T;

type UseZodls<T> = [
  /** The current value from localStorage (defaults to defaultValue if not found) */
  value: T,
  /** Updates localStorage with the new value. Throws if value doesn't match schema. */
  set: (value: T | ValueSetter<T>) => void,
];

/**
 * React hook enabling type-safe access to localStorage with Zod validation
 *
 * @param key - the localStorage key
 * @param schema - Zod schema to validate the data
 * @param defaultValue - default value if not found or invalid
 *
 * @example
 * ```tsx
 * const schema = z.object({ name: z.string() })
 * const [value, setValue] = useZodls("my-key", schema, { name: "default" })
 * setValue({ name: "newName" })
 * setValue((current) => ({ ...current, name: "updated" }))
 * ```
 */
export function useZodls<T>(
  key: string,
  schema: z.ZodSchema<T>,
  defaultValue: T,
): UseZodls<T> {
  const get = useCallback((): T => {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return defaultValue;
      const parsed = schema.safeParse(JSON.parse(stored));
      if (!parsed.success) return defaultValue;
      return parsed.data;
    } catch {
      return defaultValue;
    }
  }, [key, schema, defaultValue]);

  const [value, setValue] = useState<T>(get);

  const set = useCallback(
    (newValue: T | ValueSetter<T>) => {
      const resolved =
        typeof newValue === "function"
          ? (newValue as ValueSetter<T>)(get())
          : newValue;
      schema.parse(resolved);
      localStorage.setItem(key, JSON.stringify(resolved));
      setValue(resolved);
    },
    [get, schema, key],
  );

  return [value, set];
}
