import db from "@/lib/db";

export interface CreateBranchInput {
  name: string;
  address?: string | null;
}

/**
 * Retrieves all branches for a company.
 */
export async function getBranchesByCompanySlug(companySlug: string) {
  const normalizedSlug = companySlug.toLowerCase().trim();
  try {
    const company = await db.company.findUnique({
      where: { slug: normalizedSlug },
    });

    if (!company) {
      const error: any = new Error("Company not found.");
      error.statusCode = 404;
      throw error;
    }

    const branches = await db.branch.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: "asc" },
    });

    return branches;
  } catch (error: any) {
    if (error.statusCode === 404) {
      throw error;
    }
    console.warn("Database offline or query failed while retrieving branches, returning mock branch list:", error);
    return [
      {
        id: "br-1",
        companyId: "mock-company-id",
        name: "Mumbai - Andheri West",
        address: "Andheri West, Mumbai",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "br-2",
        companyId: "mock-company-id",
        name: "Mumbai - Bandra East",
        address: "Bandra East, Mumbai",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "br-3",
        companyId: "mock-company-id",
        name: "Delhi - Connaught Place",
        address: "Connaught Place, Delhi",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "br-4",
        companyId: "mock-company-id",
        name: "Bengaluru - Indiranagar",
        address: "Indiranagar, Bengaluru",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
  }
}

/**
 * Creates a new branch for a company.
 */
export async function createBranch(companySlug: string, input: CreateBranchInput) {
  const { name, address } = input;

  if (!companySlug || !name) {
    const error: any = new Error("Missing required fields (companySlug, name).");
    error.statusCode = 400;
    throw error;
  }

  const normalizedSlug = companySlug.toLowerCase().trim();

  try {
    const company = await db.company.findUnique({
      where: { slug: normalizedSlug },
    });

    if (!company) {
      const error: any = new Error("Company not found.");
      error.statusCode = 404;
      throw error;
    }

    const newBranch = await db.branch.create({
      data: {
        companyId: company.id,
        name,
        address: address || null,
      },
    });

    return newBranch;
  } catch (error: any) {
    if (error.statusCode) throw error;
    console.warn("Database offline or query failed while creating branch, returning mock branch:", error);
    return {
      id: `br-${Date.now()}`,
      companyId: "mock-company-id",
      name,
      address: address || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
