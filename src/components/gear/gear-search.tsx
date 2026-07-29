"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function GearSearch({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const [term, setTerm] = useState(defaultValue);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = term.trim();
        router.push(trimmed ? `/gear?search=${encodeURIComponent(trimmed)}` : "/gear");
      }}
      className="flex w-full max-w-lg items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-sm"
      role="search"
    >
      <Search className="ml-2 size-4 shrink-0 text-muted-foreground" />
      <Input
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Search tents, kayaks, bikes…"
        aria-label="Search gear"
        className="border-0 bg-transparent shadow-none focus-visible:ring-0"
      />
      <Button type="submit" size="lg">
        Search
      </Button>
    </form>
  );
}
