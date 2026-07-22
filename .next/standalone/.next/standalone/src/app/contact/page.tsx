"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { corechella, TICKET_SUPPORT_PHONE } from "@/lib/data";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 electric-grid">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold text-white">Contact</h1>
          <p className="mt-2 text-muted">We&apos;d love to hear from you</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Phone,
                label: "Ticket Support",
                value: TICKET_SUPPORT_PHONE,
                href: `tel:${TICKET_SUPPORT_PHONE}`,
                hint: "Issues with tickets or checkout",
              },
              { icon: Mail, label: "Email", value: "hello@corechella.com" },
              { icon: MapPin, label: "Venue", value: `${corechella.venue}, ${corechella.city}` },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl electric-card p-4 text-center sm:text-left">
                <item.icon className="mx-auto sm:mx-0 h-5 w-5 text-electric" />
                <p className="mt-2 text-xs uppercase tracking-wider text-electric">{item.label}</p>
                {"href" in item && item.href ? (
                  <a href={item.href} className="mt-1 block text-sm font-semibold text-white hover:text-gold">
                    {item.value}
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-white">{item.value}</p>
                )}
                {"hint" in item && item.hint ? (
                  <p className="mt-1 text-xs text-muted">{item.hint}</p>
                ) : null}
              </div>
            ))}
          </div>

          {submitted ? (
            <div className="mt-10 rounded-2xl electric-card p-8 text-center">
              <p className="font-heading text-xl font-semibold text-white">Message sent!</p>
              <p className="mt-2 text-sm text-muted">
                Thanks for reaching out. Our team will get back to you within 48 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 space-y-4 rounded-2xl electric-card p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="mb-2 block">Name</Label>
                  <Input required placeholder="Your name" />
                </div>
                <div>
                  <Label className="mb-2 block">Email</Label>
                  <Input type="email" required placeholder="you@email.com" />
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Subject</Label>
                <Input required placeholder="Tickets, partnerships, press..." />
              </div>
              <div>
                <Label className="mb-2 block">Message</Label>
                <Textarea required rows={5} placeholder="How can we help?" />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
