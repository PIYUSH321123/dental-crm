import db from "@/lib/db";

export interface CreateCampaignData {
  id?: string;
  campaign_name: string;
  source: string;
  budget: number;
  status: string;
  start_date: string;
  end_date?: string | null;
  target_condition?: string;
  landing_page_url?: string;
  assigned_staff_id?: string;
  branch_id: string;
  notes?: string;
}

/**
 * Retrieves all campaigns for a given company slug.
 */
export async function getCampaignsByCompanySlug(companySlug: string) {
  const normalizedSlug = companySlug.toLowerCase().trim();
  const company = await db.company.findUnique({
    where: { slug: normalizedSlug },
  });

  if (!company) {
    throw new Error("Company not found");
  }

  const dbCampaigns = await db.campaign.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "desc" },
  });

  return dbCampaigns.map((c) => ({
    id: c.id,
    campaign_name: c.campaignName,
    source: c.source as any,
    budget: c.budget,
    leads: c.leadsCount,
    converted: c.convertedCount,
    revenue: c.revenue,
    status: c.status as any,
    start_date: c.startDate.toISOString().split("T")[0],
    end_date: c.endDate ? c.endDate.toISOString().split("T")[0] : null,
    target_condition: c.targetCondition || undefined,
    landing_page_url: c.landingPageUrl || undefined,
    assigned_staff_id: c.assignedStaffId || undefined,
    branch_id: c.branchId,
    notes: c.notes || undefined,
    created_by: c.createdByUserId || "usr-2",
    created_at: c.createdAt.toISOString(),
    updated_at: c.updatedAt.toISOString(),
  }));
}

/**
 * Creates a campaign in the database for a company.
 */
export async function createCampaign(companySlug: string, data: CreateCampaignData) {
  const normalizedSlug = companySlug.toLowerCase().trim();
  const company = await db.company.findUnique({
    where: { slug: normalizedSlug },
  });

  if (!company) {
    throw new Error("Company not found");
  }

  const campaignId = data.id || `cmp-${Date.now()}`;

  const campaign = await db.campaign.create({
    data: {
      id: campaignId,
      companyId: company.id,
      campaignName: data.campaign_name,
      source: data.source,
      budget: data.budget,
      status: data.status,
      startDate: new Date(data.start_date),
      endDate: data.end_date ? new Date(data.end_date) : null,
      targetCondition: data.target_condition || null,
      landingPageUrl: data.landing_page_url || null,
      assignedStaffId: data.assigned_staff_id || null,
      branchId: data.branch_id,
      notes: data.notes || null,
      createdByUserId: "usr-2",
    },
  });

  return campaign;
}
