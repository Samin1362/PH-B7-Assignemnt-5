import { ChevronRight, ServerCrash, Store } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { GearCard, GearCardSkeleton } from "@/components/gear/gear-card";
import { GearGallery } from "@/components/gear/gear-gallery";
import { Container } from "@/components/layout/container";
import { RatingStars } from "@/components/review/rating-stars";
import {
  ReviewSection,
  ReviewSectionSkeleton,
} from "@/components/review/review-list";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { serverFetch, serverFetchSafe } from "@/lib/api";
import { toApiError } from "@/lib/api-error";
import { formatDate, initials, money } from "@/lib/utils";
import type { GearItem, GearReviews } from "@/types/api";

type GearLookup =
  | { status: "ok"; gear: GearItem }
  | { status: "missing" }
  | { status: "error" };

/**
 * Wrapped in `cache` so `generateMetadata` and the page body share one call.
 * A malformed id is a 400 rather than a 404, so every 4xx counts as missing.
 */
const loadGear = cache(async (id: string): Promise<GearLookup> => {
  try {
    const result = await serverFetch<GearItem>(`/gear/${id}`, { auth: false });
    return { status: "ok", gear: result.data };
  } catch (error) {
    const { status } = toApiError(error);
    return status >= 400 && status < 500
      ? { status: "missing" }
      : { status: "error" };
  }
});

const loadReviews = cache(async (id: string) => {
  const result = await serverFetchSafe<GearReviews>(`/gear/${id}/reviews`, {
    auth: false,
  });
  return result?.data ?? null;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const lookup = await loadGear(id);

  if (lookup.status !== "ok") {
    return { title: "Gear not found — GearUp" };
  }

  const { gear } = lookup;
  const description =
    gear.description ??
    `Rent ${gear.name} from ${gear.provider?.name ?? "a GearUp provider"} for ${money(gear.pricePerDay)} per day.`;

  return {
    title: `${gear.name} — GearUp`,
    description,
    openGraph: {
      title: gear.name,
      description,
      type: "website",
      images: gear.images.length ? [{ url: gear.images[0] }] : undefined,
    },
  };
}

async function InlineRating({ id }: { id: string }) {
  const reviews = await loadReviews(id);

  if (!reviews || reviews.totalReviews === 0) {
    return <p className="text-sm text-muted-foreground">No reviews yet</p>;
  }

  return (
    <Link href="#reviews" className="flex items-center gap-2 text-sm">
      <RatingStars rating={reviews.averageRating} size="sm" />
      <span className="font-medium tabular-nums">
        {reviews.averageRating.toFixed(1)}
      </span>
      <span className="text-muted-foreground underline-offset-4 hover:underline">
        {reviews.totalReviews} review{reviews.totalReviews > 1 ? "s" : ""}
      </span>
    </Link>
  );
}

async function Reviews({ id }: { id: string }) {
  return <ReviewSection data={await loadReviews(id)} />;
}

async function RelatedGear({ gear }: { gear: GearItem }) {
  const result = await serverFetchSafe<GearItem[]>("/gear", {
    query: { categoryId: gear.categoryId, limit: 5 },
    auth: false,
  });

  const related = (result?.data ?? [])
    .filter((item) => item.id !== gear.id)
    .slice(0, 4);

  if (related.length === 0) {
    return null;
  }

  return (
    <section className="mt-14">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-xl font-semibold sm:text-2xl">
          More in {gear.category?.name ?? "this category"}
        </h2>
        <Link
          href={`/gear?categoryId=${gear.categoryId}`}
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          View all
        </Link>
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((item) => (
          <GearCard key={item.id} gear={item} />
        ))}
      </div>
    </section>
  );
}

function RelatedSkeleton() {
  return (
    <section className="mt-14">
      <Skeleton className="h-7 w-56" />
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <GearCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-2.5 last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

export default async function GearDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lookup = await loadGear(id);

  if (lookup.status === "missing") {
    notFound();
  }

  if (lookup.status === "error") {
    return (
      <Container className="py-16">
        <EmptyState
          icon={ServerCrash}
          title="Gear could not be loaded"
          description="We could not reach the GearUp service. Please try again in a moment."
        />
      </Container>
    );
  }

  const { gear } = lookup;
  const soldOut = !gear.isAvailable || gear.stock < 1;

  return (
    <Container className="py-8 sm:py-12">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <li>
            <Link href="/gear" className="hover:text-foreground">
              Browse gear
            </Link>
          </li>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <li aria-current="page" className="font-medium text-foreground">
            {gear.name}
          </li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <GearGallery images={gear.images} name={gear.name} />

        <div className="space-y-6">
          <div className="space-y-3">
            {gear.category ? (
              <Link
                href={`/gear?categoryId=${gear.categoryId}`}
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                {gear.category.name}
              </Link>
            ) : null}
            <h1 className="text-3xl font-semibold sm:text-4xl">{gear.name}</h1>
            <Suspense
              fallback={<Skeleton className="h-5 w-40" />}
            >
              <InlineRating id={gear.id} />
            </Suspense>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-3xl font-semibold tabular-nums">
              {money(gear.pricePerDay)}
              <span className="text-base font-normal text-muted-foreground">
                {" "}
                / day
              </span>
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  soldOut
                    ? "bg-tone-neutral text-tone-neutral-foreground"
                    : "bg-tone-success text-tone-success-foreground"
                }`}
              >
                {soldOut ? "Unavailable" : "Available"}
              </span>
              <span className="text-sm text-muted-foreground">
                {gear.stock} in stock
              </span>
            </div>
          </div>

          {gear.description ? (
            <div className="space-y-2">
              <h2 className="font-semibold">About this gear</h2>
              <p className="leading-relaxed text-muted-foreground">
                {gear.description}
              </p>
            </div>
          ) : null}

          <div className="space-y-2">
            <h2 className="font-semibold">Specifications</h2>
            <dl>
              <Spec label="Brand" value={gear.brand ?? "Unbranded"} />
              <Spec
                label="Category"
                value={gear.category?.name ?? "Uncategorised"}
              />
              <Spec label="Price per day" value={money(gear.pricePerDay)} />
              <Spec label="Stock" value={`${gear.stock} unit${gear.stock === 1 ? "" : "s"}`} />
              <Spec label="Listed on" value={formatDate(gear.createdAt)} />
            </dl>
          </div>

          {gear.provider ? (
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <Avatar className="size-10">
                <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                  {initials(gear.provider.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Store className="size-3.5" aria-hidden="true" />
                  Listed by
                </p>
                <p className="truncate font-medium">{gear.provider.name}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <section id="reviews" className="mt-14 scroll-mt-20">
        <h2 className="text-xl font-semibold sm:text-2xl">Customer reviews</h2>
        <div className="mt-6">
          <Suspense fallback={<ReviewSectionSkeleton />}>
            <Reviews id={gear.id} />
          </Suspense>
        </div>
      </section>

      <Suspense fallback={<RelatedSkeleton />}>
        <RelatedGear gear={gear} />
      </Suspense>
    </Container>
  );
}
