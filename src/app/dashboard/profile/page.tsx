import type { Metadata } from "next";
import { ProfileForm } from "@/app/dashboard/profile/profile-form";
import { PageHeader } from "@/components/layout/container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toneClasses } from "@/constants/status";
import { serverFetchSafe } from "@/lib/api";
import { requireSession } from "@/lib/session";
import { cn, formatDate } from "@/lib/utils";
import type { User } from "@/types/api";

export const metadata: Metadata = {
  title: "Profile — GearUp",
};

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-2.5 last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

export default async function ProfilePage() {
  const session = await requireSession("/dashboard/profile");
  const result = await serverFetchSafe<User>("/users/me");
  const user = result?.data ?? session;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Update your details and password."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal details</CardTitle>
            <CardDescription>
              Your email address cannot be changed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm user={user} />
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent>
            <dl>
              <Detail label="Email" value={user.email} />
              <Detail
                label="Role"
                value={<span className="capitalize">{user.role.toLowerCase()}</span>}
              />
              <Detail
                label="Status"
                value={
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      toneClasses[
                        user.status === "ACTIVE" ? "success" : "danger"
                      ],
                    )}
                  >
                    {user.status === "ACTIVE" ? "Active" : "Suspended"}
                  </span>
                }
              />
              <Detail label="Member since" value={formatDate(user.createdAt)} />
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
