import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    if (!id) {
      return NextResponse.json({ error: "Department ID is required" }, { status: 400 });
    }

    // Delete department from departments table
    const { error } = await supabase
      .from("departments")
      .delete()
      .eq("id", id);

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json(
          { 
            error: "Departments table not found. Please create the 'departments' table in your Supabase database.",
          },
          { status: 500 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting department:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    if (!id) {
      return NextResponse.json({ error: "Department ID is required" }, { status: 400 });
    }

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Department name is required" }, { status: 400 });
    }

    // Update department in departments table
    const { data, error } = await supabase
      .from("departments")
      .update({
        name,
        description: description || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json(
          { 
            error: "Departments table not found. Please create the 'departments' table in your Supabase database.",
          },
          { status: 500 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, department: data });
  } catch (error) {
    console.error("Error updating department:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}
