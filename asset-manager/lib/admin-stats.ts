import { createClient } from "@/lib/supabase/server";

export interface DashboardStats {
  totalAssets: number;
  totalUsers: number;
  totalCategories: number;
  totalDepartments: number;
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
    created_at: string;
  }>;
}

export async function getDashboardStats(): Promise<DashboardStats | null> {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getClaims();

    // Check if user is authenticated and is admin
    if (!authData?.claims) {
      return null;
    }

    const userRole = (authData.claims.user_metadata?.role as string) || "user";
    if (userRole !== "admin") {
      return null;
    }

    // Fetch all statistics in parallel
    const [
      assetsResult,
      categoriesResult,
      departmentsResult,
      assetsByStatusResult,
      assetsByCategoryResult,
      assetsByDepartmentResult,
      recentAssetsResult,
    ] = await Promise.all([
      // Total assets count and total value
      supabase
        .from("assets")
        .select("id, cost, created_at, status, category, department", { count: "exact" }),
      
      // Total categories count
      supabase
        .from("asset_categories")
        .select("id", { count: "exact" }),
      
      // Total departments count
      supabase
        .from("departments")
        .select("id", { count: "exact" }),
      
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
        .select("id, name, created_at, category, department, cost")
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    // Get user count using admin client
    let userCount = 0;
    try {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (serviceRoleKey) {
        const { createClient: createAdminClient } = await import("@supabase/supabase-js");
        const adminClient = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          serviceRoleKey,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false,
            },
          }
        );
        const { data: usersData } = await adminClient.auth.admin.listUsers();
        userCount = usersData?.users?.length || 0;
      }
    } catch (error) {
      console.error("Error fetching user count:", error);
    }

    // Calculate statistics
    const totalAssets = assetsResult.count || 0;
    const totalCategories = categoriesResult.count || 0;
    const totalDepartments = departmentsResult.count || 0;
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
      created_at: asset.created_at,
    })) || [];

    return {
      totalAssets,
      totalUsers: userCount,
      totalCategories,
      totalDepartments,
      totalValue,
      recentActivity,
      statusCounts,
      categoryCounts,
      departmentCounts,
      recentAssets,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return null;
  }
}

