import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { orderGearLabel, orderRef } from "@/lib/orders";
import { formatDate, formatRentalRange, money } from "@/lib/utils";
import type { RentalOrder } from "@/types/api";

/**
 * A table on desktop and stacked cards on phones — a rental row has six
 * columns, which is more than a small screen can show without scrolling.
 */
export function OrderList({ orders }: { orders: RentalOrder[] }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Gear</TableHead>
              <TableHead>Rental period</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-muted/50">
                <TableCell>
                  <Link
                    href={`/dashboard/customer/orders/${order.id}`}
                    className="font-medium tabular-nums underline-offset-4 hover:underline"
                  >
                    {orderRef(order.id)}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </p>
                </TableCell>
                <TableCell className="max-w-56 truncate">
                  {orderGearLabel(order)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatRentalRange(order.startDate, order.endDate)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {money(order.totalPrice)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell>
                  <ChevronRight
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="space-y-3 md:hidden">
        {orders.map((order) => (
          <li key={order.id}>
            <Link
              href={`/dashboard/customer/orders/${order.id}`}
              className="block rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium tabular-nums">
                  {orderRef(order.id)}
                </span>
                <StatusBadge status={order.status} />
              </div>
              <p className="mt-2 truncate text-sm">{orderGearLabel(order)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatRentalRange(order.startDate, order.endDate)}
              </p>
              <p className="mt-3 font-semibold tabular-nums">
                {money(order.totalPrice)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

export function OrderListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-20 w-full rounded-2xl" />
      ))}
    </div>
  );
}
