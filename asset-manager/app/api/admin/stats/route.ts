import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/admin-stats";

export async function GET() {
  try {
    const stats = await getDashboardStats();
    
    if (!stats) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}

