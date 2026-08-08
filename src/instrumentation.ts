export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { bootstrapSuperAdmin } = await import("@/lib/bootstrap");
    await bootstrapSuperAdmin();
  }
}
