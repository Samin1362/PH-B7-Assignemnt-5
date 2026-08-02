"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { UserRole } from "@/types/api";

export function DashboardDrawer({ role }: { role: UserRole }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label="Open dashboard menu"
          className="md:hidden"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-sidebar">
        <SheetHeader>
          <SheetTitle className="sr-only">Dashboard menu</SheetTitle>
          <Logo href="/" />
        </SheetHeader>
        <div className="px-4">
          <DashboardNav role={role} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
