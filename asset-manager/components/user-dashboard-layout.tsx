"use client";

import React, { useState } from "react";
import { Layout, Menu, theme, Avatar, Dropdown, Spin, message } from "antd";
import type { MenuProps } from "antd";
import {
  DashboardOutlined,
  FileOutlined,
  UserOutlined,
  LogoutOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const { Header, Content, Footer, Sider } = Layout;

interface UserDashboardLayoutProps {
  children: React.ReactNode;
  userEmail: string;
  activeKey?: string;
}

export function UserDashboardLayout({
  children,
  userEmail,
  activeKey = "1",
}: UserDashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    message.loading({ content: "Signing out...", key: "logout", duration: 0 });
    
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      message.success({ content: "Signed out successfully", key: "logout", duration: 1 });
      router.push("/auth/login");
    } catch {
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
      onClick: () => router.push("/"),
    },
    {
      key: "2",
      icon: <FileOutlined />,
      label: "My Assets",
      onClick: () => router.push("/assets/user"),
    },
    {
      key: "3",
      icon: <EditOutlined />,
      label: "Request Profile Update",
      onClick: () => router.push("/profile/request-update"),
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
          selectedKeys={[activeKey]}
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

