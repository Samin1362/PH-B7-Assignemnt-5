"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { publicNav } from "@/constants/nav";
import { roleHome } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { User } from "@/types/api";

export function MobileNav({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label="Open menu"
          className="md:hidden"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {publicNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                pathname === item.href && "bg-muted text-primary",
              )}
            >
              {item.label}
            </Link>
          ))}

          <div className="my-3 h-px bg-border" />

          {user ? (
            <>
              <Link
                href={roleHome[user.role]}
                onClick={close}
                className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/profile"
                onClick={close}
                className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                Profile
              </Link>
            </>
          ) : (
            <div className="flex flex-col gap-2 px-3">
              <Button asChild variant="outline" onClick={close}>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild onClick={close}>
                <Link href="/register">Get started</Link>
              </Button>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
