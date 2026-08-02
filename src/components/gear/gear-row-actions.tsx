"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { errorMessage, toApiError } from "@/lib/api-error";
import { clientFetchData } from "@/lib/client-api";
import type { GearItem } from "@/types/api";

export function AvailabilityToggle({ gear }: { gear: GearItem }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [available, setAvailable] = useState(gear.isAvailable);

  const toggle = useMutation({
    mutationFn: (next: boolean) =>
      clientFetchData<GearItem>(`/provider/gear/${gear.id}`, {
        method: "PATCH",
        body: { isAvailable: next },
      }),
    onSuccess: (saved) => {
      setAvailable(saved.isAvailable);
      toast.success(
        saved.isAvailable
          ? `${saved.name} is visible to renters`
          : `${saved.name} is hidden from renters`,
      );
      queryClient.invalidateQueries({ queryKey: ["provider-gear"] });
      router.refresh();
    },
    onError: (error) => {
      // Put the switch back where it was — the server never changed.
      setAvailable(gear.isAvailable);
      toast.error(errorMessage(error));
    },
  });

  return (
    <Switch
      checked={available}
      disabled={toggle.isPending}
      aria-label={`${available ? "Hide" : "Publish"} ${gear.name}`}
      onCheckedChange={(next) => {
        setAvailable(next);
        toggle.mutate(next);
      }}
    />
  );
}

export function DeleteGearButton({ gear }: { gear: GearItem }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const remove = useMutation({
    mutationFn: () =>
      clientFetchData(`/provider/gear/${gear.id}`, { method: "DELETE" }),
    onSuccess: () => {
      setOpen(false);
      toast.success(`${gear.name} was removed`);
      queryClient.invalidateQueries({ queryKey: ["provider-gear"] });
      router.refresh();
    },
    onError: (error) => {
      setOpen(false);
      const apiError = toApiError(error);
      // 409 means the gear has rental history and never can be deleted, so
      // point at the thing that does work instead of repeating the error.
      toast.error(
        apiError.status === 409
          ? `${gear.name} has rental history, so it cannot be deleted. Turn off availability to hide it instead.`
          : errorMessage(error),
      );
    },
  });

  return (
    <div className="flex items-center gap-1">
      <Button asChild variant="ghost" size="icon-sm" aria-label={`Edit ${gear.name}`}>
        <Link href={`/dashboard/provider/gear/${gear.id}/edit`}>
          <Pencil />
        </Link>
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        trigger={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${gear.name}`}
          >
            <Trash2 />
          </Button>
        }
        title={`Delete ${gear.name}?`}
        description="This removes the listing for good. Gear that has already been rented cannot be deleted — hide it instead."
        confirmLabel="Delete gear"
        destructive
        pending={remove.isPending}
        onConfirm={() => remove.mutate()}
      />
    </div>
  );
}
