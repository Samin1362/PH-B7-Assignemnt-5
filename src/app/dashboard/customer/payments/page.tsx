import { CreditCard, ServerCrash, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatCard, StatCardSkeleton } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/container";
import {
  PaymentList,
  PaymentListSkeleton,
} from "@/components/payment/payment-list";
import { Button } from "@/components/ui/button";
import { serverFetchSafe } from "@/lib/api";
import { money, toNumber } from "@/lib/utils";
import type { Payment } from "@/types/api";

export const metadata: Metadata = {
  title: "Payments — GearUp",
};

async function Payments() {
  const result = await serverFetchSafe<Payment[]>("/payments");

  if (!result) {
    return (
      <EmptyState
        icon={ServerCrash}
        title="Payments could not be loaded"
        description="We could not reach the GearUp service. Please try again in a moment."
      />
    );
  }

  const payments = result.data;

  if (payments.length === 0) {
    return (
      <EmptyState
        icon={CreditCard}
        title="No payments yet"
        description="Once you pay for a confirmed rental, the receipt shows up here."
        action={
          <Button asChild>
            <Link href="/dashboard/customer/orders">My rentals</Link>
          </Button>
        }
      />
    );
  }

  const completed = payments.filter((payment) => payment.status === "COMPLETED");
  const paid = completed.reduce(
    (sum, payment) => sum + toNumber(payment.amount),
    0,
  );
  const pending = payments.filter(
    (payment) => payment.status === "PENDING",
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Total paid"
          value={money(paid)}
          hint={`${completed.length} completed payment${completed.length === 1 ? "" : "s"}`}
          icon={Wallet}
        />
        <StatCard
          label="Awaiting confirmation"
          value={pending}
          hint="Started but not confirmed yet"
          icon={CreditCard}
        />
      </div>

      <PaymentList payments={payments} />
    </div>
  );
}

function PaymentsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <PaymentListSkeleton />
    </div>
  );
}

export default function CustomerPaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Every card payment you have made on GearUp."
      />

      <Suspense fallback={<PaymentsSkeleton />}>
        <Payments />
      </Suspense>
    </div>
  );
}
