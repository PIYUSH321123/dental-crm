import { redirect } from "next/navigation";

export default async function LegacyBillingPaymentsRedirect({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company } = await params;
  redirect(`/c/${company}/dashboard/billing`);
}
