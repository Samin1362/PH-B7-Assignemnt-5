import { ArrowLeft, CreditCard, ServerCrash } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  PaymentStatusBadge,
  StatusBadge,
} from "@/components/dashboard/status-badge";
import { CancelOrderButton } from "@/components/rental/cancel-order-button";
import { OrderTimeline } from "@/components/rental/order-timeline";
import { ReviewDialog } from "@/components/review/review-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { rentalStatusMeta } from "@/constants/status";
import { orderRef } from "@/lib/orders";
import { loadOrder } from "@/lib/rentals";
import { loadMyReviews, reviewKey } from "@/lib/reviews";
import { getSession } from "@/lib/session";
import {
  daysBetween,
  formatDateTime,
  formatRentalDate,
  money,
} from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const lookup = await loadOrder(id);

  return {
    title:
      lookup.status === "ok"
        ? `Rental ${orderRef(lookup.order.id)} — GearUp`
        : "Rental not found — GearUp",
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

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lookup = await loadOrder(id);

  if (lookup.status === "missing") {
    notFound();
  }

  if (lookup.status === "error") {
    return (
      <EmptyState
        icon={ServerCrash}
        title="Rental could not be loaded"
        description="We could not reach the GearUp service. Please try again in a moment."
      />
    );
  }

  const { order } = lookup;
  const meta = rentalStatusMeta[order.status];

  // Only a returned rental can be reviewed, so nothing else pays for the
  // extra per-gear lookups that say which items are already done.
  // `getSession()` is cached by the layout, so it costs nothing here.
  const user = order.status === "RETURNED" ? await getSession() : null;
  const reviewed = user
    ? await loadMyReviews(
        order.items.map((item) => item.gearItemId),
        user.id,
      )
    : null;
  // Every item carries the days the server actually billed, so prefer it.
  const days = order.items[0]?.days ?? daysBetween(order.startDate, order.endDate);

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/customer/orders"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All rentals
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tabular-nums sm:text-3xl">
              Rental {orderRef(order.id)}
            </h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-muted-foreground">
            {meta.description} · placed {formatDateTime(order.createdAt)}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {order.status === "PLACED" ? (
            <CancelOrderButton orderId={order.id} />
          ) : null}
          {order.status === "CONFIRMED" ? (
            <Button asChild>
              <Link href={`/dashboard/customer/orders/${order.id}/pay`}>
                <CreditCard />
                Pay now
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                Gear ({order.items.length} item
                {order.items.length === 1 ? "" : "s"})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/gear/${item.gearItemId}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {item.gearItem?.name ?? "Gear item"}
                    </Link>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {item.gearItem?.brand ? `${item.gearItem.brand} · ` : ""}
                      {item.quantity} × {money(item.pricePerDay)}/day ×{" "}
                      {item.days} day{item.days === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <p className="font-medium tabular-nums">
                      {money(item.subtotal)}
                    </p>
                    {reviewed ? (
                      <ReviewDialog
                        gearItemId={item.gearItemId}
                        gearName={item.gearItem?.name ?? "this gear"}
                        rentalOrderId={order.id}
                        reviewed={reviewed.has(
                          reviewKey(item.gearItemId, order.id),
                        )}
                      />
                    ) : null}
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between border-t border-border pt-4 text-base font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{money(order.totalPrice)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rental details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl>
                <Row label="Pick-up" value={formatRentalDate(order.startDate)} />
                <Row label="Return" value={formatRentalDate(order.endDate)} />
                <Row
                  label="Duration"
                  value={`${days} day${days === 1 ? "" : "s"}`}
                />
                <Row
                  label="Payment"
                  value={
                    order.payment ? (
                      <span className="flex items-center gap-2">
                        <PaymentStatusBadge status={order.payment.status} />
                        <span className="tabular-nums">
                          {money(order.payment.amount)}
                        </span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Not started</span>
                    )
                  }
                />
                {order.payment?.paidAt ? (
                  <Row
                    label="Paid on"
                    value={formatDateTime(order.payment.paidAt)}
                  />
                ) : null}
              </dl>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderTimeline order={order} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
