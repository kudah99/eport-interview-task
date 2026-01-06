import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Department name is required" }, { status: 400 });
    }

    // Insert into departments table
    const { data, error } = await supabase
      .from("departments")
      .insert([{ name, description: description || null }])
      .select()
      .single();

    if (error) {
      // If table doesn't exist, return a helpful error
      if (error.code === "42P01") {
        return NextResponse.json(
          { 
            error: "Departments table not found. Please create the 'departments' table in your Supabase database.",
            hint: "CREATE TABLE departments (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, name TEXT NOT NULL, description TEXT, created_at TIMESTAMP DEFAULT NOW());"
          },
          { status: 500 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, department: data });
  } catch (error) {
    console.error("Error creating department:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}

