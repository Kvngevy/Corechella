import { AdminLayoutClient } from "@/components/layout/admin-layout-client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
