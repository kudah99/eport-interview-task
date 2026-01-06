"use client";

import { AdminDashboardLayout } from "@/components/admin-dashboard-layout";
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Input,
  Form,
  message,
  Badge,
} from "antd";
import { CheckOutlined, CloseOutlined, EyeOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ColumnsType } from "antd/es/table";

interface ProfileUpdateRequest {
  id: string;
  user_id: string;
  current_name: string | null;
  requested_name: string | null;
  current_email: string;
  requested_email: string;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

interface ApproveProfileRequestsContentProps {
  userEmail: string;
}

export function ApproveProfileRequestsContent({
  userEmail,
}: ApproveProfileRequestsContentProps) {
  const [requests, setRequests] = useState<ProfileUpdateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ProfileUpdateRequest | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [form] = Form.useForm();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/profile-requests");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch profile update requests");
      }

      setRequests(data.requests || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = (request: ProfileUpdateRequest) => {
    setSelectedRequest(request);
    setAction("approve");
    form.setFieldsValue({ admin_notes: "" });
    setModalVisible(true);
  };

  const handleReject = (request: ProfileUpdateRequest) => {
    setSelectedRequest(request);
    setAction("reject");
    form.setFieldsValue({ admin_notes: "" });
    setModalVisible(true);
  };

  const handleModalSubmit = async (values: { admin_notes?: string }) => {
    if (!selectedRequest || !action) return;

    try {
      const response = await fetch("/api/admin/profile-requests/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request_id: selectedRequest.id,
          action,
          admin_notes: values.admin_notes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process request");
      }

      toast.success(
        action === "approve"
          ? "Profile update request approved successfully!"
          : "Profile update request rejected."
      );
      setModalVisible(false);
      setSelectedRequest(null);
      setAction(null);
      form.resetFields();
      fetchRequests();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast.error(errorMessage);
    }
  };

  const columns: ColumnsType<ProfileUpdateRequest> = [
    {
      title: "User Email",
      dataIndex: "current_email",
      key: "current_email",
    },
    {
      title: "Current Name",
      dataIndex: "current_name",
      key: "current_name",
      render: (text) => text || "N/A",
    },
    {
      title: "Requested Name",
      dataIndex: "requested_name",
      key: "requested_name",
      render: (text) => text || "N/A",
    },
    {
      title: "Requested Email",
      dataIndex: "requested_email",
      key: "requested_email",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color =
          status === "approved"
            ? "green"
            : status === "rejected"
            ? "red"
            : "orange";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Requested At",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        if (record.status !== "pending") {
          return <span style={{ color: "rgba(0, 0, 0, 0.45)" }}>Processed</span>;
        }
        return (
          <Space>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              size="small"
              onClick={() => handleApprove(record)}
            >
              Approve
            </Button>
            <Button
              danger
              icon={<CloseOutlined />}
              size="small"
              onClick={() => handleReject(record)}
            >
              Reject
            </Button>
          </Space>
        );
      },
    },
  ];

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <AdminDashboardLayout userEmail={userEmail}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
              Approve Profile Updates
            </h1>
            <p style={{ color: "rgba(0, 0, 0, 0.45)" }}>
              Review and approve or reject user profile update requests
            </p>
          </div>
          {pendingCount > 0 && (
            <Badge count={pendingCount} showZero>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Pending Requests</span>
            </Badge>
          )}
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={requests}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={action === "approve" ? "Approve Profile Update" : "Reject Profile Update"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedRequest(null);
          setAction(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedRequest && (
          <div style={{ marginBottom: 24 }}>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <strong>Current Email:</strong> {selectedRequest.current_email}
                </div>
                <div>
                  <strong>Requested Email:</strong> {selectedRequest.requested_email}
                </div>
                <div>
                  <strong>Current Name:</strong> {selectedRequest.current_name || "N/A"}
                </div>
                <div>
                  <strong>Requested Name:</strong> {selectedRequest.requested_name || "N/A"}
                </div>
              </Space>
            </Card>

            <Form form={form} layout="vertical" onFinish={handleModalSubmit}>
              <Form.Item
                label={action === "approve" ? "Notes (Optional)" : "Rejection Reason (Required)"}
                name="admin_notes"
                rules={
                  action === "reject"
                    ? [
                        {
                          required: true,
                          message: "Please provide a reason for rejection",
                        },
                      ]
                    : []
                }
              >
                <Input.TextArea
                  rows={4}
                  placeholder={
                    action === "approve"
                      ? "Add any notes about this approval..."
                      : "Explain why this request is being rejected..."
                  }
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={action === "approve" ? <CheckOutlined /> : <CloseOutlined />}
                  >
                    {action === "approve" ? "Approve" : "Reject"}
                  </Button>
                  <Button
                    onClick={() => {
                      setModalVisible(false);
                      setSelectedRequest(null);
                      setAction(null);
                      form.resetFields();
                    }}
                  >
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </AdminDashboardLayout>
  );
}

