"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TicketSupportLine } from "@/components/tickets/ticket-support-line";

function PaymentCancelledContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16 electric-grid">
      <div className="w-full max-w-lg rounded-2xl electric-card p-8 text-center">
        <XCircle className="mx-auto h-12 w-12 text-orange-400" />
        <h1 className="mt-6 font-heading text-2xl font-bold text-white">Payment Cancelled</h1>
        <p className="mt-2 text-sm text-muted">
          Your payment was not completed. No charge was made.
          {reference ? (
            <>
              {" "}
              Order reference: <span className="font-mono text-electric">{reference}</span>
            </>
          ) : null}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/checkout" className={cn(buttonVariants())}>
            Return to Checkout
          </Link>
          <Link href="/tickets" className={cn(buttonVariants({ variant: "outline" }))}>
            Browse Tickets
          </Link>
        </div>
        <TicketSupportLine className="mt-6 text-xs" compact />
      </div>
    </div>
  );
}

export default function PaymentCancelledPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={null}>
        <PaymentCancelledContent />
      </Suspense>
    </>
  );
}
