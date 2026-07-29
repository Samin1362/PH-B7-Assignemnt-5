"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { applyApiError } from "@/components/forms/form-error";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { roleHome } from "@/constants/routes";
import { appPost } from "@/lib/client-api";
import { loginSchema, type LoginValues } from "@/schemas/auth";
import type { User } from "@/types/api";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const expired = searchParams.get("expired");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      const result = await appPost<{ user: User }>("/api/auth/login", values);
      toast.success(`Welcome back, ${result.data.user.name}`);
      router.replace(next || roleHome[result.data.user.role]);
      router.refresh();
    } catch (error) {
      applyApiError(error, setError, ["email", "password"]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {expired ? (
        <Alert className="mb-6">
          <AlertDescription>
            Your session expired. Please sign in again.
          </AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup>
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

        <Field data-invalid={!!errors.password}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <FieldError errors={[errors.password]} />
        </Field>

        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </FieldGroup>
    </form>
  );
}
