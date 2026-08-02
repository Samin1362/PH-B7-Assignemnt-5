import { Compass, ShieldCheck, Tent } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

const highlights = [
  { icon: Tent, text: "Thousands of items from trusted local providers" },
  { icon: Compass, text: "Pick your dates, we handle the rest" },
  { icon: ShieldCheck, text: "Secure payments powered by Stripe" },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <Link href="/" className="text-xl font-semibold">
          GearUp
        </Link>
        <div className="space-y-8">
          <h2 className="max-w-sm text-3xl font-semibold">
            Rent sports &amp; outdoor gear instantly.
          </h2>
          <ul className="space-y-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="rounded-lg bg-white/15 p-2">
                  <Icon className="size-4" />
                </span>
                <span className="text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm">
          &copy; {new Date().getFullYear()} GearUp
        </p>
      </div>

      <main id="main" className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-8 inline-block text-xl font-semibold lg:hidden"
          >
            GearUp
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
