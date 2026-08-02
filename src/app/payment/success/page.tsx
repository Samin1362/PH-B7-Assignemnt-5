import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PaymentStatusCard } from "@/components/payment/payment-status-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Payment successful — GearUp",
};

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string | string[] }>;
}) {
  const { order } = await searchParams;
  const orderId = Array.isArray(order) ? order[0] : order;

  if (!orderId) {
    return (
      <Card className="w-full">
        <CardContent className="space-y-5 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-tone-success text-tone-success-foreground">
            <CheckCircle2 className="size-7" />
          </span>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Payment successful</h1>
            <p className="text-muted-foreground">
              Your payment went through. Open your rentals to see the updated
              booking.
            </p>
          </div>
          <Button asChild className="w-full">
            <Link href="/dashboard/customer/orders">My rentals</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <PaymentStatusCard orderId={orderId} />;
}
