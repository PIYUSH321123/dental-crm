import db from "@/lib/db";

/**
 * Aggregates platform-wide dashboard metrics and company data for the Super Admin panel.
 */
export async function getSuperAdminDashboardData() {
  try {
    const companies = await db.company.findMany({
      include: {
        users: true,
        patients: true,
        accessConfig: true,
      },
    });

    return {
      success: true,
      companies: companies.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        status: c.status,
        staff: c.users.length,
        patients: c.patients.length.toString(),
        accessConfig: {
          marketing: c.accessConfig?.marketing ?? false,
          appointments: c.accessConfig?.appointments ?? false,
          billing: c.accessConfig?.billing ?? false,
          patientManagement: c.accessConfig?.patientManagement ?? false,
        },
      })),
    };
  } catch (error) {
    console.warn("Database offline, using mockup data for Super Admin Panel:", error);
    return {
      success: false,
      companies: [
        {
          id: "1",
          name: "Active Life Physio",
          slug: "yogaplus",
          status: "Active",
          staff: 142,
          patients: "3.2K",
          accessConfig: { marketing: true, appointments: true, billing: false, patientManagement: true },
        },
        {
          id: "2",
          name: "Wellness Plus",
          slug: "wellness",
          status: "Active",
          staff: 58,
          patients: "1.1K",
          accessConfig: { marketing: true, appointments: false, billing: false, patientManagement: true },
        },
        {
          id: "3",
          name: "SportsRehab Center",
          slug: "sportsrehab",
          status: "Suspended",
          staff: 12,
          patients: "340",
          accessConfig: { marketing: false, appointments: false, billing: false, patientManagement: false },
        },
      ],
    };
  }
}

/**
 * Toggles a specific module access flag for a company.
 */
export async function toggleClinicModule(companyId: string, moduleKey: string, enabled: boolean) {
  await db.companyAccessConfig.upsert({
    where: { companyId },
    update: { [moduleKey]: enabled },
    create: { companyId, [moduleKey]: enabled },
  });
}

/**
 * Updates an organization's active/suspended status.
 */
export async function updateClinicStatus(companyId: string, status: string) {
  await db.company.update({
    where: { id: companyId },
    data: { status },
  });
}
