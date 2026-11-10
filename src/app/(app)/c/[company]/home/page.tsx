import { redirect } from "next/navigation";

export default async function LegacyHomeRedirect({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company } = await params;
  redirect(`/c/${company}/dashboard`);
}
