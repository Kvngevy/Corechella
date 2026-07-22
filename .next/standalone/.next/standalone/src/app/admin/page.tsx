"use client";

import Link from "next/link";
import {
  Banknote,
  Ticket,
  Calendar,
  Users,
  ScanLine,
  TrendingUp,
  ShoppingCart,
  Tag,
  BarChart3,
  ArrowRight,
  Phone,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { corechella, EARLY_BIRD_ALLOCATION, TOTAL_EDITIONS, VENUE_FULL } from "@/lib/data";
import { usePlatform } from "@/lib/store/platform-store";
import { formatNaira, formatPrice } from "@/lib/utils";

const quickLinks = [
  { href: "/admin/events", label: "Ticket Monitoring", icon: Ticket, permission: "manage_events" },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart, permission: "manage_orders" },
  { href: "/admin/promotions", label: "Coupons", icon: Tag, permission: "manage_promos" },
  { href: "/admin/check-in", label: "Check-in", icon: ScanLine, permission: "check_in" },
  { href: "/admin/attendees", label: "Attendees", icon: Users, permission: "manage_attendees" },
  { href: "/admin/reports", label: "Reports", icon: BarChart3, permission: "manage_orders" },
] as const;

export default function AdminDashboardPage() {
  const { stats, salesByMonth, tickets, session } = usePlatform();
  const checkInPct = stats.totalAttendees
    ? Math.round((stats.checkedIn / stats.totalAttendees) * 100)
    : 0;

  const visibleQuickLinks = quickLinks.filter((link) => {
    if (session?.role === "super_admin") return true;
    if (session?.role !== "ticket_manager") return false;
    return session.permissions.includes(link.permission);
  });

  const statCards = [
    { label: "Total Revenue", value: formatNaira(stats.revenue), change: `${stats.pendingOrders} pending`, icon: Banknote },
    { label: "Early Bird Issued", value: `${stats.earlyBirdIssued} / ${EARLY_BIRD_ALLOCATION}`, change: `${stats.earlyBirdRemaining} left`, icon: Ticket },
    { label: "Regular Sold", value: String(stats.regularSold), change: "₦3,000 each", icon: ShoppingCart },
    { label: "VIP Sold", value: String(stats.vipSold), change: "₦25,000 each", icon: Users },
    { label: "Table Calls", value: String(stats.tableReservationCalls), change: "Tracked", icon: Phone },
    { label: "Check-ins Today", value: String(stats.checkInsToday), change: `${checkInPct}% total`, icon: ScanLine },
  ];

  return (
    <div className="p-6 lg:p-10">
      <div>
        <h1 className="font-heading text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-muted">Corechella {corechella.edition} · {VENUE_FULL}</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="rounded-2xl electric-card p-5 transition-colors hover:border-electric/30">
            <div className="flex items-center justify-between">
              <stat.icon className="h-5 w-5 text-electric" />
              <span className="flex items-center gap-1 text-xs text-green-400">
                <TrendingUp className="h-3 w-3" /> {stat.change}
              </span>
            </div>
            <p className="mt-3 font-heading text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="font-heading text-lg font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleQuickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center justify-between rounded-xl electric-card px-4 py-3 hover:border-electric/30 transition-colors group"
            >
              <span className="flex items-center gap-3 text-sm font-medium text-white">
                <link.icon className="h-4 w-4 text-electric" />
                {link.label}
              </span>
              <ArrowRight className="h-4 w-4 text-muted group-hover:text-electric transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-2xl electric-card p-6">
        <h2 className="font-heading text-lg font-bold text-white mb-2">Early Bird Allocation</h2>
        <p className="text-sm text-muted mb-4">
          {stats.earlyBirdIssued} of {EARLY_BIRD_ALLOCATION} free tickets issued · {stats.earlyBirdRemaining} remaining
        </p>
        <div className="h-3 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-500 to-primary transition-all"
            style={{ width: `${Math.min(100, (stats.earlyBirdIssued / EARLY_BIRD_ALLOCATION) * 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-8 rounded-2xl electric-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-bold text-white">Live Ticket Inventory</h2>
          <Link href="/admin/events" className="text-sm text-electric hover:underline">View all</Link>
        </div>
        <div className="space-y-4">
          {tickets.map((t) => {
            const pct = t.total ? Math.round((t.sold / t.total) * 100) : 0;
            return (
              <div key={t.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white">{t.name}</span>
                  <span className="text-muted">{t.sold} sold · {t.remaining} left</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-electric to-violet" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl electric-card p-6">
          <h2 className="font-heading text-lg font-bold text-white">Sales Trends</h2>
          <div className="mt-4 h-64 min-h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesByMonth}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7B2FF7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7B2FF7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#BDBDBD" fontSize={12} />
                <YAxis stroke="#BDBDBD" fontSize={12} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "#0D0D0D", border: "1px solid rgba(0,240,255,0.15)", borderRadius: 12 }}
                  formatter={(value) => [formatNaira(Number(value ?? 0)), "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#7B2FF7" fill="url(#colorRev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl electric-card p-6">
          <h2 className="font-heading text-lg font-bold text-white">Tickets Sold</h2>
          <div className="mt-4 h-64 min-h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#BDBDBD" fontSize={12} />
                <YAxis stroke="#BDBDBD" fontSize={12} />
                <Tooltip contentStyle={{ background: "#0D0D0D", border: "1px solid rgba(0,240,255,0.15)", borderRadius: 12 }} />
                <Bar dataKey="tickets" fill="#00F0FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
