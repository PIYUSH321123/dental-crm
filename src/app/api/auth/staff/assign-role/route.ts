import { NextResponse } from "next/server";
import { getAdminSession, getUserSession } from "@/lib/auth-server";
import { assignStaffRole } from "@/services/auth.service";

export async function POST(request: Request) {
  try {
    const { targetUserId, newRole } = await request.json();

    if (!targetUserId || !newRole) {
      return NextResponse.json(
        { error: "Target user ID and new role are required" },
        { status: 400 }
      );
    }

    if (newRole !== "COMPANY_ADMIN" && newRole !== "STAFF") {
      return NextResponse.json(
        { error: "Invalid role. Role must be COMPANY_ADMIN or STAFF" },
        { status: 400 }
      );
    }

    const adminSession = await getAdminSession();
    const userSession = await getUserSession();

    const updatedUser = await assignStaffRole({
      targetUserId,
      newRole,
      actorAdminSession: adminSession,
      actorUserSession: userSession,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully assigned role "${newRole}" to user ${updatedUser.name}`,
      user: updatedUser,
    });
  } catch (error: any) {
    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error.message?.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error.message === "Target user not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error("Error in staff assign-role route:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
