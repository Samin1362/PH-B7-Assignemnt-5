import { ServerCrash, Star } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/layout/container";
import { RatingStars } from "@/components/review/rating-stars";
import { ReviewDialog } from "@/components/review/review-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { serverFetchSafe } from "@/lib/api";
import { orderRef } from "@/lib/orders";
import {
  loadMyReviews,
  reviewableItems,
  reviewKey,
  splitReviews,
} from "@/lib/reviews";
import { requireSession } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import type { RentalOrder } from "@/types/api";

export const metadata: Metadata = {
  title: "My reviews — GearUp",
};

async function Reviews() {
  const [user, result] = await Promise.all([
    requireSession("/dashboard/customer/reviews"),
    serverFetchSafe<RentalOrder[]>("/rentals"),
  ]);

  if (!result) {
    return (
      <EmptyState
        icon={ServerCrash}
        title="Reviews could not be loaded"
        description="We could not reach the GearUp service. Please try again in a moment."
      />
    );
  }

  const items = reviewableItems(result.data);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Star}
        title="Nothing to review yet"
        description="You can review gear once a rental has been returned."
        action={
          <Button asChild>
            <Link href="/dashboard/customer/orders">My rentals</Link>
          </Button>
        }
      />
    );
  }

  const mine = await loadMyReviews(
    items.map((item) => item.gearItemId),
    user.id,
  );

  const { pending, written } = splitReviews(items, mine);

  return (
    <div className="space-y-8">
      {pending.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">
            Waiting for your review ({pending.length})
          </h2>
          <ul className="space-y-3">
            {pending.map((item) => (
              <li key={reviewKey(item.gearItemId, item.rentalOrderId)}>
                <Card>
                  <CardContent className="flex flex-wrap items-center justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        href={`/gear/${item.gearItemId}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {item.gearName}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        Rental{" "}
                        <Link
                          href={`/dashboard/customer/orders/${item.rentalOrderId}`}
                          className="tabular-nums underline-offset-4 hover:underline"
                        >
                          {orderRef(item.rentalOrderId)}
                        </Link>{" "}
                        · returned {formatDate(item.returnedAt)}
                      </p>
                    </div>
                    <ReviewDialog
                      gearItemId={item.gearItemId}
                      gearName={item.gearName}
                      rentalOrderId={item.rentalOrderId}
                    />
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          Your reviews ({written.length})
        </h2>

        {written.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You have not written a review yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {written.map(({ item, review }) => (
              <li key={review.id}>
                <Card>
                  <CardContent className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <Link
                        href={`/gear/${item.gearItemId}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {item.gearName}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    <RatingStars rating={review.rating} size="sm" />
                    {review.comment ? (
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {review.comment}
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-24 w-full rounded-2xl" />
      ))}
    </div>
  );
}

export default function CustomerReviewsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My reviews"
        description="Rate the gear you have rented and returned."
      />

      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews />
      </Suspense>
    </div>
  );
}
