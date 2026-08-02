"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { applyApiError } from "@/components/forms/form-error";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { clientFetchData } from "@/lib/client-api";
import { profileSchema, type ProfileValues } from "@/schemas/profile";
import type { User } from "@/types/api";

export function ProfileForm({ user }: { user: User }) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      phone: user.phone ?? "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ProfileValues) => {
    const patch: { name?: string; phone?: string; password?: string } = {};
    if (values.name !== user.name) {
      patch.name = values.name;
    }
    if (values.phone !== (user.phone ?? "")) {
      patch.phone = values.phone;
    }
    if (values.password) {
      patch.password = values.password;
    }

    // The API rejects an empty body, and there is nothing to send anyway.
    if (Object.keys(patch).length === 0) {
      toast.info("Nothing to update yet");
      return;
    }

    try {
      const updated = await clientFetchData<User>("/users/me", {
        method: "PATCH",
        body: patch,
      });

      reset({
        name: updated.name,
        phone: updated.phone ?? "",
        password: "",
        confirmPassword: "",
      });
      toast.success(
        patch.password ? "Profile and password updated" : "Profile updated",
      );
      router.refresh();
    } catch (error) {
      applyApiError(error, setError, ["name", "phone", "password"]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">Full name</FieldLabel>
          <Input
            id="name"
            autoComplete="name"
            aria-invalid={!!errors.name}
            defaultValue={user.name}
            {...register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field data-invalid={!!errors.phone}>
          <FieldLabel htmlFor="phone">Phone</FieldLabel>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+1 555 0100"
            aria-invalid={!!errors.phone}
            defaultValue={user.phone ?? ""}
            {...register("phone")}
          />
          <FieldError errors={[errors.phone]} />
        </Field>

        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password">New password</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Leave blank to keep your current password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <FieldDescription>At least 6 characters.</FieldDescription>
          <FieldError errors={[errors.password]} />
        </Field>

        <Field data-invalid={!!errors.confirmPassword}>
          <FieldLabel htmlFor="confirmPassword">
            Confirm new password
          </FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          <FieldError errors={[errors.confirmPassword]} />
        </Field>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
