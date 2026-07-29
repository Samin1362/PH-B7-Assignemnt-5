import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create an account — GearUp",
};

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Rent the gear you need, or list the gear you own.
        </p>
      </div>

      <Suspense>
        <RegisterForm />
      </Suspense>

      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
