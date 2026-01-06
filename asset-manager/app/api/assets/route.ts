import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendEmail, createAssetCreatedEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getClaims();

    // Check if user is authenticated
    if (!authData?.claims) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";

    let name: string | null = null;
    let category: string | null = null;
    let department: string | null = null;
    let date_purchased: string | null = null;
    let cost: number | null = null;
    let description: string | null = null;
    let status: string | null = null;
    let imageFiles: File[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      name = (formData.get("name") as string | null) ?? null;
      category = (formData.get("category") as string | null) ?? null;
      department = (formData.get("department") as string | null) ?? null;
      date_purchased = (formData.get("date_purchased") as string | null) ?? null;
      description = (formData.get("description") as string | null) ?? null;
      status = (formData.get("status") as string | null) ?? null;

      const costRaw = formData.get("cost") as string | null;
      cost = costRaw !== null && costRaw !== undefined && costRaw !== "" ? Number(costRaw) : null;

      const images = formData.getAll("images");
      imageFiles = images.filter((value): value is File => value instanceof File).slice(0, 4);
    } else {
      const body = await request.json();
      name = body.name ?? null;
      category = body.category ?? null;
      department = body.department ?? null;
      date_purchased = body.date_purchased ?? null;
      cost = body.cost ?? null;
      description = body.description ?? null;
      status = body.status ?? null;
    }

    if (!name) {
      return NextResponse.json({ error: "Asset name is required" }, { status: 400 });
    }
    if (!category) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }
    if (!date_purchased) {
      return NextResponse.json({ error: "Date purchased is required" }, { status: 400 });
    }
    if (cost === undefined || cost === null) {
      return NextResponse.json({ error: "Cost is required" }, { status: 400 });
    }
    if (!department) {
      return NextResponse.json({ error: "Department is required" }, { status: 400 });
    }

    // Upload images (if provided) to Supabase Storage and collect public URLs
    const imageUrls: string[] = [];
    if (imageFiles.length > 0) {
      const bucket = process.env.NEXT_PUBLIC_ASSET_IMAGES_BUCKET || "asset-images";

      for (const [index, file] of imageFiles.entries()) {
        const originalName = file.name || `image-${index + 1}.jpg`;
        const ext = originalName.includes(".") ? originalName.split(".").pop() || "jpg" : "jpg";
        const uniquePart = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        const filePath = `assets/${uniquePart}-${index + 1}.${ext}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Failed to upload asset image:", uploadError);
          continue;
        }

        if (uploadData?.path) {
          const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(uploadData.path);
          if (publicUrlData?.publicUrl) {
            imageUrls.push(publicUrlData.publicUrl);
          }
        }
      }
    }

    // Insert into assets table
    const { data, error } = await supabase
      .from("assets")
      .insert([
        {
          name,
          category,
          department,
          date_purchased: date_purchased || null,
          cost: cost ? parseFloat(cost.toString()) : null,
          description: description || null,
          status: status || "active",
          image_urls: imageUrls.length > 0 ? imageUrls : null,
        },
      ])
      .select()
      .single();

    if (error) {
      // If table doesn't exist, return a helpful error
      if (error.code === "42P01") {
        return NextResponse.json(
          {
            error:
              "Assets table not found. Please create the 'assets' table in your Supabase database.",
            hint:
              "CREATE TABLE assets (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, name TEXT NOT NULL, category TEXT, date_purchased DATE, cost NUMERIC(12, 2), department TEXT, status TEXT DEFAULT 'active', description TEXT, created_at TIMESTAMP DEFAULT NOW());",
          },
          { status: 500 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Send email notification to user about successful asset creation
    const userEmail = authData.claims.email as string;
    if (userEmail) {
      const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/assets/user`
        : "http://localhost:3000/assets/user";

      const emailHtml = createAssetCreatedEmail(
        data.name,
        data.category || "N/A",
        data.department || "N/A",
        data.cost,
        data.date_purchased,
        dashboardUrl
      );

      // Send email asynchronously - don't block the response if email fails
      sendEmail({
        to: userEmail,
        subject: "Asset Created Successfully - Asset Manager",
        html: emailHtml,
      }).catch((emailError) => {
        // Log email error but don't fail the request
        console.error("Failed to send asset creation email:", emailError);
      });
    }

    // Also send the asset (including image URLs) to the Warranty Registration API (eport_2nd_task)
    const warrantyApiUrl =
      process.env.WARRANTY_API_URL || "http://app:8000/api/v1/warranty";
    const warrantyApiKey = process.env.WARRANTY_API_KEY;

    if (warrantyApiUrl && warrantyApiKey) {
      const defaultUserId = Number(process.env.WARRANTY_DEFAULT_USER_ID || "0");
      const defaultUserName =
        process.env.WARRANTY_DEFAULT_USER_NAME || "Asset Manager";

      const warrantyNotesParts: string[] = [];
      if (description) {
        warrantyNotesParts.push(description);
      }
      if (imageUrls.length > 0) {
        warrantyNotesParts.push(
          `Image URLs: ${imageUrls.join(", ")}`
        );
      }

      const warrantyBody = {
        asset_name: data.name as string,
        category: (data.category as string) || "",
        date_purchased: data.date_purchased as string,
        cost: data.cost?.toString() ?? cost?.toString() ?? "0",
        department: (data.department as string) || "",
        status: (data.status as string) || "Active",
        user_id: defaultUserId,
        user_name: defaultUserName,
        notes: warrantyNotesParts.length > 0 ? warrantyNotesParts.join(" | ") : undefined,
        // Send image URLs as a first-class field to the warranty API
        image_urls: imageUrls.length > 0 ? imageUrls : undefined,
      };

      // Fire-and-forget: do not block the main response on this integration
      fetch(warrantyApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": warrantyApiKey,
        },
        body: JSON.stringify(warrantyBody),
      }).catch((warrantyError) => {
        console.error("Failed to send asset to Warranty API:", warrantyError);
      });
    }

    return NextResponse.json({ success: true, asset: data });
  } catch (error) {
    console.error("Error creating asset:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getClaims();

    // Check if user is authenticated
    if (!authData?.claims) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's assets
    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      // If table doesn't exist, return helpful error
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        return NextResponse.json(
          {
            error: "Assets table not found. Please run the database schema setup.",
            hint: "See database/schema.sql or README-DATABASE.md for setup instructions.",
            assets: [],
          },
          { status: 200 } // Return 200 with empty array so UI doesn't break
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ assets: data || [] });
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 }
    );
  }
}

