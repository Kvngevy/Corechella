import { redirect } from "next/navigation";
import { CORECHELLA_SLUG } from "@/lib/data";

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === CORECHELLA_SLUG) {
    redirect("/tickets");
  }
  redirect("/tickets");
}
