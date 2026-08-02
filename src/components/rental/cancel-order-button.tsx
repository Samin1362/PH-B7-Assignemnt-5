"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { Button } from "@/components/ui/button";
import { errorMessage, toApiError } from "@/lib/api-error";
import { clientFetchData } from "@/lib/client-api";
import type { RentalOrder } from "@/types/api";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const cancel = useMutation({
    mutationFn: () =>
      clientFetchData<RentalOrder>(`/rentals/${orderId}/cancel`, {
        method: "PATCH",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      setOpen(false);
      toast.success("Rental cancelled");
      router.refresh();
    },
    onError: (error) => {
      setOpen(false);
      toast.error(errorMessage(error));
      // 409 means the provider already moved it on — re-render with the truth.
      if (toApiError(error).status === 409) {
        router.refresh();
      }
    },
  });

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button variant="outline">
          <X />
          Cancel rental
        </Button>
      }
      title="Cancel this rental?"
      description="The booking will be released and the gear made available again. This cannot be undone."
      confirmLabel="Cancel rental"
      destructive
      pending={cancel.isPending}
      onConfirm={() => cancel.mutate()}
    />
  );
}
