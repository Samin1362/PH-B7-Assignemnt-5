import { Skeleton } from "@/components/ui/skeleton";

export default function NewGearLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="h-[36rem] w-full rounded-2xl" />
    </div>
  );
}
