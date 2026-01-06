import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout";
import {
  Card,
  Statistic,
  Row,
  Col,
  Badge,
  Progress,
  Tag,
  Space,
} from "antd";
import { AdminRecentAssetsTable } from "@/components/admin-recent-assets-table";
import {
  DollarOutlined,
  UserOutlined,
  AppstoreOutlined,
  BankOutlined,
  ThunderboltOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { hasEnvVars } from "@/lib/utils";
import { LoadingSpinner } from "@/components/loading-spinner";
import { getDashboardStats } from "@/lib/admin-stats";

interface RecentAsset {
  id: string;
  name: string;
  category: string | null;
  department: string | null;
  cost: number | null;
  created_at: string;
}

async function AdminDashboardContent() {
  if (!hasEnvVars) {
    redirect("/auth/login");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const user = data.claims;
  const userRole = (user.user_metadata?.role as string) || "user";
  const isAdmin = userRole === "admin";

  // Redirect non-admins to user dashboard
  if (!isAdmin) {
    redirect("/");
  }

  const stats = await getDashboardStats();

  const totalAssets = stats?.totalAssets || 0;
  const totalUsers = stats?.totalUsers || 0;
  const totalCategories = stats?.totalCategories || 0;
  const totalDepartments = stats?.totalDepartments || 0;
  const totalValue = stats?.totalValue || 0;
  const recentActivity = stats?.recentActivity || 0;
  const statusCounts = stats?.statusCounts || {};
  const categoryCounts = stats?.categoryCounts || {};
  const departmentCounts = stats?.departmentCounts || {};
  const recentAssets: RecentAsset[] = stats?.recentAssets || [];


  // Calculate percentages for distributions
  const getCategoryData = () => {
    const entries = Object.entries(categoryCounts);
    const total = entries.reduce((sum, [, count]) => sum + count, 0);
    return entries
      .map(([name, count]) => ({
        name,
        count,
        percent: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const getDepartmentData = () => {
    const entries = Object.entries(departmentCounts);
    const total = entries.reduce((sum, [, count]) => sum + count, 0);
    return entries
      .map(([name, count]) => ({
        name,
        count,
        percent: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const categoryData = getCategoryData();
  const departmentData = getDepartmentData();

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "success";
      case "inactive":
        return "default";
      case "maintenance":
        return "warning";
      case "retired":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <AdminDashboardLayout userEmail={user.email as string}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2 style={{ margin: 0, marginBottom: 8, fontSize: 24, fontWeight: 600 }}>
              Admin Dashboard
            </h2>
            <p style={{ color: "rgba(0, 0, 0, 0.45)", fontSize: 16, margin: 0 }}>
              Welcome back, {user.email}
            </p>
          </div>
          <Badge status="success" text={<strong>Admin</strong>} />
        </div>
      </div>

      {/* Main Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
            }}
            styles={{ body: { padding: 24 } }}
          >
            <Statistic
              title={
                <span style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: 14 }}>
                  Total Assets
                </span>
              }
              value={totalAssets}
              styles={{ content: { color: "#fff", fontSize: 32, fontWeight: 600 } }}
              prefix={<ShoppingOutlined style={{ color: "rgba(255, 255, 255, 0.85)" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              border: "none",
            }}
            styles={{ body: { padding: 24 } }}
          >
            <Statistic
              title={
                <span style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: 14 }}>
                  Total Users
                </span>
              }
              value={totalUsers}
              styles={{ content: { color: "#fff", fontSize: 32, fontWeight: 600 } }}
              prefix={<UserOutlined style={{ color: "rgba(255, 255, 255, 0.85)" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              border: "none",
            }}
            styles={{ body: { padding: 24 } }}
          >
            <Statistic
              title={
                <span style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: 14 }}>
                  Total Value
                </span>
              }
              value={formatCurrency(totalValue)}
              styles={{ content: { color: "#fff", fontSize: 24, fontWeight: 600 } }}
              prefix={<DollarOutlined style={{ color: "rgba(255, 255, 255, 0.85)" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
              border: "none",
            }}
            styles={{ body: { padding: 24 } }}
          >
            <Statistic
              title={
                <span style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: 14 }}>
                  Recent Activity
                </span>
              }
              value={recentActivity}
              suffix={
                <span style={{ color: "rgba(255, 255, 255, 0.85)", fontSize: 14 }}>
                  last 24h
                </span>
              }
              styles={{ content: { color: "#fff", fontSize: 32, fontWeight: 600 } }}
              prefix={<ThunderboltOutlined style={{ color: "rgba(255, 255, 255, 0.85)" }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Secondary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Categories"
              value={totalCategories}
              prefix={<AppstoreOutlined style={{ color: "#667eea" }} />}
              styles={{ content: { color: "#667eea" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Departments"
              value={totalDepartments}
              prefix={<BankOutlined style={{ color: "#f5576c" }} />}
              styles={{ content: { color: "#f5576c" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Assets"
              value={statusCounts.active || 0}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              styles={{ content: { color: "#52c41a" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="In Maintenance"
              value={statusCounts.maintenance || 0}
              prefix={<WarningOutlined style={{ color: "#faad14" }} />}
              styles={{ content: { color: "#faad14" } }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Assets by Status */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <CheckCircleOutlined />
                <span>Assets by Status</span>
              </Space>
            }
            style={{ height: "100%" }}
          >
            {Object.entries(statusCounts).length > 0 ? (
              <Space orientation="vertical" style={{ width: "100%" }} size="large">
                {Object.entries(statusCounts).map(([status, count]) => {
                  const percent = totalAssets > 0 ? Math.round((count / totalAssets) * 100) : 0;
                  return (
                    <div key={status}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <Tag color={getStatusColor(status)} style={{ textTransform: "capitalize" }}>
                          {status}
                        </Tag>
                        <strong>{count}</strong>
                      </div>
                      <Progress
                        percent={percent}
                        showInfo={false}
                        strokeColor={
                          status.toLowerCase() === "active"
                            ? "#52c41a"
                            : status.toLowerCase() === "maintenance"
                            ? "#faad14"
                            : "#d9d9d9"
                        }
                      />
                    </div>
                  );
                })}
              </Space>
            ) : (
              <span style={{ color: "rgba(0, 0, 0, 0.45)" }}>No status data available</span>
            )}
          </Card>
        </Col>

        {/* Assets by Category */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <AppstoreOutlined />
                <span>Top Categories</span>
              </Space>
            }
            style={{ height: "100%" }}
          >
            {categoryData.length > 0 ? (
              <Space orientation="vertical" style={{ width: "100%" }} size="large">
                {categoryData.map((item) => (
                  <div key={item.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span>{item.name}</span>
                      <strong>{item.count}</strong>
                    </div>
                    <Progress percent={item.percent} showInfo={false} strokeColor="#4facfe" />
                  </div>
                ))}
              </Space>
            ) : (
              <span style={{ color: "rgba(0, 0, 0, 0.45)" }}>No category data available</span>
            )}
          </Card>
        </Col>

        {/* Assets by Department */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <BankOutlined />
                <span>Top Departments</span>
              </Space>
            }
            style={{ height: "100%" }}
          >
            {departmentData.length > 0 ? (
              <Space orientation="vertical" style={{ width: "100%" }} size="large">
                {departmentData.map((item) => (
                  <div key={item.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span>{item.name}</span>
                      <strong>{item.count}</strong>
                    </div>
                    <Progress percent={item.percent} showInfo={false} strokeColor="#f5576c" />
                  </div>
                ))}
              </Space>
            ) : (
              <span style={{ color: "rgba(0, 0, 0, 0.45)" }}>No department data available</span>
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent Assets */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                <span>Recent Assets (Last 24 Hours)</span>
              </Space>
            }
          >
            {recentAssets.length > 0 ? (
              <AdminRecentAssetsTable assets={recentAssets} />
            ) : (
              <span style={{ color: "rgba(0, 0, 0, 0.45)" }}>No recent assets in the last 24 hours</span>
            )}
          </Card>
        </Col>
      </Row>
    </AdminDashboardLayout>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AdminDashboardContent />
    </Suspense>
  );
}

