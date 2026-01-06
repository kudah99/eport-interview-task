import * as XLSX from "xlsx";

export interface AssetExportData {
  name: string;
  category?: string;
  department?: string;
  date_purchased?: string;
  cost?: number | string;
  status?: string;
  description?: string;
  created_at?: string;
}

/**
 * Export assets to Excel file
 */
export function exportToExcel(assets: AssetExportData[], filename: string = "assets") {
  try {
    // Prepare data for Excel
    const excelData = assets.map((asset) => ({
      Name: asset.name || "",
      Category: asset.category || "",
      Department: asset.department || "",
      "Date Purchased": asset.date_purchased
        ? new Date(asset.date_purchased).toLocaleDateString()
        : "",
      Cost: asset.cost
        ? typeof asset.cost === "number"
          ? asset.cost
          : parseFloat(asset.cost.toString()) || 0
        : 0,
      Status: asset.status || "active",
      Description: asset.description || "",
      "Created At": asset.created_at
        ? new Date(asset.created_at).toLocaleString()
        : "",
    }));

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Assets");

    // Set column widths
    const columnWidths = [
      { wch: 25 }, // Name
      { wch: 15 }, // Category
      { wch: 15 }, // Department
      { wch: 15 }, // Date Purchased
      { wch: 12 }, // Cost
      { wch: 12 }, // Status
      { wch: 30 }, // Description
      { wch: 20 }, // Created At
    ];
    worksheet["!cols"] = columnWidths;

    // Generate Excel file and download
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Export assets to CSV file
 */
export function exportToCSV(assets: AssetExportData[], filename: string = "assets") {
  try {
    // Prepare CSV headers
    const headers = [
      "Name",
      "Category",
      "Department",
      "Date Purchased",
      "Cost",
      "Status",
      "Description",
      "Created At",
    ];

    // Prepare CSV rows
    const rows = assets.map((asset) => [
      asset.name || "",
      asset.category || "",
      asset.department || "",
      asset.date_purchased
        ? new Date(asset.date_purchased).toLocaleDateString()
        : "",
      asset.cost
        ? typeof asset.cost === "number"
          ? asset.cost.toString()
          : asset.cost.toString()
        : "0",
      asset.status || "active",
      (asset.description || "").replace(/"/g, '""'), // Escape quotes in CSV
      asset.created_at
        ? new Date(asset.created_at).toLocaleString()
        : "",
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.map((h) => `"${h}"`).join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error("Error exporting to CSV:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

