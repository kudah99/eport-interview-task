import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getClaims();

    // Check if user is authenticated
    if (!authData?.claims) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { asset_id, warranty_period_months, warranty_expiry_date, notes } = await request.json();

    if (!asset_id) {
      return NextResponse.json({ error: "Asset ID is required" }, { status: 400 });
    }

    if (!warranty_expiry_date) {
      return NextResponse.json({ error: "Warranty expiry date is required" }, { status: 400 });
    }

    // Fetch the asset details
    const { data: asset, error: assetError } = await supabase
      .from("assets")
      .select("*")
      .eq("id", asset_id)
      .single();

    if (assetError || !asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // Check if warranty is already registered
    if (asset.status?.toLowerCase() === "warranty registered") {
      return NextResponse.json(
        { error: "Warranty is already registered for this asset" },
        { status: 400 }
      );
    }

    // Get user information
    const userEmail = authData.claims.email as string;
    const userId = authData.claims.sub as string;
    const userName = (authData.claims.user_metadata?.name as string) || userEmail;

    // Convert UUID to integer for API (simple hash function)
    const hashUserId = (uuid: string): number => {
      // Remove dashes and take first 8 characters, convert from hex to int
      const hex = uuid.replace(/-/g, "").substring(0, 8);
      const num = parseInt(hex, 16);
      // Ensure it's a positive number and not too large
      return Math.abs(num % 2147483647) || 1; // Max 32-bit signed integer
    };

    // Prepare warranty registration data for external API
    const warrantyData = {
      asset_name: asset.name,
      category: asset.category || "",
      date_purchased: asset.date_purchased || "",
      cost: asset.cost?.toString() || "0",
      department: asset.department || "",
      status: asset.status || "Active",
      user_id: hashUserId(userId),
      user_name: userName,
      warranty_period_months: warranty_period_months || 24,
      warranty_expiry_date: warranty_expiry_date,
      notes: notes || "",
    };

    // Get URL from environment
    const warrantyApiUrl = process.env.WARRANTY_API_URL || "https://server15.eport.ws/api/v1/warranty";

    // Call the external warranty API
    const warrantyResponse = await fetch(warrantyApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(warrantyData),
    });

    const warrantyResult = await warrantyResponse.json();

    if (!warrantyResponse.ok) {
      return NextResponse.json(
        { error: warrantyResult.error || "Failed to register warranty with external service" },
        { status: warrantyResponse.status }
      );
    }

    // Update asset with warranty information in the database
    const { error: updateError } = await supabase
      .from("assets")
      .update({
        status: "Warranty Registered",
        warranty_period_months: warranty_period_months || 24,
        warranty_expiry_date: warranty_expiry_date,
        warranty_notes: notes || null,
        warranty_registered_at: new Date().toISOString(),
        warranty_registered_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", asset_id);

    if (updateError) {
      console.error("Error updating asset status:", updateError);
      // Warranty was registered externally but status update failed
      // Still return success since the main operation succeeded
    }

    return NextResponse.json({
      success: true,
      message: "Warranty registered successfully",
      warranty: warrantyResult,
    });
  } catch (error) {
    console.error("Error registering warranty:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}

