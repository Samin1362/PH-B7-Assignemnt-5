"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { applyApiError } from "@/components/forms/form-error";
import { GearImage } from "@/components/gear/gear-image";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { clientFetchData } from "@/lib/client-api";
import { toNumber } from "@/lib/utils";
import { gearFormSchema, type GearFormValues } from "@/schemas/gear";
import type { Category, GearItem } from "@/types/api";

const MAX_IMAGES = 6;

function toDefaults(gear?: GearItem): GearFormValues {
  return {
    name: gear?.name ?? "",
    categoryId: gear?.categoryId ?? "",
    brand: gear?.brand ?? "",
    description: gear?.description ?? "",
    pricePerDay: gear ? toNumber(gear.pricePerDay) : 0,
    stock: gear?.stock ?? 1,
    images: (gear?.images.length ? gear.images : [""]).map((url) => ({ url })),
    isAvailable: gear?.isAvailable ?? true,
  };
}

export function GearForm({
  categories,
  gear,
}: {
  categories: Category[];
  gear?: GearItem;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<GearFormValues>({
    resolver: zodResolver(gearFormSchema),
    defaultValues: toDefaults(gear),
  });

  const images = useFieldArray({ control, name: "images" });
  const imageValues = useWatch({ control, name: "images" }) ?? [];

  const save = useMutation({
    mutationFn: (values: GearFormValues) => {
      const body = {
        name: values.name,
        categoryId: values.categoryId,
        brand: values.brand || undefined,
        description: values.description || undefined,
        pricePerDay: values.pricePerDay,
        stock: values.stock,
        images: values.images
          .map((image) => image.url.trim())
          .filter((url) => url.length > 0),
        isAvailable: values.isAvailable,
      };

      return gear
        ? clientFetchData<GearItem>(`/provider/gear/${gear.id}`, {
            method: "PATCH",
            body,
          })
        : clientFetchData<GearItem>("/provider/gear", {
            method: "POST",
            body,
          });
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["provider-gear"] });
      queryClient.invalidateQueries({ queryKey: ["gear", saved.id] });
      toast.success(gear ? "Gear updated" : `${saved.name} is now listed`);
      router.push("/dashboard/provider/gear");
      router.refresh();
    },
    onError: (error) =>
      applyApiError(error, setError, [
        "name",
        "categoryId",
        "brand",
        "description",
        "pricePerDay",
        "stock",
      ]),
  });

  const pending = isSubmitting || save.isPending;

  return (
    <form
      onSubmit={handleSubmit((values) => save.mutate(values))}
      noValidate
      className="space-y-8"
    >
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input
            id="name"
            placeholder="4-Person Dome Tent"
            aria-invalid={!!errors.name}
            defaultValue={gear?.name ?? ""}
            {...register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Field data-invalid={!!errors.categoryId}>
                <FieldLabel htmlFor="categoryId">Category</FieldLabel>
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  disabled={pending}
                >
                  <SelectTrigger id="categoryId" aria-invalid={!!errors.categoryId}>
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.categoryId]} />
              </Field>
            )}
          />

          <Field data-invalid={!!errors.brand}>
            <FieldLabel htmlFor="brand">Brand (optional)</FieldLabel>
            <Input
              id="brand"
              placeholder="Coleman"
              aria-invalid={!!errors.brand}
              defaultValue={gear?.brand ?? ""}
              {...register("brand")}
            />
            <FieldError errors={[errors.brand]} />
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field data-invalid={!!errors.pricePerDay}>
            <FieldLabel htmlFor="pricePerDay">Price per day (USD)</FieldLabel>
            <Input
              id="pricePerDay"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              aria-invalid={!!errors.pricePerDay}
              defaultValue={gear ? toNumber(gear.pricePerDay) : ""}
              {...register("pricePerDay", { valueAsNumber: true })}
            />
            <FieldError errors={[errors.pricePerDay]} />
          </Field>

          <Field data-invalid={!!errors.stock}>
            <FieldLabel htmlFor="stock">Stock</FieldLabel>
            <Input
              id="stock"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              aria-invalid={!!errors.stock}
              defaultValue={gear?.stock ?? 1}
              {...register("stock", { valueAsNumber: true })}
            />
            <FieldDescription>
              How many of this item you can rent out at once.
            </FieldDescription>
            <FieldError errors={[errors.stock]} />
          </Field>
        </div>

        <Field data-invalid={!!errors.description}>
          <FieldLabel htmlFor="description">Description (optional)</FieldLabel>
          <Textarea
            id="description"
            rows={4}
            placeholder="What is included, what condition it is in, anything renters should know."
            aria-invalid={!!errors.description}
            defaultValue={gear?.description ?? ""}
            {...register("description")}
          />
          <FieldError errors={[errors.description]} />
        </Field>

        <Field>
          <FieldLabel>Images</FieldLabel>
          <FieldDescription>
            Paste image URLs — the preview updates as you type. Renters see a
            placeholder if a link is missing or broken.
          </FieldDescription>

          <div className="space-y-3">
            {images.fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-3">
                <div className="relative aspect-4/3 w-24 shrink-0 overflow-hidden rounded-lg border border-border">
                  <GearImage
                    src={imageValues[index]?.url?.trim() || undefined}
                    alt={`Image ${index + 1} preview`}
                    sizes="96px"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Input
                    placeholder="https://example.com/photo.jpg"
                    aria-label={`Image URL ${index + 1}`}
                    aria-invalid={!!errors.images?.[index]?.url}
                    {...register(`images.${index}.url` as const)}
                  />
                  <FieldError errors={[errors.images?.[index]?.url]} />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove image ${index + 1}`}
                  disabled={images.fields.length === 1}
                  onClick={() => images.remove(index)}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-1 w-fit"
            disabled={images.fields.length >= MAX_IMAGES}
            onClick={() => images.append({ url: "" })}
          >
            <ImagePlus />
            Add another image
          </Button>
        </Field>

        <Controller
          control={control}
          name="isAvailable"
          render={({ field }) => (
            <Field orientation="horizontal">
              <Switch
                id="isAvailable"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={pending}
              />
              <div>
                <FieldLabel htmlFor="isAvailable">
                  Available for rent
                </FieldLabel>
                <FieldDescription>
                  Turn this off to hide the gear from renters without deleting
                  it.
                </FieldDescription>
              </div>
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex flex-wrap justify-end gap-3">
        <Button asChild variant="outline" type="button">
          <Link href="/dashboard/provider/gear">Cancel</Link>
        </Button>
        <Button type="submit" size="lg" disabled={pending}>
          {pending
            ? gear
              ? "Saving…"
              : "Listing…"
            : gear
              ? "Save changes"
              : "List this gear"}
        </Button>
      </div>
    </form>
  );
}
