import { createClient } from "@/lib/supabase/server";

export interface UserDashboardStats {
  totalAssets: number;
  totalValue: number;
  recentActivity: number;
  statusCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  departmentCounts: Record<string, number>;
  recentAssets: Array<{
    id: string;
    name: string;
    category: string | null;
    department: string | null;
    cost: number | null;
    status: string | null;
    created_at: string;
  }>;
}

export async function getUserDashboardStats(): Promise<UserDashboardStats | null> {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getClaims();

    // Check if user is authenticated
    if (!authData?.claims) {
      return null;
    }

    // Fetch all user's assets in parallel
    const [
      assetsResult,
      assetsByStatusResult,
      assetsByCategoryResult,
      assetsByDepartmentResult,
      recentAssetsResult,
    ] = await Promise.all([
      // Total assets count and total value
      supabase
        .from("assets")
        .select("id, cost, created_at, status, category, department", { count: "exact" }),
      
      // Assets by status
      supabase
        .from("assets")
        .select("status"),
      
      // Assets by category
      supabase
        .from("assets")
        .select("category"),
      
      // Assets by department
      supabase
        .from("assets")
        .select("department"),
      
      // Recent assets (last 24 hours)
      supabase
        .from("assets")
        .select("id, name, created_at, category, department, cost, status")
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    // Calculate statistics
    const totalAssets = assetsResult.count || 0;
    const recentActivity = recentAssetsResult.data?.length || 0;

    // Calculate total asset value
    const totalValue = assetsResult.data?.reduce((sum, asset) => {
      return sum + (asset.cost ? parseFloat(asset.cost.toString()) : 0);
    }, 0) || 0;

    // Calculate assets by status
    const statusCounts: Record<string, number> = {};
    assetsByStatusResult.data?.forEach((asset) => {
      const status = asset.status || "unknown";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    // Calculate assets by category
    const categoryCounts: Record<string, number> = {};
    assetsByCategoryResult.data?.forEach((asset) => {
      const category = asset.category || "Uncategorized";
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    // Calculate assets by department
    const departmentCounts: Record<string, number> = {};
    assetsByDepartmentResult.data?.forEach((asset) => {
      const department = asset.department || "Unassigned";
      departmentCounts[department] = (departmentCounts[department] || 0) + 1;
    });

    // Format recent assets
    const recentAssets = recentAssetsResult.data?.map((asset) => ({
      id: asset.id,
      name: asset.name,
      category: asset.category,
      department: asset.department,
      cost: asset.cost,
      status: asset.status,
      created_at: asset.created_at,
    })) || [];

    return {
      totalAssets,
      totalValue,
      recentActivity,
      statusCounts,
      categoryCounts,
      departmentCounts,
      recentAssets,
    };
  } catch (error) {
    console.error("Error fetching user dashboard stats:", error);
    return null;
  }
}

