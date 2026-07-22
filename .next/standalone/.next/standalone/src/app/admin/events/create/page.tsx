"use client";

import { useState } from "react";
import { Check, Upload, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { corechella, VENUE, CITY } from "@/lib/data";

const steps = [
  "Event Information",
  "Venue Information",
  "Ticket Setup",
  "Media Upload",
  "Publish",
];

const ticketTypes = ["Regular", "VIP", "VVIP", "Early Bird", "Group", "Custom"];

export default function CreateEventPage() {
  const [step, setStep] = useState(0);
  const [tickets, setTickets] = useState([
    { name: "Early Bird", price: "2000", qty: "100" },
    { name: "Regular", price: "2000", qty: "500" },
    { name: "VIP", price: "2000", qty: "80" },
    { name: "VVIP", price: "2000", qty: "20" },
  ]);

  return (
    <div className="p-6 lg:p-10 max-w-4xl">
      <h1 className="font-heading text-3xl font-bold text-white">Configure Edition</h1>
      <p className="mt-1 text-muted">Update Corechella {corechella.edition} settings</p>

      {/* Step Indicator */}
      <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 shrink-0">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                i < step ? "bg-primary text-white" : i === step ? "bg-primary/20 text-primary border border-primary" : "bg-white/5 text-muted"
              )}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn("text-xs hidden sm:block", i === step ? "text-white" : "text-muted")}>
              {s}
            </span>
            {i < steps.length - 1 && <div className="w-8 h-px bg-white/10" />}
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl electric-card p-6">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-heading text-xl font-bold text-white">Event Information</h2>
            <div><Label className="mb-2 block">Event Name</Label><Input defaultValue={corechella.title} /></div>
            <div><Label className="mb-2 block">Description</Label><Textarea defaultValue={corechella.description} rows={4} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label className="mb-2 block">Category</Label><Input defaultValue="Raves" /></div>
              <div><Label className="mb-2 block">Organizer</Label><Input defaultValue={corechella.organizer} /></div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-heading text-xl font-bold text-white">Venue Information</h2>
            <div><Label className="mb-2 block">Venue Name</Label><Input defaultValue={VENUE} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label className="mb-2 block">City</Label><Input defaultValue={CITY} /></div>
              <div><Label className="mb-2 block">Country</Label><Input defaultValue="Nigeria" /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label className="mb-2 block">Date</Label><Input type="date" defaultValue={corechella.date} /></div>
              <div><Label className="mb-2 block">Time</Label><Input type="time" defaultValue="18:00" /></div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-heading text-xl font-bold text-white">Ticket Setup</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {ticketTypes.map((t) => (
                <Badge key={t} variant="secondary" className="cursor-pointer hover:bg-primary/20">{t}</Badge>
              ))}
            </div>
            {tickets.map((ticket, i) => (
              <div key={i} className="grid gap-3 sm:grid-cols-4 items-end rounded-xl border border-white/8 p-4">
                <div><Label className="mb-2 block">Type</Label><Input defaultValue={ticket.name} /></div>
                <div><Label className="mb-2 block">Price (₦)</Label><Input defaultValue={ticket.price} /></div>
                <div><Label className="mb-2 block">Quantity</Label><Input defaultValue={ticket.qty} /></div>
                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-400" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm"><Plus className="h-4 w-4" /> Add Ticket Type</Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-heading text-xl font-bold text-white">Media Upload</h2>
            <div>
              <Label className="mb-2 block">Event Banner</Label>
              <div className="flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/2 hover:border-primary/30 transition-colors cursor-pointer">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted" />
                  <p className="mt-2 text-sm text-muted">Drag & drop or click to upload</p>
                </div>
              </div>
            </div>
            <div>
              <Label className="mb-2 block">Gallery Images</Label>
              <div className="grid gap-4 sm:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex h-28 items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/2 cursor-pointer hover:border-primary/30">
                    <Upload className="h-6 w-6 text-muted" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
              <Check className="h-8 w-8" />
            </div>
            <h2 className="mt-4 font-heading text-2xl font-bold text-white">Ready to Publish</h2>
            <p className="mt-2 text-muted">Review your event details and publish when ready</p>
            <Button className="mt-6" size="lg">Publish Event</Button>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
          Back
        </Button>
        {step < steps.length - 1 ? (
          <Button onClick={() => setStep(step + 1)}>Continue</Button>
        ) : null}
      </div>
    </div>
  );
}
