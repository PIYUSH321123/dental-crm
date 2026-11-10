import { redirect } from "next/navigation";

export default function AdminSubscriptionRedirect() {
  redirect("/admin/dashboard");
}
