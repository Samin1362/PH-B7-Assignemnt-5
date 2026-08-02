"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Ban, Loader2, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/api-error";
import { clientFetchData } from "@/lib/client-api";
import type { User } from "@/types/api";

export function UserStatusAction({
  user,
  isSelf,
}: {
  user: User;
  isSelf: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(user.status);

  const suspended = status === "SUSPENDED";
  const next = suspended ? "ACTIVE" : "SUSPENDED";

  const update = useMutation({
    mutationFn: () =>
      clientFetchData<User>(`/admin/users/${user.id}`, {
        method: "PATCH",
        body: { status: next },
      }),
    onSuccess: (updated) => {
      setStatus(updated.status);
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(
        updated.status === "SUSPENDED"
          ? `${updated.name} can no longer sign in`
          : `${updated.name} is active again`,
      );
      router.refresh();
    },
    onError: (error) => {
      setStatus(user.status);
      setOpen(false);
      toast.error(errorMessage(error));
    },
  });

  // The API rejects self-targeting with a 400, so never offer the action.
  if (isSelf) {
    return <span className="text-xs text-muted-foreground">This is you</span>;
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button variant="outline" size="sm" disabled={update.isPending}>
          {update.isPending ? (
            <Loader2 className="animate-spin" />
          ) : suspended ? (
            <RotateCcw />
          ) : (
            <Ban />
          )}
          {suspended ? "Activate" : "Suspend"}
        </Button>
      }
      title={suspended ? `Activate ${user.name}?` : `Suspend ${user.name}?`}
      description={
        suspended
          ? "They will be able to sign in and use GearUp again."
          : "They stay in the system but cannot sign in until you activate them again."
      }
      confirmLabel={suspended ? "Activate" : "Suspend"}
      destructive={!suspended}
      pending={update.isPending}
      onConfirm={() => update.mutate()}
    />
  );
}
