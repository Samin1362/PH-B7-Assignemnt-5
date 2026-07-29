export type RentalStatus =
  | "PLACED"
  | "CONFIRMED"
  | "PAID"
  | "PICKED_UP"
  | "RETURNED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

export type Tone =
  | "pending"
  | "info"
  | "progress"
  | "success"
  | "neutral"
  | "danger";

export const toneClasses: Record<Tone, string> = {
  pending: "bg-tone-pending text-tone-pending-foreground",
  info: "bg-tone-info text-tone-info-foreground",
  progress: "bg-tone-progress text-tone-progress-foreground",
  success: "bg-tone-success text-tone-success-foreground",
  neutral: "bg-tone-neutral text-tone-neutral-foreground",
  danger: "bg-tone-danger text-tone-danger-foreground",
};

export const rentalStatusMeta: Record<
  RentalStatus,
  { label: string; tone: Tone; description: string }
> = {
  PLACED: {
    label: "Placed",
    tone: "pending",
    description: "Waiting for the provider to confirm",
  },
  CONFIRMED: {
    label: "Confirmed",
    tone: "info",
    description: "Confirmed — payment required",
  },
  PAID: {
    label: "Paid",
    tone: "progress",
    description: "Paid — ready for pickup",
  },
  PICKED_UP: {
    label: "Picked up",
    tone: "success",
    description: "Gear is with the customer",
  },
  RETURNED: {
    label: "Returned",
    tone: "neutral",
    description: "Rental complete",
  },
  CANCELLED: {
    label: "Cancelled",
    tone: "danger",
    description: "This order was cancelled",
  },
};

export const paymentStatusMeta: Record<
  PaymentStatus,
  { label: string; tone: Tone }
> = {
  PENDING: { label: "Pending", tone: "pending" },
  COMPLETED: { label: "Completed", tone: "success" },
  FAILED: { label: "Failed", tone: "danger" },
};

export const providerTransitions: Partial<
  Record<RentalStatus, { next: RentalStatus; label: string }>
> = {
  PLACED: { next: "CONFIRMED", label: "Confirm" },
  PAID: { next: "PICKED_UP", label: "Mark picked up" },
  PICKED_UP: { next: "RETURNED", label: "Mark returned" },
};

export const rentalStatuses = Object.keys(rentalStatusMeta) as RentalStatus[];
