import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  DENTFLOW_SESSION_COOKIE,
  getDefaultRedirectForSession,
  verifyDentflowSession,
} from "@/lib/dentflow-session";

export default async function AppIndexPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(DENTFLOW_SESSION_COOKIE)?.value;
  const session = await verifyDentflowSession(token);
  if (!session) {
    redirect("/login?next=/app/today");
  }
  redirect(getDefaultRedirectForSession(session));
}

