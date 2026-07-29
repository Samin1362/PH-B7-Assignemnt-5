import {
  paymentStatusMeta,
  rentalStatusMeta,
  toneClasses,
  type PaymentStatus,
  type RentalStatus,
} from "@/constants/status";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";

export function StatusBadge({
  status,
  className,
}: {
  status: RentalStatus;
  className?: string;
}) {
  const meta = rentalStatusMeta[status];
  return (
    <span className={cn(base, toneClasses[meta.tone], className)}>
      {meta.label}
    </span>
  );
}

export function PaymentStatusBadge({
  status,
  className,
}: {
  status: PaymentStatus;
  className?: string;
}) {
  const meta = paymentStatusMeta[status];
  return (
    <span className={cn(base, toneClasses[meta.tone], className)}>
      {meta.label}
    </span>
  );
}
