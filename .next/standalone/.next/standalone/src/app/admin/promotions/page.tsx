"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, Tag, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePlatform } from "@/lib/store/platform-store";
import { formatPrice } from "@/lib/utils";

type Notice = { type: "success" | "error"; message: string } | null;

export default function PromotionsPage() {
  const { promos, addPromo, togglePromoStatus, deletePromo, refreshPromos, session } =
    usePlatform();
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("");
  const [maxUses, setMaxUses] = useState("100");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  const canManage =
    session?.role === "super_admin" ||
    (session?.role === "ticket_manager" && session.permissions.includes("manage_promos"));

  useEffect(() => {
    if (!canManage) {
      setLoading(false);
      return;
    }
    void refreshPromos().finally(() => setLoading(false));
  }, [canManage, refreshPromos]);

  const showNotice = (type: "success" | "error", message: string) => {
    setNotice({ type, message });
    window.setTimeout(() => setNotice(null), 4000);
  };

  const handleCreate = async () => {
    const numValue = parseFloat(value);
    const numMax = parseInt(maxUses, 10);
    if (!code.trim()) {
      showNotice("error", "Enter a coupon code");
      return;
    }
    if (Number.isNaN(numValue) || numValue <= 0) {
      showNotice("error", "Enter a valid discount value");
      return;
    }
    if (type === "percent" && numValue > 100) {
      showNotice("error", "Percentage cannot exceed 100%");
      return;
    }
    if (Number.isNaN(numMax) || numMax <= 0) {
      showNotice("error", "Max uses must be a positive number");
      return;
    }

    setSaving(true);
    const result = await addPromo({ code, type, value: numValue, maxUses: numMax });
    setSaving(false);

    if (!result.success) {
      showNotice("error", result.error ?? "Could not create coupon");
      return;
    }

    showNotice("success", `Coupon ${code.trim().toUpperCase()} created`);
    setCode("");
    setValue("");
    setMaxUses("100");
    setShowForm(false);
  };

  const handleToggle = async (id: string) => {
    setBusyId(id);
    const result = await togglePromoStatus(id);
    setBusyId(null);
    if (!result.success) {
      showNotice("error", result.error ?? "Could not update coupon");
      return;
    }
    showNotice("success", "Coupon status updated");
  };

  const handleDelete = async (id: string, couponCode: string) => {
    if (!window.confirm(`Delete coupon ${couponCode}? This cannot be undone.`)) return;
    setBusyId(id);
    const result = await deletePromo(id);
    setBusyId(null);
    if (!result.success) {
      showNotice("error", result.error ?? "Could not delete coupon");
      return;
    }
    showNotice("success", `Coupon ${couponCode} deleted`);
  };

  if (!canManage) {
    return (
      <div className="p-6 lg:p-10">
        <h1 className="font-heading text-3xl font-bold text-white">Coupons & Promotions</h1>
        <p className="mt-4 text-muted">You do not have permission to manage coupons.</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Coupons & Promotions</h1>
          <p className="mt-1 text-muted">Create discount codes — they work instantly at checkout</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" /> Create Coupon
        </Button>
      </div>

      {notice && (
        <div
          className={`mt-6 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
            notice.type === "success"
              ? "border-green-500/30 bg-green-500/10 text-green-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          {notice.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {notice.message}
        </div>
      )}

      {showForm && (
        <div className="mt-6 rounded-2xl electric-card p-6 max-w-xl">
          <h2 className="font-heading text-lg font-bold text-white">New Coupon</h2>
          <p className="mt-1 text-sm text-muted">Guests enter this code on the checkout page</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="mb-2 block">Code</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
                placeholder="SUMMER26"
                className="font-mono uppercase"
              />
            </div>
            <div>
              <Label className="mb-2 block">Type</Label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "percent" | "fixed")}
                className="w-full rounded-xl border border-electric/10 bg-surface px-3 py-2 text-sm text-white"
              >
                <option value="percent">Percentage off</option>
                <option value="fixed">Fixed amount (₦)</option>
              </select>
            </div>
            <div>
              <Label className="mb-2 block">Value</Label>
              <Input
                type="number"
                min={1}
                max={type === "percent" ? 100 : undefined}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={type === "percent" ? "10" : "5000"}
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-2 block">Max Uses</Label>
              <Input
                type="number"
                min={1}
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => void handleCreate()} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving ? "Saving..." : "Save Coupon"}
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)} disabled={saving}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="mt-12 flex justify-center text-muted">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : promos.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-electric/20 p-12 text-center">
          <Tag className="mx-auto h-10 w-10 text-muted opacity-40" />
          <p className="mt-4 text-white font-medium">No coupons yet</p>
          <p className="mt-1 text-sm text-muted">Create a coupon code for guests to use at checkout</p>
          <Button className="mt-6" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" /> Create Coupon
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {promos.map((p) => {
            const remaining = Math.max(0, p.maxUses - p.uses);
            const usagePct = p.maxUses > 0 ? Math.round((p.uses / p.maxUses) * 100) : 0;
            const isBusy = busyId === p.id;

            return (
              <div key={p.id} className="rounded-2xl electric-card p-6">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-mono text-lg font-bold text-electric">{p.code}</span>
                  <Badge variant={p.status === "active" ? "success" : "secondary"}>
                    {p.status === "active" ? "active" : "inactive"}
                  </Badge>
                </div>
                <p className="mt-2 text-2xl font-heading font-bold text-white">
                  {p.type === "percent" ? `${p.value}%` : formatPrice(p.value)} off
                </p>
                <p className="mt-2 text-sm text-muted">
                  {p.uses} used · {remaining} remaining of {p.maxUses}
                </p>
                <div className="mt-3 h-1.5 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-electric transition-all"
                    style={{ width: `${Math.min(100, usagePct)}%` }}
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleToggle(p.id)}
                    disabled={isBusy}
                  >
                    {isBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                    {p.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                    onClick={() => void handleDelete(p.id, p.code)}
                    disabled={isBusy}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
