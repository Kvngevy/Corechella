"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QrCameraScannerProps {
  onScan: (code: string) => void;
  paused?: boolean;
}

export function QrCameraScanner({ onScan, paused = false }: QrCameraScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<{ stop: () => Promise<void>; isScanning: boolean } | null>(null);
  const onScanRef = useRef(onScan);
  const lastScanRef = useRef({ code: "", at: 0 });
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [active, setActive] = useState(false);

  onScanRef.current = onScan;

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    if (scanner?.isScanning) {
      await scanner.stop().catch(() => {});
    }
    scannerRef.current = null;
  };

  const startScanner = async () => {
    if (!containerRef.current || paused) return;

    setError(null);
    setStarting(true);
    setActive(true);

    await stopScanner();

    const mountId = "corechella-qr-reader";
    containerRef.current.innerHTML = `<div id="${mountId}" style="width:100%;min-height:280px"></div>`;

    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      const scanner = new Html5Qrcode(mountId, { verbose: false });
      scannerRef.current = scanner;

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras.length) {
        throw new Error("No camera found on this device.");
      }

      const backCamera = cameras.find((cam) =>
        /back|rear|environment/i.test(cam.label)
      );
      const cameraId = backCamera?.id ?? cameras[cameras.length - 1].id;

      await scanner.start(
        cameraId,
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const size = Math.min(viewfinderWidth, viewfinderHeight, 320) * 0.9;
            return { width: size, height: size };
          },
          aspectRatio: 1,
          disableFlip: false,
        },
        (decodedText) => {
          const now = Date.now();
          const trimmed = decodedText.trim();
          if (!trimmed) return;

          const last = lastScanRef.current;
          if (trimmed === last.code && now - last.at < 2500) return;

          lastScanRef.current = { code: trimmed, at: now };
          onScanRef.current(trimmed);
        },
        () => {
          /* per-frame decode misses are expected */
        }
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not start camera.";
      if (/NotAllowed|Permission/i.test(message)) {
        setError(
          "Camera access was blocked. Allow camera permission for this site, then tap Start Camera."
        );
      } else {
        setError(message);
      }
      setActive(false);
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    if (!paused) {
      void startScanner();
    } else {
      void stopScanner();
      setActive(false);
    }

    return () => {
      void stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  return (
    <div className="space-y-3">
      <div className="relative aspect-square max-w-md mx-auto overflow-hidden rounded-2xl border-2 border-electric/30 bg-black">
        <div
          ref={containerRef}
          className="absolute inset-0 [&_video]:!h-full [&_video]:!w-full [&_video]:object-cover [&_#qr-shaded-region]:border-electric/40"
        />

        {!active && !starting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/90 p-6 text-center">
            <CameraOff className="h-10 w-10 text-muted" />
            {error ? (
              <p className="text-sm text-red-300">{error}</p>
            ) : (
              <p className="text-sm text-muted">Camera is off</p>
            )}
            <Button size="sm" onClick={() => void startScanner()} className="gap-2">
              <Camera className="h-4 w-4" />
              Start Camera
            </Button>
          </div>
        )}

        {starting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <p className="text-sm text-muted">Starting camera...</p>
          </div>
        )}

        {active && !starting && (
          <>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative h-56 w-56">
                <div className="absolute top-0 left-0 h-10 w-10 border-t-2 border-l-2 border-electric" />
                <div className="absolute top-0 right-0 h-10 w-10 border-t-2 border-r-2 border-electric" />
                <div className="absolute bottom-0 left-0 h-10 w-10 border-b-2 border-l-2 border-electric" />
                <div className="absolute bottom-0 right-0 h-10 w-10 border-b-2 border-r-2 border-electric" />
              </div>
            </div>
            <div className="pointer-events-none absolute inset-x-8 top-1/2 h-0.5 bg-electric/50 animate-pulse" />
          </>
        )}
      </div>

      {active && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              void stopScanner();
              setActive(false);
            }}
          >
            <CameraOff className="h-4 w-4" />
            Stop Camera
          </Button>
        </div>
      )}
    </div>
  );
}
