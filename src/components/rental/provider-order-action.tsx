"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import {
  providerTransitions,
  rentalStatusMeta,
  type RentalStatus,
} from "@/constants/status";
import { errorMessage, toApiError } from "@/lib/api-error";
import { clientFetchData } from "@/lib/client-api";
import { orderRef } from "@/lib/orders";
import type { RentalOrder } from "@/types/api";

/**
 * Owns the badge as well as the button so the status can flip the moment the
 * provider clicks, and roll back to the server's value if the call fails.
 */
export function ProviderOrderAction({ order }: { order: RentalOrder }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<RentalStatus>(order.status);

  const move = useMutation({
    mutationFn: (next: RentalStatus) =>
      clientFetchData<RentalOrder>(`/provider/orders/${order.id}`, {
        method: "PATCH",
        body: { status: next },
      }),
    onSuccess: (updated) => {
      setStatus(updated.status);
      queryClient.invalidateQueries({ queryKey: ["provider-orders"] });
      toast.success(
        `${orderRef(order.id)} is now ${rentalStatusMeta[updated.status].label.toLowerCase()}`,
      );
      router.refresh();
    },
    onError: (error) => {
      setStatus(order.status);
      const apiError = toApiError(error);
      // 409 means the order moved on elsewhere — show the server's truth.
      toast.error(errorMessage(error));
      if (apiError.status === 409) {
        router.refresh();
      }
    },
  });

  const transition = providerTransitions[status];

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <StatusBadge status={status} />

      {transition ? (
        <Button
          size="sm"
          disabled={move.isPending}
          onClick={() => {
            setStatus(transition.next);
            move.mutate(transition.next);
          }}
        >
          {move.isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Check />
          )}
          {transition.label}
        </Button>
      ) : (
        <span className="text-xs text-muted-foreground">
          {status === "CONFIRMED"
            ? "Waiting for payment"
            : rentalStatusMeta[status].description}
        </span>
      )}
    </div>
  );
}
