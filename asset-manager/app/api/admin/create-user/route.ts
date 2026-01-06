import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendEmail, createUserCredentialsEmail } from "@/lib/email";

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

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Use service role key to create user
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

    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        role: "user", // Set default role as "user"
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Send email with credentials to the user
    const loginUrl = process.env.NEXT_PUBLIC_APP_URL 
      ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`
      : "http://localhost:3000/auth/login";
    
    const emailHtml = createUserCredentialsEmail(email, password, loginUrl);
    const emailResult = await sendEmail({
      to: email,
      subject: "Your Asset Manager Account Credentials",
      html: emailHtml,
    });

    // Log email result but don't fail user creation if email fails
    if (!emailResult.success) {
      console.warn("⚠️  User created but email failed to send:", emailResult.error);
    }

    return NextResponse.json({ 
      success: true, 
      user: { 
        id: data.user.id, 
        email: data.user.email 
      },
      emailSent: emailResult.success,
      emailError: emailResult.success ? undefined : emailResult.error
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}

