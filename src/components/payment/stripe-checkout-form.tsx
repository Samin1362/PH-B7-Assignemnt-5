"use client";

import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/utils";

export function StripeCheckoutForm({
  orderId,
  amount,
}: {
  orderId: string;
  amount: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    setSubmitting(true);
    setError(null);

    /**
     * The API creates the intent with `allow_redirects: "never"`, so no
     * payment method here can bounce the user to a bank page — `if_required`
     * keeps us on the page and hands back the intent directly.
     */
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success?order=${orderId}`,
      },
      redirect: "if_required",
    });

    if (result.error) {
      setError(result.error.message ?? "Your payment could not be processed.");
      setSubmitting(false);
      return;
    }

    const status = result.paymentIntent?.status;
    if (status === "succeeded" || status === "processing") {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      router.push(`/payment/success?order=${orderId}`);
      return;
    }

    setError("The payment was not completed. Please try another card.");
    setSubmitting(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <PaymentElement options={{ layout: "tabs" }} />

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!stripe || !elements || submitting}
      >
        {submitting ? (
          <>
            <Loader2 className="animate-spin" />
            Processing payment
          </>
        ) : (
          <>
            <Lock />
            Pay {money(amount)}
          </>
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Payments are processed by Stripe. GearUp never sees your card details.{" "}
        <Link
          href={`/dashboard/customer/orders/${orderId}`}
          className="underline-offset-4 hover:underline"
        >
          Back to the order
        </Link>
      </p>
    </form>
  );
}
