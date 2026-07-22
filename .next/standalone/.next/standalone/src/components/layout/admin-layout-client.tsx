"use client";

import {
  LayoutDashboard,
  Ticket,
  Users,
  ScanLine,
  ShoppingCart,
  BarChart3,
  Tag,
  UserCog,
  Settings,
} from "lucide-react";
import { PortalShell } from "@/components/layout/portal-shell";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/events", label: "Ticket Monitoring", icon: Ticket, permission: "manage_events" },
  { href: "/admin/events/create", label: "Configure", icon: Settings, superAdminOnly: true },
  { href: "/admin/attendees", label: "Attendees", icon: Users, permission: "manage_attendees" },
  { href: "/admin/check-in", label: "Check-in", icon: ScanLine, permission: "check_in" },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart, permission: "manage_orders" },
  { href: "/admin/promotions", label: "Coupons", icon: Tag, permission: "manage_promos" },
  { href: "/admin/reports", label: "Reports", icon: BarChart3, permission: "manage_orders" },
  { href: "/admin/staff", label: "Staff", icon: UserCog, superAdminOnly: true },
];

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell links={links} title="Admin Panel" subtitle="Staff Portal">
      {children}
    </PortalShell>
  );
}
