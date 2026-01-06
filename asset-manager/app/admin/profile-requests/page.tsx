import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { hasEnvVars } from "@/lib/utils";
import { ApproveProfileRequestsContent } from "@/components/approve-profile-requests-content";
import { LoadingSpinner } from "@/components/loading-spinner";

async function ApproveProfileRequestsPage() {
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

  return <ApproveProfileRequestsContent userEmail={user.email as string} />;
}

export default function ApproveProfileRequestsPageRoute() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ApproveProfileRequestsPage />
    </Suspense>
  );
}

