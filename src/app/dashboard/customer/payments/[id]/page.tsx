import { ArrowLeft, ServerCrash } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PaymentStatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { serverFetch } from "@/lib/api";
import { toApiError } from "@/lib/api-error";
import { orderRef } from "@/lib/orders";
import { formatDateTime, formatRentalRange, money } from "@/lib/utils";
import type { Payment } from "@/types/api";

type Lookup =
  | { status: "ok"; payment: Payment }
  | { status: "missing" }
  | { status: "error" };

/** Someone else's payment is a 403, which must not confirm it exists. */
const loadPayment = cache(async (id: string): Promise<Lookup> => {
  try {
    const result = await serverFetch<Payment>(`/payments/${id}`);
    return { status: "ok", payment: result.data };
  } catch (error) {
    const { status } = toApiError(error);
    return status >= 400 && status < 500
      ? { status: "missing" }
      : { status: "error" };
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const lookup = await loadPayment(id);

  return {
    title:
      lookup.status === "ok"
        ? `Receipt ${orderRef(lookup.payment.rentalOrderId)} — GearUp`
        : "Receipt not found — GearUp",
  };
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-2.5 last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

export default async function PaymentReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lookup = await loadPayment(id);

  if (lookup.status === "missing") {
    notFound();
  }

  if (lookup.status === "error") {
    return (
      <EmptyState
        icon={ServerCrash}
        title="Receipt could not be loaded"
        description="We could not reach the GearUp service. Please try again in a moment."
      />
    );
  }

  const { payment } = lookup;
  const order = payment.rentalOrder;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/dashboard/customer/payments"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All payments
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold sm:text-3xl">Receipt</h1>
        <PaymentStatusBadge status={payment.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="tabular-nums">{money(payment.amount)}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl>
            <Row
              label="Rental"
              value={
                <Link
                  href={`/dashboard/customer/orders/${payment.rentalOrderId}`}
                  className="tabular-nums underline-offset-4 hover:underline"
                >
                  {orderRef(payment.rentalOrderId)}
                </Link>
              }
            />
            {order ? (
              <Row
                label="Rental period"
                value={formatRentalRange(order.startDate, order.endDate)}
              />
            ) : null}
            {order ? (
              <Row label="Order total" value={money(order.totalPrice)} />
            ) : null}
            <Row label="Method" value={payment.provider} />
            <Row label="Started" value={formatDateTime(payment.createdAt)} />
            <Row
              label="Paid"
              value={
                payment.paidAt ? (
                  formatDateTime(payment.paidAt)
                ) : (
                  <span className="text-muted-foreground">Not yet</span>
                )
              }
            />
            {payment.transactionId ? (
              <Row
                label="Transaction"
                value={
                  <span className="font-mono text-xs">
                    {payment.transactionId}
                  </span>
                }
              />
            ) : null}
          </dl>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link href={`/dashboard/customer/orders/${payment.rentalOrderId}`}>
            View the rental
          </Link>
        </Button>
      </div>
    </div>
  );
}
