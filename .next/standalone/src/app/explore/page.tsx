import { redirect } from "next/navigation";

/** Legacy route — Corechella is one event, tickets live at /tickets */
export default function ExplorePage() {
  redirect("/tickets");
}
