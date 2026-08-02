"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { clientFetchData } from "@/lib/client-api";
import { orderRef } from "@/lib/orders";
import { money } from "@/lib/utils";
import type { RentalOrder } from "@/types/api";

const POLL_MS = 2000;
const MAX_ATTEMPTS = 15;

/**
 * Stripe confirms on the client but the order only flips to PAID when the
 * signature-verified webhook reaches the API, so this polls for that instead
 * of claiming success the UI cannot see yet.
 */
export function PaymentStatusCard({ orderId }: { orderId: string }) {
  // Counted rather than timed: a clock read during render is impure.
  const [attempts, setAttempts] = useState(0);

  const order = useQuery({
    queryKey: ["rentals", orderId],
    queryFn: async () => {
      const data = await clientFetchData<RentalOrder>(`/rentals/${orderId}`);
      setAttempts((count) => count + 1);
      return data;
    },
    retry: false,
    refetchInterval: (query) =>
      query.state.data?.status === "PAID" || attempts >= MAX_ATTEMPTS
        ? false
        : POLL_MS,
  });

  const paid = order.data?.status === "PAID";
  const waiting = !paid && attempts < MAX_ATTEMPTS && !order.isError;

  return (
    <Card className="w-full">
      <CardContent className="space-y-5 text-center">
        <span
          className={`mx-auto flex size-14 items-center justify-center rounded-full ${
            paid
              ? "bg-tone-success text-tone-success-foreground"
              : "bg-tone-pending text-tone-pending-foreground"
          }`}
        >
          {paid ? (
            <CheckCircle2 className="size-7" />
          ) : waiting ? (
            <Loader2 className="size-7 animate-spin" />
          ) : (
            <Clock className="size-7" />
          )}
        </span>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">
            {paid
              ? "Payment successful"
              : waiting
                ? "Confirming your payment"
                : "Payment received"}
          </h1>
          <p className="text-muted-foreground">
            {paid
              ? "Your rental is paid and ready for pick-up on the start date."
              : waiting
                ? "Stripe has taken the payment. We are waiting for it to be confirmed — this usually takes a few seconds."
                : "Your card was charged. The rental will update as soon as the confirmation arrives; you can safely close this page."}
          </p>
        </div>

        {order.data ? (
          <dl className="space-y-1.5 rounded-xl border border-border p-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Rental</dt>
              <dd className="font-medium tabular-nums">
                {orderRef(order.data.id)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Amount</dt>
              <dd className="font-medium tabular-nums">
                {money(order.data.totalPrice)}
              </dd>
            </div>
          </dl>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild className="flex-1">
            <Link href={`/dashboard/customer/orders/${orderId}`}>
              View rental
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/dashboard/customer/payments">Payment history</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
