"use client";

import { useMemo } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { usePlatform } from "@/lib/store/platform-store";
import { formatNaira } from "@/lib/utils";

const COLORS = ["#7B2FF7", "#00F0FF", "#D4AF37", "#BDBDBD"];

export default function ReportsPage() {
  const { orders, tickets, salesByMonth, stats } = usePlatform();

  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    orders
      .filter((o) => o.status === "completed")
      .forEach((o) => {
        o.items.forEach((item) => {
          counts[item.ticketName] = (counts[item.ticketName] ?? 0) + item.quantity;
        });
      });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const conversionData = useMemo(() => {
    const views = 10000;
    const clicks = Math.max(orders.length * 12, 420);
    const cart = Math.max(orders.length * 3, 180);
    const purchase = orders.filter((o) => o.status === "completed").length;
    return [
      { stage: "Views", value: views },
      { stage: "Clicks", value: clicks },
      { stage: "Cart", value: cart },
      { stage: "Purchase", value: Math.max(purchase, 1) },
    ];
  }, [orders]);

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Reports</h1>
          <p className="mt-1 text-muted">Live analytics · {formatNaira(stats.revenue)} total revenue</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><FileText className="h-4 w-4" /> PDF</Button>
          <Button variant="outline" size="sm"><FileSpreadsheet className="h-4 w-4" /> Excel</Button>
          <Button variant="outline" size="sm"><Download className="h-4 w-4" /> CSV</Button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl electric-card p-6">
          <h2 className="font-heading text-lg font-bold text-white">Revenue</h2>
          <div className="mt-4 h-64 min-h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#BDBDBD" fontSize={12} />
                <YAxis stroke="#BDBDBD" fontSize={12} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "#0D0D0D", border: "1px solid rgba(0,240,255,0.15)", borderRadius: 12 }} formatter={(v) => [formatNaira(Number(v ?? 0)), "Revenue"]} />
                <Line type="monotone" dataKey="revenue" stroke="#7B2FF7" strokeWidth={2} dot={{ fill: "#7B2FF7" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl electric-card p-6">
          <h2 className="font-heading text-lg font-bold text-white">Ticket Distribution</h2>
          <div className="mt-4 h-64 min-h-64">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0D0D0D", border: "1px solid rgba(0,240,255,0.15)", borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-muted text-sm">No sales data yet</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl electric-card p-6">
          <h2 className="font-heading text-lg font-bold text-white">Inventory Snapshot</h2>
          <div className="mt-4 space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="flex justify-between text-sm">
                <span className="text-muted">{t.name}</span>
                <span className="text-white">{t.sold} sold / {t.remaining} left</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl electric-card p-6">
          <h2 className="font-heading text-lg font-bold text-white">Conversion Funnel</h2>
          <div className="mt-6 space-y-3">
            {conversionData.map((item, i) => (
              <div key={item.stage}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted">{item.stage}</span>
                  <span className="text-white">{item.value.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-electric transition-all"
                    style={{ width: `${(item.value / conversionData[0].value) * 100}%`, opacity: 1 - i * 0.15 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
