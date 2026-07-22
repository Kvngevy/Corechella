"use client";

import { useState, type RefObject } from "react";
import { FileImage, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadTicketAsPdf, downloadTicketAsPng } from "@/lib/ticket-export";

interface TicketDownloadActionsProps {
  ticketRef: RefObject<HTMLDivElement | null>;
  filenameBase: string;
}

export function TicketDownloadActions({ ticketRef, filenameBase }: TicketDownloadActionsProps) {
  const [loading, setLoading] = useState<"png" | "pdf" | null>(null);
  const [error, setError] = useState("");

  const handlePng = async () => {
    const el = ticketRef.current;
    if (!el) {
      setError("Ticket not ready. Refresh and try again.");
      return;
    }
    setLoading("png");
    setError("");
    try {
      await downloadTicketAsPng(el, `${filenameBase}.png`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PNG download failed.");
    } finally {
      setLoading(null);
    }
  };

  const handlePdf = async () => {
    const el = ticketRef.current;
    if (!el) {
      setError("Ticket not ready. Refresh and try again.");
      return;
    }
    setLoading("pdf");
    setError("");
    try {
      await downloadTicketAsPdf(el, `${filenameBase}.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF download failed.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePng}
          disabled={loading !== null}
          className="gap-2"
        >
          <FileImage className="h-4 w-4" />
          {loading === "png" ? "Saving PNG..." : "Download PNG"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePdf}
          disabled={loading !== null}
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          {loading === "pdf" ? "Saving PDF..." : "Download PDF"}
        </Button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
