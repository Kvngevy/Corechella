"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";

/** Legacy redirect — Wavy success now lands on /checkout directly. */
function PaymentSuccessRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams();
    const orderId =
      searchParams.get("reference") ??
      searchParams.get("merchant_reference") ??
      searchParams.get("order");
    const txRef = searchParams.get("tx_ref");
    const status = searchParams.get("status");

    if (orderId) params.set("order", orderId);
    if (txRef) params.set("tx_ref", txRef);
    if (status) params.set("status", status);

    router.replace(`/checkout?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16 electric-grid">
      <div className="w-full max-w-lg rounded-2xl electric-card p-8 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-electric" />
        <h1 className="mt-6 font-heading text-2xl font-bold text-white">Loading Your Tickets</h1>
        <p className="mt-2 text-sm text-muted">Payment received — preparing your tickets...</p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <>
      <Navbar />
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-electric" />
          </div>
        }
      >
        <PaymentSuccessRedirect />
      </Suspense>
    </>
  );
}
