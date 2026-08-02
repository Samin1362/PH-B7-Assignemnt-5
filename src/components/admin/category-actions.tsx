"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/dashboard/confirm-dialog";
import { applyApiError } from "@/components/forms/form-error";
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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage, toApiError } from "@/lib/api-error";
import { clientFetchData } from "@/lib/client-api";
import { categorySchema, type CategoryValues } from "@/schemas/category";
import type { Category } from "@/types/api";

function useRefresh() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    router.refresh();
  };
}

export function CategoryDialog({ category }: { category?: Category }) {
  const refresh = useRefresh();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      description: category?.description ?? "",
    },
  });

  const save = useMutation({
    mutationFn: (values: CategoryValues) => {
      const body = {
        name: values.name,
        description: values.description || undefined,
      };

      return category
        ? clientFetchData<Category>(`/categories/${category.id}`, {
            method: "PATCH",
            body,
          })
        : clientFetchData<Category>("/categories", { method: "POST", body });
    },
    onSuccess: (saved) => {
      setOpen(false);
      if (!category) {
        reset({ name: "", description: "" });
      }
      toast.success(category ? "Category updated" : `${saved.name} added`);
      refresh();
    },
    onError: (error) => {
      // A duplicate name is a 409, and it is always about the name field.
      if (toApiError(error).status === 409) {
        setError("name", { type: "server", message: errorMessage(error) });
        return;
      }
      applyApiError(error, setError, ["name", "description"]);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {category ? (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${category.name}`}
          >
            <Pencil />
          </Button>
        ) : (
          <Button>
            <Plus />
            Add category
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit((values) => save.mutate(values))} noValidate>
          <DialogHeader>
            <DialogTitle>
              {category ? `Edit ${category.name}` : "Add a category"}
            </DialogTitle>
            <DialogDescription>
              Categories group gear on the browse page, so keep the names broad.
            </DialogDescription>
          </DialogHeader>

          <div className="py-5">
            <FieldGroup>
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor={`name-${category?.id ?? "new"}`}>
                  Name
                </FieldLabel>
                <Input
                  id={`name-${category?.id ?? "new"}`}
                  placeholder="Camping"
                  aria-invalid={!!errors.name}
                  defaultValue={category?.name ?? ""}
                  {...register("name")}
                />
                <FieldError errors={[errors.name]} />
              </Field>

              <Field data-invalid={!!errors.description}>
                <FieldLabel htmlFor={`description-${category?.id ?? "new"}`}>
                  Description (optional)
                </FieldLabel>
                <Textarea
                  id={`description-${category?.id ?? "new"}`}
                  rows={3}
                  aria-invalid={!!errors.description}
                  defaultValue={category?.description ?? ""}
                  {...register("description")}
                />
                <FieldError errors={[errors.description]} />
              </Field>
            </FieldGroup>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={save.isPending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : category ? "Save changes" : "Add category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteCategoryButton({ category }: { category: Category }) {
  const refresh = useRefresh();
  const [open, setOpen] = useState(false);

  const remove = useMutation({
    mutationFn: () =>
      clientFetchData(`/categories/${category.id}`, { method: "DELETE" }),
    onSuccess: () => {
      setOpen(false);
      toast.success(`${category.name} was deleted`);
      refresh();
    },
    onError: (error) => {
      setOpen(false);
      toast.error(
        toApiError(error).status === 409
          ? `${category.name} still has gear in it. Move that gear to another category first.`
          : errorMessage(error),
      );
    },
  });

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Delete ${category.name}`}
        >
          <Trash2 />
        </Button>
      }
      title={`Delete ${category.name}?`}
      description="Categories that still contain gear cannot be deleted."
      confirmLabel="Delete category"
      destructive
      pending={remove.isPending}
      onConfirm={() => remove.mutate()}
    />
  );
}
