"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Store, Tent } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { applyApiError } from "@/components/forms/form-error";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { roleHome } from "@/constants/routes";
import { appPost } from "@/lib/client-api";
import { cn } from "@/lib/utils";
import { registerSchema, type RegisterValues } from "@/schemas/auth";
import type { User } from "@/types/api";

const roles = [
  {
    value: "CUSTOMER" as const,
    label: "Rent gear",
    description: "Browse and book equipment",
    icon: Tent,
  },
  {
    value: "PROVIDER" as const,
    label: "List gear",
    description: "Rent out your equipment",
    icon: Store,
  },
];

export function RegisterForm() {
  const router = useRouter();

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "CUSTOMER",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async ({ confirmPassword, ...values }: RegisterValues) => {
    void confirmPassword;
    try {
      const result = await appPost<{ user: User; signedIn: boolean }>(
        "/api/auth/register",
        { ...values, phone: values.phone || undefined },
      );

      if (!result.data.signedIn) {
        toast.success("Account created — please sign in");
        router.replace("/login");
        return;
      }

      toast.success(`Welcome to GearUp, ${result.data.user.name}`);
      router.replace(roleHome[result.data.user.role]);
      router.refresh();
    } catch (error) {
      applyApiError(error, setError, [
        "name",
        "email",
        "phone",
        "role",
        "password",
      ]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <Field data-invalid={!!errors.role}>
              <FieldLabel>I want to</FieldLabel>
              <div className="grid gap-3 sm:grid-cols-2">
                {roles.map(({ value, label, description, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={field.value === value}
                    onClick={() => field.onChange(value)}
                    className={cn(
                      "rounded-xl border p-4 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
                      field.value === value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-5",
                        field.value === value
                          ? "text-primary"
                          : "text-muted-foreground",
                      )}
                    />
                    <p className="mt-2 font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">
                      {description}
                    </p>
                  </button>
                ))}
              </div>
              <FieldError errors={[errors.role]} />
            </Field>
          )}
        />

        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">Full name</FieldLabel>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Alex Morgan"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field data-invalid={!!errors.phone}>
          <FieldLabel htmlFor="phone">Phone (optional)</FieldLabel>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+1 555 0100"
            aria-invalid={!!errors.phone}
            {...register("phone")}
          />
          <FieldError errors={[errors.phone]} />
        </Field>

        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <FieldError errors={[errors.password]} />
        </Field>

        <Field data-invalid={!!errors.confirmPassword}>
          <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          <FieldError errors={[errors.confirmPassword]} />
        </Field>

        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </FieldGroup>
    </form>
  );
}
