import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendEmail, createProfileUpdateApprovedEmail, createProfileUpdateRejectedEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getClaims();

    // Check if user is authenticated and is admin
    if (!authData?.claims) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (authData.claims.user_metadata?.role as string) || "user";
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const adminId = authData.claims.sub as string;
    const { request_id, action, admin_notes } = await request.json();

    if (!request_id || !action) {
      return NextResponse.json({ error: "Request ID and action are required" }, { status: 400 });
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Action must be 'approve' or 'reject'" }, { status: 400 });
    }

    // Fetch the request
    const { data: requestData, error: fetchError } = await supabase
      .from("profile_update_requests")
      .select("*")
      .eq("id", request_id)
      .single();

    if (fetchError || !requestData) {
      return NextResponse.json({ error: "Profile update request not found" }, { status: 404 });
    }

    if (requestData.status !== "pending") {
      return NextResponse.json(
        { error: "This request has already been processed" },
        { status: 400 }
      );
    }

    const status = action === "approve" ? "approved" : "rejected";

    // Update the request
    const { data: updatedRequest, error: updateError } = await supabase
      .from("profile_update_requests")
      .update({
        status,
        admin_notes: admin_notes || null,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", request_id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating profile update request:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // If approved, update the user's profile in auth
    if (action === "approve") {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!serviceRoleKey) {
        return NextResponse.json({ error: "Service role key not configured" }, { status: 500 });
      }

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

      // Update user metadata
      const updateData: any = {};
      if (requestData.requested_name) {
        updateData.name = requestData.requested_name;
      }

      // Update email if changed
      if (requestData.requested_email !== requestData.current_email) {
        const { error: emailError } = await adminClient.auth.admin.updateUserById(
          requestData.user_id,
          {
            email: requestData.requested_email,
            user_metadata: updateData,
          }
        );

        if (emailError) {
          console.error("Error updating user email:", emailError);
          // Continue anyway - the request is marked as approved
        }
      } else {
        // Only update metadata if email hasn't changed
        const { error: metadataError } = await adminClient.auth.admin.updateUserById(
          requestData.user_id,
          {
            user_metadata: updateData,
          }
        );

        if (metadataError) {
          console.error("Error updating user metadata:", metadataError);
        }
      }
    }

    // Send email notification to user
    const userEmail = requestData.requested_email;
    const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}`
      : "http://localhost:3000";

    if (action === "approve") {
      const emailHtml = createProfileUpdateApprovedEmail(
        userEmail,
        requestData.requested_name || "N/A",
        dashboardUrl
      );

      sendEmail({
        to: userEmail,
        subject: "Profile Update Approved - Asset Manager",
        html: emailHtml,
      }).catch((emailError) => {
        console.error("Failed to send approval email:", emailError);
      });
    } else {
      const emailHtml = createProfileUpdateRejectedEmail(
        userEmail,
        admin_notes || "No reason provided",
        dashboardUrl
      );

      sendEmail({
        to: userEmail,
        subject: "Profile Update Request Rejected - Asset Manager",
        html: emailHtml,
      }).catch((emailError) => {
        console.error("Failed to send rejection email:", emailError);
      });
    }

    return NextResponse.json({ success: true, request: updatedRequest });
  } catch (error) {
    console.error("Error processing profile update request:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}

