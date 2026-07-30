"use client";

import { Pagination } from "@/components/dashboard/pagination";
import { useQueryParams } from "@/hooks/use-query-params";

export function GearPagination({
  page,
  limit,
  total,
}: {
  page: number;
  limit: number;
  total: number;
}) {
  const { setParams } = useQueryParams();

  return (
    <Pagination
      page={page}
      limit={limit}
      total={total}
      onPageChange={(next) => {
        setParams({ page: next > 1 ? next : null });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    />
  );
}
