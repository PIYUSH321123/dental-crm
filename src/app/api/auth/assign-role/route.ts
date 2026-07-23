import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getAdminSession, getUserSession } from "@/lib/auth-server";

export async function POST(request: Request) {
  try {
    const { targetUserId, newRole } = await request.json();

    if (!targetUserId || !newRole) {
      return NextResponse.json(
        { error: "Target user ID and new role are required" },
        { status: 400 }
      );
    }

    // Validate new role
    if (newRole !== "COMPANY_ADMIN" && newRole !== "STAFF") {
      return NextResponse.json(
        { error: "Invalid role. Role must be COMPANY_ADMIN or STAFF" },
        { status: 400 }
      );
    }

    // 1. Authorize: Check if Super Admin or Company Admin
    const adminSession = await getAdminSession();
    const userSession = await getUserSession();

    let authorized = false;
    let actingCompanyId: string | null = null;

    if (adminSession && adminSession.role === "SUPER_ADMIN") {
      authorized = true;
    } else if (userSession && userSession.role === "COMPANY_ADMIN") {
      authorized = true;
      actingCompanyId = userSession.companyId;
    }

    if (!authorized) {
      return NextResponse.json(
        { error: "Unauthorized: Administrator privileges required" },
        { status: 403 }
      );
    }

    // 2. Lookup the target user
    const targetUser = await db.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }

    // 3. If acting user is Company Admin, verify the target user belongs to the same company
    if (actingCompanyId && targetUser.companyId !== actingCompanyId) {
      return NextResponse.json(
        { error: "Forbidden: Cannot assign role to a user of a different company" },
        { status: 403 }
      );
    }

    // 4. Update the user's role
    const updatedUser = await db.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully assigned role "${newRole}" to user ${updatedUser.name}`,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Error in assign-role:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
