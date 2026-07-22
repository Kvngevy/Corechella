"use client";

import Image from "next/image";

interface QrDisplayProps {
  data: string;
  size?: number;
  alt?: string;
}

export function QrDisplay({ data, size = 96, alt = "Ticket QR code" }: QrDisplayProps) {
  const src = `/api/qr?data=${encodeURIComponent(data)}`;

  return (
    <div
      className="flex items-center justify-center rounded-xl border border-electric/20 bg-white p-2"
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        width={size - 16}
        height={size - 16}
        className="h-full w-full object-contain"
        unoptimized
      />
    </div>
  );
}
