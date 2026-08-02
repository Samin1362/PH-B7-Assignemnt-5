"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { RatingInput } from "@/components/review/rating-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage, toApiError } from "@/lib/api-error";
import { clientFetchData } from "@/lib/client-api";
import { reviewSchema, type ReviewValues } from "@/schemas/review";
import type { Review } from "@/types/api";

export function ReviewDialog({
  gearItemId,
  gearName,
  rentalOrderId,
  reviewed = false,
}: {
  gearItemId: string;
  gearName: string;
  rentalOrderId: string;
  reviewed?: boolean;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(reviewed);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: "" },
  });

  const comment = useWatch({ control, name: "comment" }) ?? "";

  const submit = useMutation({
    mutationFn: (values: ReviewValues) =>
      clientFetchData<Review>("/reviews", {
        method: "POST",
        body: {
          gearItemId,
          rentalOrderId,
          rating: values.rating,
          comment: values.comment || undefined,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gear", gearItemId] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      setDone(true);
      setOpen(false);
      reset();
      toast.success(`Thanks for reviewing ${gearName}`);
      router.refresh();
    },
    onError: (cause) => {
      const apiError = toApiError(cause);
      // 409 is "already reviewed" — the review exists, so treat it as done.
      if (apiError.status === 409 && apiError.message.includes("already")) {
        setDone(true);
        setOpen(false);
        toast.info(apiError.message);
        router.refresh();
        return;
      }
      setError(errorMessage(cause));
    },
  });

  if (done) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <CheckCircle2 className="size-4 text-tone-success-foreground" />
        Reviewed
      </span>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setError(null);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Star />
          Write a review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit((values) => submit.mutate(values))}>
          <DialogHeader>
            <DialogTitle>Review {gearName}</DialogTitle>
            <DialogDescription>
              Your review is public on the gear page and helps other renters.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-5">
            <Controller
              control={control}
              name="rating"
              render={({ field }) => (
                <Field data-invalid={!!errors.rating}>
                  <FieldLabel>Rating</FieldLabel>
                  <RatingInput
                    value={field.value}
                    onChange={field.onChange}
                    disabled={submit.isPending}
                  />
                  <FieldError errors={[errors.rating]} />
                </Field>
              )}
            />

            <Field data-invalid={!!errors.comment}>
              <FieldLabel htmlFor={`comment-${gearItemId}`}>
                Comment (optional)
              </FieldLabel>
              <Textarea
                id={`comment-${gearItemId}`}
                rows={4}
                placeholder="How did the gear hold up?"
                aria-invalid={!!errors.comment}
                disabled={submit.isPending}
                {...register("comment")}
              />
              <p className="text-right text-xs text-muted-foreground tabular-nums">
                {comment.length}/1000
              </p>
              <FieldError errors={[errors.comment]} />
            </Field>

            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={submit.isPending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submit.isPending}>
              {submit.isPending ? "Posting…" : "Post review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
