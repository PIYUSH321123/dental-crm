import { redirect } from "next/navigation";

export default async function LegacyLeadManagementRedirect({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company } = await params;
  redirect(`/c/${company}/dashboard/recovery`);
}
