import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendEmail, createProfileUpdateRequestEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getClaims();

    // Check if user is authenticated
    if (!authData?.claims) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = authData.claims.sub as string;
    const currentEmail = authData.claims.email as string;
    const currentName = (authData.claims.user_metadata?.name as string) || "";

    const { requested_name, requested_email } = await request.json();

    if (!requested_email) {
      return NextResponse.json({ error: "Requested email is required" }, { status: 400 });
    }

    // Check if email is different from current
    if (requested_email === currentEmail && requested_name === currentName) {
      return NextResponse.json(
        { error: "No changes detected. Please provide different name or email." },
        { status: 400 }
      );
    }

    // Check if user has a pending request
    const { data: existingRequest } = await supabase
      .from("profile_update_requests")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "pending")
      .single();

    if (existingRequest) {
      return NextResponse.json(
        { error: "You already have a pending profile update request. Please wait for admin approval." },
        { status: 400 }
      );
    }

    // Insert profile update request
    const { data, error } = await supabase
      .from("profile_update_requests")
      .insert([
        {
          user_id: userId,
          current_name: currentName || null,
          requested_name: requested_name || null,
          current_email: currentEmail,
          requested_email: requested_email,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating profile update request:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Get admin emails to notify using service role
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let adminEmails: string[] = [];
    
    if (serviceRoleKey) {
      try {
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

        const { data: adminUsers } = await adminClient.auth.admin.listUsers();
        adminEmails = adminUsers?.users
          .filter((user) => user.user_metadata?.role === "admin")
          .map((user) => user.email)
          .filter((email): email is string => !!email) || [];
      } catch (error) {
        console.error("Error fetching admin users:", error);
        // Continue without admin emails - request is still created
      }
    }

    // Send email notification to all admins
    const adminDashboardUrl = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/admin/profile-requests`
      : "http://localhost:3000/admin/profile-requests";

    const emailHtml = createProfileUpdateRequestEmail(
      currentEmail,
      currentName || "N/A",
      requested_email,
      requested_name || "N/A",
      adminDashboardUrl
    );

    // Send emails to all admins
    const emailPromises = adminEmails.map((adminEmail) =>
      sendEmail({
        to: adminEmail,
        subject: "New Profile Update Request - Asset Manager",
        html: emailHtml,
      })
    );

    Promise.all(emailPromises).catch((emailError) => {
      console.error("Failed to send profile update request emails:", emailError);
    });

    return NextResponse.json({ success: true, request: data });
  } catch (error) {
    console.error("Error creating profile update request:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}

