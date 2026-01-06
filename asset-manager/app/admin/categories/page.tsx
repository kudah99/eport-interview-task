import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout";
import { AssetCategoriesContent } from "@/components/asset-categories-content";
import { hasEnvVars } from "@/lib/utils";
import { LoadingSpinner } from "@/components/loading-spinner";

async function AssetCategoriesPageContent() {
  if (!hasEnvVars) {
    redirect("/auth/login");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const user = data.claims;
  const userRole = (user.user_metadata?.role as string) || "user";
  const isAdmin = userRole === "admin";

  // Redirect non-admins to user dashboard
  if (!isAdmin) {
    redirect("/");
  }

  return (
    <AdminDashboardLayout userEmail={user.email as string}>
      <AssetCategoriesContent />
    </AdminDashboardLayout>
  );
}

export default function AssetCategoriesPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AssetCategoriesPageContent />
    </Suspense>
  );
}

