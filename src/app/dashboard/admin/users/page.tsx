import { ServerCrash, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminSearch, AdminSelect } from "@/components/admin/admin-filters";
import { UserStatusAction } from "@/components/admin/user-status-action";
import { EmptyState } from "@/components/dashboard/empty-state";
import { UrlPagination } from "@/components/dashboard/pagination";
import { PageHeader } from "@/components/layout/container";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toneClasses } from "@/constants/status";
import { serverFetchSafe } from "@/lib/api";
import {
  ADMIN_PAGE_SIZE,
  filtersKey,
  parseUserFilters,
  type AdminSearchParams,
} from "@/lib/admin";
import { getSession } from "@/lib/session";
import { cn, formatDate, initials } from "@/lib/utils";
import type { User } from "@/types/api";

export const metadata: Metadata = {
  title: "Users — GearUp",
};

type Filters = ReturnType<typeof parseUserFilters>;

function StatusPill({ status }: { status: User["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[status === "ACTIVE" ? "success" : "danger"],
      )}
    >
      {status === "ACTIVE" ? "Active" : "Suspended"}
    </span>
  );
}

async function UserTable({ filters }: { filters: Filters }) {
  const [me, result] = await Promise.all([
    getSession(),
    serverFetchSafe<User[]>("/admin/users", {
      query: {
        role: filters.role ?? undefined,
        status: filters.status ?? undefined,
        search: filters.search ?? undefined,
        page: filters.page,
        limit: ADMIN_PAGE_SIZE,
      },
    }),
  ]);

  if (!result) {
    return (
      <EmptyState
        icon={ServerCrash}
        title="Users could not be loaded"
        description="We could not reach the GearUp service. Please try again in a moment."
      />
    );
  }

  const users = result.data;
  const total = result.meta?.total ?? users.length;

  if (users.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No users match these filters"
        description="Try a different role, status or search term."
        action={
          <Button asChild variant="outline">
            <Link href="/dashboard/admin/users">Clear filters</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                        {initials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="capitalize text-muted-foreground">
                  {user.role.toLowerCase()}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatDate(user.createdAt)}
                </TableCell>
                <TableCell>
                  <StatusPill status={user.status} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <UserStatusAction user={user} isSelf={user.id === me?.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="space-y-3 md:hidden">
        {users.map((user) => (
          <li
            key={user.id}
            className="space-y-3 rounded-2xl border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
                <p className="mt-1 text-xs capitalize text-muted-foreground">
                  {user.role.toLowerCase()} · joined {formatDate(user.createdAt)}
                </p>
              </div>
              <StatusPill status={user.status} />
            </div>
            <div className="flex justify-end border-t border-border pt-3">
              <UserStatusAction user={user} isSelf={user.id === me?.id} />
            </div>
          </li>
        ))}
      </ul>

      <UrlPagination
        page={filters.page}
        limit={ADMIN_PAGE_SIZE}
        total={total}
      />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-16 w-full rounded-2xl" />
      ))}
    </div>
  );
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<AdminSearchParams>;
}) {
  const filters = parseUserFilters(await searchParams);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Everyone on GearUp. Suspend an account to block sign-in without deleting it."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <AdminSearch
          placeholder="Search name or email"
          defaultValue={filters.search ?? ""}
        />
        <AdminSelect
          label="All roles"
          param="role"
          value={filters.role}
          options={[
            { value: "CUSTOMER", label: "Customers" },
            { value: "PROVIDER", label: "Providers" },
            { value: "ADMIN", label: "Admins" },
          ]}
        />
        <AdminSelect
          label="All statuses"
          param="status"
          value={filters.status}
          options={[
            { value: "ACTIVE", label: "Active" },
            { value: "SUSPENDED", label: "Suspended" },
          ]}
        />
      </div>

      <Suspense key={filtersKey(filters)} fallback={<TableSkeleton />}>
        <UserTable filters={filters} />
      </Suspense>
    </div>
  );
}
