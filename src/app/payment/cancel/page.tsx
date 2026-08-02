import { XCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Payment cancelled — GearUp",
};

export default async function PaymentCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string | string[] }>;
}) {
  const { order } = await searchParams;
  const orderId = Array.isArray(order) ? order[0] : order;

  return (
    <Card className="w-full">
      <CardContent className="space-y-5 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-tone-neutral text-tone-neutral-foreground">
          <XCircle className="size-7" />
        </span>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Payment cancelled</h1>
          <p className="text-muted-foreground">
            Nothing was charged. Your rental is still confirmed and you can pay
            for it whenever you are ready.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {orderId ? (
            <Button asChild className="flex-1">
              <Link href={`/dashboard/customer/orders/${orderId}/pay`}>
                Try again
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="outline" className="flex-1">
            <Link href="/dashboard/customer/orders">My rentals</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
