import {
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  Package,
  ShoppingBag,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/types/api";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const publicNav = [
  { href: "/gear", label: "Browse gear" },
  { href: "/#how-it-works", label: "How it works" },
];

export const dashboardNav: Record<UserRole, NavItem[]> = {
  CUSTOMER: [
    { href: "/dashboard/customer", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/customer/orders", label: "My rentals", icon: ShoppingBag },
    { href: "/dashboard/customer/payments", label: "Payments", icon: CreditCard },
    { href: "/dashboard/customer/reviews", label: "My reviews", icon: Star },
  ],
  PROVIDER: [
    { href: "/dashboard/provider", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/provider/gear", label: "My gear", icon: Package },
    { href: "/dashboard/provider/orders", label: "Orders", icon: ClipboardList },
  ],
  ADMIN: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/gear", label: "Gear", icon: Package },
    { href: "/dashboard/admin/rentals", label: "Rentals", icon: ClipboardList },
    { href: "/dashboard/admin/categories", label: "Categories", icon: MessageSquare },
  ],
};
