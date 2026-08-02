import { Check, Circle, X } from "lucide-react";
import { rentalStatusMeta, type RentalStatus } from "@/constants/status";
import { cn, formatDateTime } from "@/lib/utils";
import type { RentalOrder } from "@/types/api";

const flow: RentalStatus[] = [
  "PLACED",
  "CONFIRMED",
  "PAID",
  "PICKED_UP",
  "RETURNED",
];

type Step = {
  status: RentalStatus;
  state: "done" | "current" | "upcoming" | "cancelled";
  at?: string;
};

/**
 * The API keeps no per-transition history, so only the placed date, the
 * payment date and the current step can be timestamped — the rest are shown
 * as reached, without a time.
 */
function buildSteps(order: RentalOrder): Step[] {
  if (order.status === "CANCELLED") {
    return [
      { status: "PLACED", state: "done", at: order.createdAt },
      { status: "CANCELLED", state: "cancelled", at: order.updatedAt },
    ];
  }

  const index = flow.indexOf(order.status);

  return flow.map((status, position) => ({
    status,
    state:
      position < index ? "done" : position === index ? "current" : "upcoming",
    at:
      status === "PLACED"
        ? order.createdAt
        : status === "PAID"
          ? (order.payment?.paidAt ?? undefined)
          : position === index
            ? order.updatedAt
            : undefined,
  }));
}

export function OrderTimeline({ order }: { order: RentalOrder }) {
  const steps = buildSteps(order);

  return (
    <ol className="space-y-5">
      {steps.map((step, index) => {
        const meta = rentalStatusMeta[step.status];
        const last = index === steps.length - 1;
        const reached = step.state === "done" || step.state === "current";

        return (
          <li key={step.status} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border",
                  step.state === "cancelled"
                    ? "border-transparent bg-tone-danger text-tone-danger-foreground"
                    : step.state === "done"
                      ? "border-transparent bg-primary text-primary-foreground"
                      : step.state === "current"
                        ? "border-primary text-primary"
                        : "border-border text-muted-foreground",
                )}
              >
                {step.state === "cancelled" ? (
                  <X className="size-3.5" />
                ) : step.state === "done" ? (
                  <Check className="size-3.5" />
                ) : (
                  <Circle
                    className={cn(
                      "size-2.5",
                      step.state === "current" && "fill-current",
                    )}
                  />
                )}
              </span>
              {last ? null : (
                <span
                  className={cn(
                    "mt-1 w-px flex-1",
                    step.state === "done" ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>

            <div className={cn("pb-1", !reached && step.state !== "cancelled" && "opacity-60")}>
              <p className="text-sm font-medium">{meta.label}</p>
              <p className="text-xs text-muted-foreground">
                {meta.description}
              </p>
              {step.at ? (
                <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                  {formatDateTime(step.at)}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
