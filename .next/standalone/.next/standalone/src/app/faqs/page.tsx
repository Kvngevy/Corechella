"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { corechella, TICKET_SUPPORT_PHONE } from "@/lib/data";
import { cn } from "@/lib/utils";

const generalFaqs = [
  {
    question: "Do I need an account to buy tickets?",
    answer: "No. You can buy tickets as a guest without creating an account. QR tickets are shown on the checkout confirmation screen and emailed to you.",
  },
  {
    question: "How do I access my tickets after purchase?",
    answer: "Your QR tickets appear on the checkout confirmation screen immediately after payment. A copy is also emailed to the address you provide at checkout.",
  },
  {
    question: "What ticket types are available?",
    answer: "Early Bird (free, limited), Regular, and VIP passes are available while supplies last.",
  },
  {
    question: "Having trouble with your ticket or purchase?",
    answer: `Call or WhatsApp ${TICKET_SUPPORT_PHONE} for ticket and checkout support. Have your order ID ready.`,
  },
];

const allFaqs = [...corechella.faqs, ...generalFaqs];

export default function FaqsPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 electric-grid">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold text-white">FAQs</h1>
          <p className="mt-2 text-muted">Everything you need to know about Corechella</p>

          <div className="mt-10 space-y-3">
            {allFaqs.map((faq, i) => (
              <div key={faq.question} className="rounded-2xl electric-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="font-medium text-white">{faq.question}</span>
                  <ChevronDown
                    className={cn("h-5 w-5 shrink-0 text-electric transition-transform", open === i && "rotate-180")}
                  />
                </button>
                {open === i && (
                  <div className="border-t border-electric/10 px-5 pb-5 pt-3 text-sm text-muted">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="mt-8 text-sm text-muted">
            Still have questions?{" "}
            <Link href="/contact" className="text-electric hover:underline">
              Contact us →
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
