import { ArrowLeft, CheckCircle2, Clock, ServerCrash, XCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PayPanel } from "@/components/payment/pay-panel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { orderRef } from "@/lib/orders";
import { payGate } from "@/lib/payments";
import { loadOrder } from "@/lib/rentals";
import { formatRentalRange, money } from "@/lib/utils";
import type { RentalOrder } from "@/types/api";

const gateIcons = {
  paid: CheckCircle2,
  waiting: Clock,
  closed: XCircle,
};

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
        ? `Pay rental ${orderRef(lookup.order.id)} — GearUp`
        : "Rental not found — GearUp",
  };
}

function Summary({ order }: { order: RentalOrder }) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Order summary</CardTitle>
        <CardDescription className="tabular-nums">
          Rental {orderRef(order.id)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between gap-4 text-sm">
              <span className="min-w-0">
                <span className="block truncate font-medium">
                  {item.gearItem?.name ?? "Gear item"}
                </span>
                <span className="text-muted-foreground">
                  {item.quantity} × {money(item.pricePerDay)}/day × {item.days}{" "}
                  day{item.days === 1 ? "" : "s"}
                </span>
              </span>
              <span className="shrink-0 tabular-nums">
                {money(item.subtotal)}
              </span>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          {formatRentalRange(order.startDate, order.endDate)}
        </p>

        <div className="flex items-center justify-between border-t border-border pt-4 text-base font-semibold">
          <span>Total due</span>
          <span className="tabular-nums">{money(order.totalPrice)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function PayOrderPage({
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
  const orderHref = `/dashboard/customer/orders/${order.id}`;

  const gate = payGate(order.status);

  if (gate.kind !== "form") {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <EmptyState
          icon={gateIcons[gate.kind]}
          title={gate.title}
          description={gate.description}
          action={
            <Button asChild>
              <Link href={orderHref}>Back to the order</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={orderHref}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to the order
      </Link>

      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Pay for your rental</h1>
        <p className="mt-1 text-muted-foreground">
          Your booking is confirmed. Pay {money(order.totalPrice)} to secure the
          gear.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Card details</CardTitle>
            <CardDescription>
              Use Stripe test card 4242 4242 4242 4242 with any future expiry.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PayPanel orderId={order.id} amount={order.totalPrice} />
          </CardContent>
        </Card>

        <Summary order={order} />
      </div>
    </div>
  );
}
