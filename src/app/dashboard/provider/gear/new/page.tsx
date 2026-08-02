import { ServerCrash } from "lucide-react";
import type { Metadata } from "next";
import { EmptyState } from "@/components/dashboard/empty-state";
import { GearForm } from "@/components/gear/gear-form";
import { PageHeader } from "@/components/layout/container";
import { Card, CardContent } from "@/components/ui/card";
import { serverFetchSafe } from "@/lib/api";
import type { Category } from "@/types/api";

export const metadata: Metadata = {
  title: "Add gear — GearUp",
};

export default async function NewGearPage() {
  const result = await serverFetchSafe<Category[]>("/categories", {
    auth: false,
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Add gear"
        description="List a new item for renters to book."
      />

      {result ? (
        <Card>
          <CardContent>
            <GearForm categories={result.data} />
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={ServerCrash}
          title="Categories could not be loaded"
          description="Gear needs a category, so the form cannot open until the service responds. Please try again in a moment."
        />
      )}
    </div>
  );
}
