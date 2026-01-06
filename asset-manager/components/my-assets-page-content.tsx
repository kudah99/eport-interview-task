"use client";

import { UserDashboardLayout } from "@/components/user-dashboard-layout";
import { Card, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { MyAssetsList } from "@/components/my-assets-list";

export function MyAssetsPageContent({ userEmail }: { userEmail: string }) {
  const router = useRouter();

  return (
    <UserDashboardLayout userEmail={userEmail} activeKey="2">
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
              My Assets
            </h1>
            <p style={{ color: "rgba(0, 0, 0, 0.45)" }}>
              View and manage your assets
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push("/assets/user/add")}
            size="large"
          >
            Add New Asset
          </Button>
        </div>
      </div>

      <Card>
        <MyAssetsList />
      </Card>
    </UserDashboardLayout>
  );
}

