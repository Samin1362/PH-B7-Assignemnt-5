import type { RentalStatus } from "@/constants/status";

export type PayGate =
  | { kind: "form" }
  | { kind: "paid" | "waiting" | "closed"; title: string; description: string };

/**
 * `POST /payments/create` only accepts a CONFIRMED order, so every other
 * status is answered on the page instead of with a 409 from a doomed request.
 */
export function payGate(status: RentalStatus): PayGate {
  if (status === "CONFIRMED") {
    return { kind: "form" };
  }

  if (status === "PLACED") {
    return {
      kind: "waiting",
      title: "Not ready for payment yet",
      description:
        "The provider still has to confirm your booking. You will be able to pay as soon as they do.",
    };
  }

  if (status === "CANCELLED") {
    return {
      kind: "closed",
      title: "This rental was cancelled",
      description: "Cancelled rentals cannot be paid for.",
    };
  }

  return {
    kind: "paid",
    title: "This rental is already paid",
    description:
      "Nothing more to pay here. You can see the payment on the order page.",
  };
}
