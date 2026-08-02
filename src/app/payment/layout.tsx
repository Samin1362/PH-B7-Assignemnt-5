import type { ReactNode } from "react";
import { Logo } from "@/components/layout/logo";

export default function PaymentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center bg-muted/30 px-4 py-10">
      <Logo />
      <main id="main" className="flex w-full max-w-lg flex-1 items-center justify-center">
        {children}
      </main>
    </div>
  );
}
