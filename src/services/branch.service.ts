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
}
