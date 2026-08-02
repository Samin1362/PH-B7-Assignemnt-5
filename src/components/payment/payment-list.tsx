import Link from "next/link";
import { PaymentStatusBadge } from "@/components/dashboard/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { orderRef } from "@/lib/orders";
import { formatDateTime, money } from "@/lib/utils";
import type { Payment } from "@/types/api";

function paidLabel(payment: Payment) {
  return payment.paidAt ? formatDateTime(payment.paidAt) : "—";
}

export function PaymentList({ payments }: { payments: Payment[] }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rental</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id} className="hover:bg-muted/50">
                <TableCell>
                  <Link
                    href={`/dashboard/customer/orders/${payment.rentalOrderId}`}
                    className="font-medium tabular-nums underline-offset-4 hover:underline"
                  >
                    {orderRef(payment.rentalOrderId)}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {payment.provider}
                  </p>
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatDateTime(payment.createdAt)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {paidLabel(payment)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {money(payment.amount)}
                </TableCell>
                <TableCell>
                  <PaymentStatusBadge status={payment.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="space-y-3 md:hidden">
        {payments.map((payment) => (
          <li
            key={payment.id}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <Link
                href={`/dashboard/customer/orders/${payment.rentalOrderId}`}
                className="font-medium tabular-nums underline-offset-4 hover:underline"
              >
                {orderRef(payment.rentalOrderId)}
              </Link>
              <PaymentStatusBadge status={payment.status} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Started {formatDateTime(payment.createdAt)}
            </p>
            {payment.paidAt ? (
              <p className="text-xs text-muted-foreground">
                Paid {formatDateTime(payment.paidAt)}
              </p>
            ) : null}
            <p className="mt-3 font-semibold tabular-nums">
              {money(payment.amount)}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}

export function PaymentListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-16 w-full rounded-2xl" />
      ))}
    </div>
  );
}
