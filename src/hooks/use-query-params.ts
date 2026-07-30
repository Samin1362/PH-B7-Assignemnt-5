"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

export type ParamPatch = Record<
  string,
  string | number | boolean | null | undefined
>;

/**
 * Keeps filter state in the URL so every view is shareable and server-rendered.
 * Any patch that is not explicitly about paging sends the user back to page 1.
 */
export function useQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pending = useRef<ParamPatch>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setParams = useCallback(
    (patch: ParamPatch) => {
      const next = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === undefined || value === "" || value === false) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }

      if (!("page" in patch)) {
        next.delete("page");
      }

      const query = next.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const setParamsDebounced = useCallback(
    (patch: ParamPatch, delay = 400) => {
      pending.current = { ...pending.current, ...patch };

      if (timer.current) {
        clearTimeout(timer.current);
      }

      timer.current = setTimeout(() => {
        const merged = pending.current;
        pending.current = {};
        timer.current = null;
        setParams(merged);
      }, delay);
    },
    [setParams],
  );

  const resetParams = useCallback(() => {
    pending.current = {};
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    [],
  );

  return { searchParams, setParams, setParamsDebounced, resetParams };
}
