"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { DateRangePicker } from "@/components/rental/date-range-picker";
import { QuantityStepper } from "@/components/rental/quantity-stepper";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { clientFetchData } from "@/lib/client-api";
import { errorMessage, toApiError } from "@/lib/api-error";
import { money, toDateOnly, toNumber } from "@/lib/utils";
import { rentalDays, rentalSelectionSchema } from "@/schemas/rental";
import type { GearItem, RentalOrder, UserRole } from "@/types/api";

export function RentPanel({
  gear,
  role,
}: {
  gear: GearItem;
  role: UserRole | null;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [range, setRange] = useState<DateRange | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const soldOut = !gear.isAvailable || gear.stock < 1;
  const days = rentalDays(range?.from, range?.to);
  const total = toNumber(gear.pricePerDay) * quantity * days;

  const placeOrder = useMutation({
    mutationFn: (selection: { startDate: Date; endDate: Date }) =>
      clientFetchData<RentalOrder>("/rentals", {
        method: "POST",
        body: {
          startDate: toDateOnly(selection.startDate),
          endDate: toDateOnly(selection.endDate),
          items: [{ gearItemId: gear.id, quantity }],
        },
      }),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      toast.success("Rental placed — the provider will confirm it shortly.");
      router.push(`/dashboard/customer/orders/${order.id}`);
    },
    onError: (cause) => {
      const apiError = toApiError(cause);
      const fields = apiError.fieldErrors;
      setError(fields.endDate ?? fields.startDate ?? apiError.message);
      if (apiError.status === 0 || apiError.status >= 500) {
        toast.error(errorMessage(cause));
      }
    },
  });

  function submit() {
    const parsed = rentalSelectionSchema.safeParse({
      startDate: range?.from,
      endDate: range?.to,
      quantity,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    if (quantity > gear.stock) {
      setError(`Only ${gear.stock} of these are in stock`);
      return;
    }

    setError(null);
    placeOrder.mutate({ startDate: parsed.data.startDate, endDate: parsed.data.endDate });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-3xl font-semibold tabular-nums">
        {money(gear.pricePerDay)}
        <span className="text-base font-normal text-muted-foreground">
          {" "}
          / day
        </span>
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            soldOut
              ? "bg-tone-neutral text-tone-neutral-foreground"
              : "bg-tone-success text-tone-success-foreground"
          }`}
        >
          {soldOut ? "Unavailable" : "Available"}
        </span>
        <span className="text-sm text-muted-foreground">
          {gear.stock} in stock
        </span>
      </div>

      {soldOut ? (
        <p className="mt-5 text-sm text-muted-foreground">
          This gear is not accepting bookings right now. Check back later or
          browse similar gear below.
        </p>
      ) : role === null ? (
        <Button asChild className="mt-5 w-full" size="lg">
          <Link href={`/login?next=/gear/${gear.id}`}>Sign in to rent</Link>
        </Button>
      ) : role !== "CUSTOMER" ? (
        <p className="mt-5 text-sm text-muted-foreground">
          Rentals are placed from customer accounts. Sign in as a customer to
          book this gear.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rental-dates">Rental period</Label>
            <div id="rental-dates">
              <DateRangePicker
                value={range}
                onChange={(next) => {
                  setRange(next);
                  setError(null);
                }}
                invalid={Boolean(error)}
                disabled={placeOrder.isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Quantity</Label>
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              max={gear.stock}
              disabled={placeOrder.isPending}
            />
          </div>

          {days > 0 ? (
            <>
              <Separator />
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">
                    {money(gear.pricePerDay)} × {days} day
                    {days > 1 ? "s" : ""} × {quantity}
                  </dt>
                  <dd className="tabular-nums">{money(total)}</dd>
                </div>
                <div className="flex justify-between text-base font-semibold">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{money(total)}</dd>
                </div>
              </dl>
            </>
          ) : null}

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button
            className="w-full"
            size="lg"
            onClick={submit}
            disabled={placeOrder.isPending}
          >
            {placeOrder.isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Placing rental
              </>
            ) : (
              "Confirm rental"
            )}
          </Button>

          <p className="text-xs text-muted-foreground">
            You pay by card once the provider confirms your booking. Rental days
            are counted from pick-up to return.
          </p>
        </div>
      )}
    </div>
  );
}
