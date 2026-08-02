"use client";

import { Elements } from "@stripe/react-stripe-js";
import { useQuery } from "@tanstack/react-query";
import { KeyRound, TriangleAlert } from "lucide-react";
import { useTheme } from "next-themes";
import { StripeCheckoutForm } from "@/components/payment/stripe-checkout-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { errorMessage } from "@/lib/api-error";
import { clientFetchData } from "@/lib/client-api";
import { getStripe, stripeAppearance, stripeConfigured } from "@/lib/stripe";
import type { PaymentIntentPayload } from "@/types/api";

export function PayPanel({
  orderId,
  amount,
}: {
  orderId: string;
  amount: string;
}) {
  const { resolvedTheme } = useTheme();

  /**
   * `POST /payments/create` upserts one intent per order, so running it on
   * mount is safe and repeatable — a query keeps that off an effect.
   */
  const intent = useQuery({
    queryKey: ["payment-intent", orderId],
    queryFn: () =>
      clientFetchData<PaymentIntentPayload>("/payments/create", {
        method: "POST",
        body: { rentalOrderId: orderId },
      }),
    enabled: stripeConfigured,
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  if (!stripeConfigured) {
    return (
      <Alert>
        <KeyRound />
        <AlertTitle>Card payments are not configured</AlertTitle>
        <AlertDescription>
          Set <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> in{" "}
          <code>.env.local</code> to the publishable key of the same Stripe
          account the API uses, then reload this page.
        </AlertDescription>
      </Alert>
    );
  }

  if (intent.isPending) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    );
  }

  if (intent.isError || !intent.data?.clientSecret) {
    return (
      <Alert variant="destructive">
        <TriangleAlert />
        <AlertTitle>Payment could not be started</AlertTitle>
        <AlertDescription>
          {intent.isError
            ? errorMessage(intent.error)
            : "Stripe did not return a client secret for this order."}
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => intent.refetch()}
          >
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Elements
      stripe={getStripe()}
      options={{
        clientSecret: intent.data.clientSecret,
        appearance: stripeAppearance(resolvedTheme === "dark"),
      }}
    >
      <StripeCheckoutForm orderId={orderId} amount={amount} />
    </Elements>
  );
}
