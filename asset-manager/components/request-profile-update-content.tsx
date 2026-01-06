"use client";

import { UserDashboardLayout } from "@/components/user-dashboard-layout";
import { Card, Form, Input, Button, Alert, Space } from "antd";
import { UserOutlined, MailOutlined } from "@ant-design/icons";
import { useState } from "react";
import { toast } from "sonner";

interface RequestProfileUpdateContentProps {
  userEmail: string;
  currentName: string;
}

export function RequestProfileUpdateContent({
  userEmail,
  currentName,
}: RequestProfileUpdateContentProps) {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  const handleSubmit = async (values: {
    requested_name?: string;
    requested_email: string;
  }) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/profile/request-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit profile update request");
      }

      toast.success("Profile update request submitted successfully! Admin will review it.");
      form.resetFields();
      setHasPendingRequest(true);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast.error(errorMessage);
      if (errorMessage.includes("pending")) {
        setHasPendingRequest(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserDashboardLayout userEmail={userEmail} activeKey="3">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
          Request Profile Update
        </h1>
        <p style={{ color: "rgba(0, 0, 0, 0.45)" }}>
          Request changes to your name or email. Admin approval is required.
        </p>
      </div>

      {hasPendingRequest && (
        <Alert
          message="Pending Request"
          description="You have a pending profile update request. Please wait for admin approval before submitting a new request."
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            current_name: currentName || "N/A",
            current_email: userEmail,
          }}
        >
          <Form.Item label="Current Name" name="current_name">
            <Input prefix={<UserOutlined />} disabled />
          </Form.Item>

          <Form.Item label="Current Email" name="current_email">
            <Input prefix={<MailOutlined />} disabled />
          </Form.Item>

          <Form.Item
            label="Requested Name"
            name="requested_name"
            rules={[
              {
                min: 2,
                message: "Name must be at least 2 characters",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter your new name (optional)"
            />
          </Form.Item>

          <Form.Item
            label="Requested Email"
            name="requested_email"
            rules={[
              {
                required: true,
                message: "Please enter your requested email",
              },
              {
                type: "email",
                message: "Please enter a valid email address",
              },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Enter your new email"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                disabled={hasPendingRequest}
              >
                Submit Request
              </Button>
              <Button onClick={() => form.resetFields()}>Reset</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </UserDashboardLayout>
  );
}

