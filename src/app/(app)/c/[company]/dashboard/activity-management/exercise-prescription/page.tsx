import { redirect } from "next/navigation";

export default async function LegacyExerciseRxRedirect({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company } = await params;
  redirect(`/c/${company}/dashboard/prescriptions`);
}
