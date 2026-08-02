import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProviderOrderAction } from "@/components/rental/provider-order-action";
import { orderRef } from "@/lib/orders";
import { providerOrderView } from "@/lib/provider";
import { formatDate, formatRentalRange, initials, money } from "@/lib/utils";
import type { RentalOrder } from "@/types/api";

function GearLines({
  order,
  own,
}: {
  order: RentalOrder;
  own: Set<string>;
}) {
  const { ownItems, otherCount } = providerOrderView(order, own);

  return (
    <div className="space-y-0.5">
      {ownItems.map((item) => (
        <p key={item.id} className="truncate text-sm">
          {item.quantity} × {item.gearItem?.name ?? "Gear item"}
        </p>
      ))}
      {otherCount > 0 ? (
        <p className="text-xs text-muted-foreground">
          +{otherCount} item{otherCount === 1 ? "" : "s"} from other providers
        </p>
      ) : null}
    </div>
  );
}

export function ProviderOrderList({
  orders,
  own,
}: {
  orders: RentalOrder[];
  own: Set<string>;
}) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Your gear</TableHead>
              <TableHead>Rental period</TableHead>
              <TableHead className="text-right">Your share</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const view = providerOrderView(order, own);

              return (
                <TableRow key={order.id} className="hover:bg-muted/50">
                  <TableCell>
                    <p className="font-medium tabular-nums">
                      {orderRef(order.id)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-7">
                        <AvatarFallback className="bg-primary/10 text-[0.65rem] font-medium text-primary">
                          {initials(order.customer?.name ?? "GearUp")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {order.customer?.name ?? "GearUp customer"}
                        </p>
                        {order.customer?.email ? (
                          <p className="truncate text-xs text-muted-foreground">
                            {order.customer.email}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-56">
                    <GearLines order={order} own={own} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatRentalRange(order.startDate, order.endDate)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {money(view.ownSubtotal)}
                    {view.otherCount > 0 ? (
                      <p className="text-xs text-muted-foreground">
                        of {money(order.totalPrice)}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <ProviderOrderAction order={order} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ul className="space-y-3 lg:hidden">
        {orders.map((order) => {
          const view = providerOrderView(order, own);

          return (
            <li
              key={order.id}
              className="space-y-3 rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium tabular-nums">
                    {orderRef(order.id)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.customer?.name ?? "GearUp customer"} ·{" "}
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <p className="shrink-0 font-semibold tabular-nums">
                  {money(view.ownSubtotal)}
                </p>
              </div>

              <GearLines order={order} own={own} />

              <p className="text-xs text-muted-foreground">
                {formatRentalRange(order.startDate, order.endDate)}
              </p>

              <div className="border-t border-border pt-3">
                <ProviderOrderAction order={order} />
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export function ProviderOrderListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-24 w-full rounded-2xl" />
      ))}
    </div>
  );
}
