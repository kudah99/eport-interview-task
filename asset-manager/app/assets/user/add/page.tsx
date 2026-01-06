import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { hasEnvVars } from "@/lib/utils";
import { AddAssetPageContent } from "@/components/add-asset-page-content";
import { LoadingSpinner } from "@/components/loading-spinner";

async function AddAssetPage() {
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

  // Redirect admins to admin dashboard
  if (isAdmin) {
    redirect("/admin");
  }

  return <AddAssetPageContent userEmail={user.email as string} />;
}

export default function AddAssetPageRoute() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AddAssetPage />
    </Suspense>
  );
}

