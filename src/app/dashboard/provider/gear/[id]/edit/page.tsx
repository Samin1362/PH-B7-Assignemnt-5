import { ServerCrash } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { GearForm } from "@/components/gear/gear-form";
import { PageHeader } from "@/components/layout/container";
import { Card, CardContent } from "@/components/ui/card";
import { serverFetch, serverFetchSafe } from "@/lib/api";
import { toApiError } from "@/lib/api-error";
import type { Category, GearItem } from "@/types/api";

/**
 * Loaded from the provider's own list rather than `GET /gear/:id`, so gear
 * belonging to someone else is a 404 here instead of an editable page that
 * would only fail on save.
 */
const loadOwnGear = cache(async (id: string) => {
  try {
    const result = await serverFetch<GearItem[]>("/provider/gear");
    return result.data.find((item) => item.id === id) ?? null;
  } catch (error) {
    toApiError(error);
    return null;
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const gear = await loadOwnGear(id);

  return { title: gear ? `Edit ${gear.name} — GearUp` : "Gear not found — GearUp" };
}

export default async function EditGearPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [gear, categories] = await Promise.all([
    loadOwnGear(id),
    serverFetchSafe<Category[]>("/categories", { auth: false }),
  ]);

  if (!gear) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title={`Edit ${gear.name}`}
        description="Update the listing renters see."
      />

      {categories ? (
        <Card>
          <CardContent>
            <GearForm categories={categories.data} gear={gear} />
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
