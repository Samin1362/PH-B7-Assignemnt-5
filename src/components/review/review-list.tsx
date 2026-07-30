import { MessageSquareDashed } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { RatingStars } from "@/components/review/rating-stars";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, initials } from "@/lib/utils";
import type { GearReviews, Review } from "@/types/api";

function ReviewCard({ review }: { review: Review }) {
  const name = review.customer?.name ?? "GearUp customer";

  return (
    <li className="border-b border-border py-5 last:border-0">
      <div className="flex items-center gap-3">
        <Avatar className="size-9">
          <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
            {initials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">
            {formatDate(review.createdAt)}
          </p>
        </div>
        <RatingStars rating={review.rating} size="sm" />
      </div>
      {review.comment ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {review.comment}
        </p>
      ) : null}
    </li>
  );
}

function Breakdown({ reviews }: { reviews: Review[] }) {
  return (
    <ul className="space-y-1.5">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = reviews.filter((r) => r.rating === star).length;
        const percent = reviews.length ? (count / reviews.length) * 100 : 0;

        return (
          <li key={star} className="flex items-center gap-2 text-xs">
            <span className="w-3 text-right tabular-nums">{star}</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <span
                className="block h-full rounded-full bg-primary"
                style={{ width: `${percent}%` }}
              />
            </span>
            <span className="w-6 text-right text-muted-foreground tabular-nums">
              {count}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function ReviewSection({ data }: { data: GearReviews | null }) {
  if (!data) {
    return (
      <p className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
        Reviews could not be loaded right now.
      </p>
    );
  }

  if (data.totalReviews === 0) {
    return (
      <EmptyState
        icon={MessageSquareDashed}
        title="No reviews yet"
        description="Reviews appear here once a customer has returned this gear."
      />
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-[220px_1fr]">
      <div className="space-y-4">
        <div>
          <p className="font-display text-4xl font-semibold tabular-nums">
            {data.averageRating.toFixed(1)}
          </p>
          <RatingStars rating={data.averageRating} size="lg" className="mt-2" />
          <p className="mt-2 text-sm text-muted-foreground">
            {data.totalReviews} review{data.totalReviews > 1 ? "s" : ""}
          </p>
        </div>
        <Breakdown reviews={data.reviews} />
      </div>

      <ul className="-mt-5">
        {data.reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </ul>
    </div>
  );
}

export function ReviewSectionSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-[220px_1fr]">
      <div className="space-y-3">
        <Skeleton className="h-10 w-16" />
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
