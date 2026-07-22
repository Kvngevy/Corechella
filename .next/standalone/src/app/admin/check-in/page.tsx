"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ScanLine, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCameraScanner } from "@/components/admin/qr-camera-scanner";
import { usePlatform } from "@/lib/store/platform-store";
import { getAttendeeTicketCode } from "@/lib/ticket-codes";
import { cn } from "@/lib/utils";

type ScanState = "idle" | "valid" | "used" | "invalid" | "pending_payment";

function normalizeManualInput(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export default function CheckInPage() {
  const { attendees, checkInByQr } = usePlatform();
  const [state, setState] = useState<ScanState>("idle");
  const [qrInput, setQrInput] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [scanned, setScanned] = useState<(typeof attendees)[0] | null>(null);
  const [scannedOrderId, setScannedOrderId] = useState<string | null>(null);
  const [scannedCheckInTime, setScannedCheckInTime] = useState<string | null>(null);
  const [scannedTicketCode, setScannedTicketCode] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [cameraPaused, setCameraPaused] = useState(false);
  const processingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const runScan = useCallback(
    async (code: string) => {
      const trimmed = code.trim();
      if (!trimmed || processingRef.current) return;

      processingRef.current = true;
      setProcessing(true);
      setQrInput(trimmed);
      setStatusMessage("");

      try {
        const result = await checkInByQr(trimmed);
        setScanned(result.attendee ?? null);
        setScannedOrderId(result.order?.id ?? result.attendee?.orderId ?? null);
        setScannedTicketCode(result.ticketCode ?? null);
        setScannedCheckInTime(result.checkInTime ?? result.attendee?.checkInTime ?? null);
        setState(result.status);
        setStatusMessage(result.message ?? "");

        if (result.status === "valid") {
          setCameraPaused(true);
          window.setTimeout(() => {
            setCameraPaused(false);
            setState("idle");
            setScanned(null);
            setScannedOrderId(null);
            setScannedTicketCode(null);
            setScannedCheckInTime(null);
            setQrInput("");
            setStatusMessage("");
            inputRef.current?.focus();
          }, 2800);
        }
      } finally {
        processingRef.current = false;
        setProcessing(false);
      }
    },
    [checkInByQr]
  );

  const reset = () => {
    setState("idle");
    setScanned(null);
    setScannedOrderId(null);
    setScannedTicketCode(null);
    setScannedCheckInTime(null);
    setQrInput("");
    setStatusMessage("");
    setCameraPaused(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sampleValid = attendees.find((a) => a.status === "not-checked-in");
  const sampleUsed = attendees.find((a) => a.status === "checked-in");

  return (
    <div className="p-6 lg:p-10">
      <h1 className="font-heading text-3xl font-bold text-white">Gate Check-in</h1>
      <p className="mt-1 text-muted">
        Scan the QR on the ticket, or type the ticket number shown on the ticket (e.g. CC4-000001-01)
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl electric-card p-6">
          <QrCameraScanner onScan={runScan} paused={cameraPaused || processing} />

          <div className="mt-6 max-w-lg mx-auto">
            <Label className="mb-2 block">Type ticket number</Label>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void runScan(qrInput);
                  }
                }}
                onPaste={(e) => {
                  const pasted = e.clipboardData.getData("text");
                  if (pasted) {
                    e.preventDefault();
                    const normalized = normalizeManualInput(pasted);
                    setQrInput(normalized);
                    void runScan(normalized);
                  }
                }}
                placeholder="CC4-000001-01"
                className="font-mono text-base tracking-wide"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              <Button
                onClick={() => void runScan(qrInput)}
                disabled={!qrInput.trim() || processing}
                className="shrink-0"
              >
                {processing ? "Checking..." : "Check In"}
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted">
              Tip: single-ticket orders can use the order ID only (e.g. CC4-000001). Press Enter to check in.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {sampleValid && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => void runScan(getAttendeeTicketCode(sampleValid))}
                disabled={processing}
              >
                Test Valid Ticket
              </Button>
            )}
            {sampleUsed && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => void runScan(getAttendeeTicketCode(sampleUsed))}
                disabled={processing}
              >
                Test Used Ticket
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={reset}>
              Reset
            </Button>
          </div>
        </div>

        <div className="rounded-2xl electric-card p-6">
          <h2 className="font-heading text-lg font-bold text-white">Ticket Details</h2>

          {state === "idle" ? (
            <div className="mt-8 text-center text-muted">
              <ScanLine className="mx-auto h-12 w-12 opacity-30" />
              <p className="mt-4 text-sm">Waiting for scan...</p>
              <p className="mt-2 text-xs">Allow camera access when prompted</p>
            </div>
          ) : (
            <div className="mt-6">
              <div
                className={cn(
                  "flex items-center gap-3 rounded-xl p-4",
                  state === "valid" && "bg-green-500/10 border border-green-500/30",
                  state === "used" && "bg-orange-500/10 border border-orange-500/30",
                  state === "invalid" && "bg-red-500/10 border border-red-500/30",
                  state === "pending_payment" && "bg-yellow-500/10 border border-yellow-500/30"
                )}
              >
                {state === "valid" && <CheckCircle className="h-6 w-6 text-green-400 shrink-0" />}
                {state === "used" && <AlertCircle className="h-6 w-6 text-orange-400 shrink-0" />}
                {state === "invalid" && <XCircle className="h-6 w-6 text-red-400 shrink-0" />}
                {state === "pending_payment" && <AlertCircle className="h-6 w-6 text-yellow-400 shrink-0" />}
                <div>
                  <p className="font-medium text-white">
                    {state === "valid" && "✅ VALID ENTRY"}
                    {state === "used" && "❌ TICKET ALREADY USED"}
                    {state === "invalid" && "❌ INVALID TICKET"}
                    {state === "pending_payment" && "Payment Pending"}
                  </p>
                  <p className="text-xs text-muted">
                    {state === "valid" && "Checked in successfully"}
                    {state === "used" &&
                      (scannedCheckInTime
                        ? `Previously scanned at ${new Date(scannedCheckInTime).toLocaleString()}`
                        : "This ticket was already scanned")}
                    {state === "invalid" &&
                      (statusMessage || "Ticket number not recognized — check the code on the ticket")}
                    {state === "pending_payment" && "Order payment is not completed yet"}
                  </p>
                </div>
              </div>

              {scanned && (
                <div className="mt-6 space-y-4">
                  <div>
                    <p className="text-xs text-muted">Ticket Number</p>
                    <p className="font-mono text-lg font-semibold text-gold">
                      {scannedTicketCode ?? getAttendeeTicketCode(scanned)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Order</p>
                    <p className="font-mono text-sm font-semibold text-white">{scannedOrderId ?? scanned.orderId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Attendee</p>
                    <p className="text-white font-medium">{scanned.name}</p>
                  </div>
                  {state === "valid" && scannedCheckInTime && (
                    <div>
                      <p className="text-xs text-muted">Check-In Time</p>
                      <p className="text-sm text-white">{new Date(scannedCheckInTime).toLocaleString()}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted">Ticket Type</p>
                    <Badge variant="default">{scanned.ticketType}</Badge>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {state === "valid" && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-2xl bg-green-600 px-8 py-4 text-white shadow-lg z-50">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Checked In Successfully</span>
        </div>
      )}
    </div>
  );
}
