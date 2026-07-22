"use client";

import { PlatformProvider } from "@/lib/store/platform-store";

export function Providers({ children }: { children: React.ReactNode }) {
  return <PlatformProvider>{children}</PlatformProvider>;
}
