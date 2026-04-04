"use client";

import { useState, useMemo } from "react";

export function usePagination<T>(items: T[], pageSize = 15) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // Reset to page 1 when the items list changes (filter applied)
  const safePage = Math.min(page, totalPages);

  const paginated = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize]
  );

  function goTo(p: number) {
    setPage(Math.max(1, Math.min(p, totalPages)));
  }

  return {
    page: safePage,
    totalPages,
    paginated,
    goTo,
    hasNext: safePage < totalPages,
    hasPrev: safePage > 1,
  };
}
