"use client";

import { useState } from "react";
import { UserDashboardLayout } from "@/components/user-dashboard-layout";
import { Card, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { AddAssetForm } from "@/components/add-asset-form";

export function AddAssetPageContent({ userEmail }: { userEmail: string }) {
  const router = useRouter();

  const handleAssetAdded = () => {
    router.push("/assets/user");
  };

  return (
    <UserDashboardLayout userEmail={userEmail}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
              Add New Asset
            </h1>
            <p style={{ color: "rgba(0, 0, 0, 0.45)" }}>
              Create a new asset in the system
            </p>
          </div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push("/assets/user")}
          >
            Back to Assets
          </Button>
        </div>
      </div>

      <Card>
        <p style={{ color: "rgba(0, 0, 0, 0.45)", marginBottom: 24 }}>
          Fill in the form below to add a new asset. Select a category and department if available.
        </p>
        <AddAssetForm onSuccess={handleAssetAdded} />
      </Card>
    </UserDashboardLayout>
  );
}

