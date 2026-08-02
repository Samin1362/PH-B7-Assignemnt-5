"use client";

import { Search, X } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryParams } from "@/hooks/use-query-params";
import { cn } from "@/lib/utils";

/** Radix Select cannot hold an empty value, so "no filter" needs a sentinel. */
const ANY = "any";

export function AdminSearch({
  placeholder,
  defaultValue,
}: {
  placeholder: string;
  defaultValue: string;
}) {
  const { setParamsDebounced, setParams } = useQueryParams();
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        className="px-9"
        onChange={(event) => {
          setValue(event.target.value);
          setParamsDebounced({ search: event.target.value }, 400);
        }}
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Clear search"
          className="absolute top-1/2 right-1 -translate-y-1/2"
          onClick={() => {
            setValue("");
            setParams({ search: null });
          }}
        >
          <X />
        </Button>
      ) : null}
    </div>
  );
}

export function AdminSelect({
  label,
  param,
  value,
  options,
  className,
}: {
  label: string;
  param: string;
  value: string | null;
  options: { value: string; label: string }[];
  className?: string;
}) {
  const { setParams } = useQueryParams();
  const [pending, startTransition] = useTransition();

  return (
    <Select
      value={value ?? ANY}
      onValueChange={(next) =>
        startTransition(() => setParams({ [param]: next === ANY ? null : next }))
      }
    >
      <SelectTrigger
        aria-label={label}
        className={cn("w-full sm:w-44", pending && "opacity-60", className)}
      >
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ANY}>{label}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
