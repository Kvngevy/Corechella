"use client";

import { useState } from "react";
import { Pencil, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";
import type { TicketInventory } from "@/lib/store/types";

interface TicketEditorProps {
  ticket: TicketInventory;
  onSave: (payload: {
    id: string;
    name: string;
    price: number;
    description: string;
    total: number;
  }) => Promise<{ success: boolean; error?: string }>;
}

export function TicketEditor({ ticket, onSave }: TicketEditorProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(ticket.name);
  const [price, setPrice] = useState(String(ticket.price));
  const [description, setDescription] = useState(ticket.description);
  const [total, setTotal] = useState(String(ticket.total));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setName(ticket.name);
    setPrice(String(ticket.price));
    setDescription(ticket.description);
    setTotal(String(ticket.total));
    setError("");
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const result = await onSave({
      id: ticket.id,
      name: name.trim(),
      price: Number(price),
      description: description.trim(),
      total: Math.floor(Number(total)),
    });
    setSaving(false);
    if (!result.success) {
      setError(result.error ?? "Failed to save");
      return;
    }
    setEditing(false);
  };

  const pct = ticket.total ? Math.round((ticket.sold / ticket.total) * 100) : 0;
  const low = ticket.remaining < 50;

  if (!editing) {
    return (
      <div className="rounded-2xl electric-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-heading text-lg font-bold text-white">{ticket.name}</p>
            <p className="text-sm text-muted mt-1">{ticket.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-electric">{formatPrice(ticket.price)}</p>
            <Button variant="ghost" size="icon" onClick={() => setEditing(true)} aria-label="Edit ticket">
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-lg font-bold text-white">{ticket.sold}</p>
            <p className="text-[10px] text-muted uppercase">Sold</p>
          </div>
          <div className="rounded-xl bg-white/5 p-3">
            <p className={`text-lg font-bold ${low ? "text-orange-400" : "text-white"}`}>{ticket.remaining}</p>
            <p className="text-[10px] text-muted uppercase">Left</p>
          </div>
          <div className="rounded-xl bg-white/5 p-3">
            <p className="text-lg font-bold text-white">{pct}%</p>
            <p className="text-[10px] text-muted uppercase">Capacity</p>
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className={`h-full rounded-full ${low ? "bg-orange-400" : "bg-gradient-to-r from-electric to-violet"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {low && <p className="mt-2 text-xs text-orange-400">Low stock — consider releasing more inventory</p>}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-electric/30 bg-surface p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="font-heading text-lg font-bold text-white">Edit {ticket.name}</p>
        <Button variant="ghost" size="icon" onClick={() => { resetForm(); setEditing(false); }} aria-label="Cancel edit">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <Label className="mb-2 block">Ticket name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label className="mb-2 block">Price (₦)</Label>
          <Input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label className="mb-2 block">Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        </div>
        <div>
          <Label className="mb-2 block">Total capacity</Label>
          <Input
            type="number"
            min={ticket.sold}
            value={total}
            onChange={(e) => setTotal(e.target.value)}
          />
          <p className="mt-1 text-xs text-muted">Minimum {ticket.sold} (already sold)</p>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <div className="mt-4 flex gap-2">
        <Button onClick={handleSave} disabled={saving}>
          <Check className="h-4 w-4" />
          {saving ? "Saving..." : "Save changes"}
        </Button>
        <Button variant="outline" onClick={() => { resetForm(); setEditing(false); }} disabled={saving}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
