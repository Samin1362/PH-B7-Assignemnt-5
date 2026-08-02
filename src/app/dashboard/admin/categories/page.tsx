import { FolderTree, ServerCrash } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import {
  CategoryDialog,
  DeleteCategoryButton,
} from "@/components/admin/category-actions";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/layout/container";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { serverFetchSafe } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { Category } from "@/types/api";

export const metadata: Metadata = {
  title: "Categories — GearUp",
};

async function Categories() {
  const result = await serverFetchSafe<Category[]>("/categories", {
    auth: false,
  });

  if (!result) {
    return (
      <EmptyState
        icon={ServerCrash}
        title="Categories could not be loaded"
        description="We could not reach the GearUp service. Please try again in a moment."
      />
    );
  }

  const categories = result.data;

  if (categories.length === 0) {
    return (
      <EmptyState
        icon={FolderTree}
        title="No categories yet"
        description="Providers need at least one category before they can list gear."
        action={<CategoryDialog />}
      />
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {categories.map((category) => (
        <li key={category.id}>
          <Card>
            <CardContent className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">{category.name}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {category.description || "No description"}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Added {formatDate(category.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <CategoryDialog category={category} />
                <DeleteCategoryButton category={category} />
              </div>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}

function CategoriesSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-28 w-full rounded-2xl" />
      ))}
    </div>
  );
}

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="The list providers choose from when they list gear."
        action={<CategoryDialog />}
      />

      <Suspense fallback={<CategoriesSkeleton />}>
        <Categories />
      </Suspense>
    </div>
  );
}
