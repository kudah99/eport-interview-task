"use client";

import React, { useState, useEffect } from "react";
import { Layout, Menu, theme, Avatar, Dropdown, Spin, message } from "antd";
import type { MenuProps } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined,
  TeamOutlined,
  AppstoreOutlined,
  BankOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const { Header, Content, Footer, Sider } = Layout;

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  userEmail: string;
}

export function AdminDashboardLayout({
  children,
  userEmail,
}: AdminDashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Determine active menu key based on pathname
  const getActiveKey = (path: string) => {
    if (path === "/admin") return "1";
    if (path === "/admin/users") return "2";
    if (path === "/admin/categories") return "3";
    if (path === "/admin/departments") return "4";
    if (path === "/admin/assets") return "5";
    if (path === "/admin/profile-requests") return "6";
    return "1";
  };

  const [selectedKey, setSelectedKey] = useState(() => getActiveKey(pathname || "/admin"));

  useEffect(() => {
    setSelectedKey(getActiveKey(pathname || "/admin"));
  }, [pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    message.loading({ content: "Signing out...", key: "logout", duration: 0 });
    
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      message.success({ content: "Signed out successfully", key: "logout", duration: 1 });
      router.push("/auth/login");
    } catch (error) {
      message.error({ content: "Error signing out", key: "logout", duration: 2 });
      setIsLoggingOut(false);
    }
  };

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  const menuItems: MenuProps["items"] = [
    {
      key: "1",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      onClick: () => router.push("/admin"),
    },
    {
      key: "2",
      icon: <TeamOutlined />,
      label: "User Management",
      onClick: () => router.push("/admin/users"),
    },
    {
      key: "3",
      icon: <AppstoreOutlined />,
      label: "Asset Categories",
      onClick: () => router.push("/admin/categories"),
    },
    {
      key: "4",
      icon: <BankOutlined />,
      label: "Departments",
      onClick: () => router.push("/admin/departments"),
    },
    {
      key: "5",
      icon: <DeleteOutlined />,
      label: "Manage Assets",
      onClick: () => router.push("/admin/assets"),
    },
    {
      key: "6",
      icon: <CheckCircleOutlined />,
      label: "Approve Profiles",
      onClick: () => router.push("/admin/profile-requests"),
    },
  ];

  return (
    <Spin spinning={isLoggingOut} tip="Signing out..." size="large">
      <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            height: 32,
            margin: 16,
            background: "rgba(255, 255, 255, 0.3)",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
          }}
        >
          {collapsed ? "AM" : "Asset Manager"}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 0 : 200, transition: "margin-left 0.2s" }}>
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: 4,
                }}
              >
                <Avatar icon={<UserOutlined />} />
                <span>{userEmail}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Asset Manager ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
    </Spin>
  );
}

