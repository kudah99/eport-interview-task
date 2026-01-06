"use client";

import { useState, useEffect } from "react";
import { Table, Button, Popconfirm, Space, Dropdown, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { MenuProps } from "antd";
import { DeleteOutlined, DownloadOutlined, FileExcelOutlined, FileTextOutlined } from "@ant-design/icons";
import { toast } from "sonner";
import { exportToExcel, exportToCSV } from "@/lib/export";

interface Asset {
  id: string;
  name: string;
  category?: string;
  department?: string;
  date_purchased?: string;
  cost?: number;
  status?: string;
  created_at?: string;
}

export function ManageAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/assets");
      const data = await response.json();
      
      if (response.ok) {
        setAssets(data.assets || []);
      } else {
        toast.error(data.error || "Failed to fetch assets");
      }
    } catch (error) {
      toast.error("An error occurred while fetching assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleDelete = async (assetId: string) => {
    try {
      const response = await fetch(`/api/admin/assets/${assetId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete asset");
      }

      toast.success("Asset deleted successfully!");
      fetchAssets(); // Refresh the list
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast.error(errorMessage);
    }
  };

  const handleExportExcel = () => {
    const result = exportToExcel(assets, "assets");
    if (result.success) {
      toast.success("Assets exported to Excel successfully!");
    } else {
      toast.error(`Export failed: ${result.error}`);
    }
  };

  const handleExportCSV = () => {
    const result = exportToCSV(assets, "assets");
    if (result.success) {
      toast.success("Assets exported to CSV successfully!");
    } else {
      toast.error(`Export failed: ${result.error}`);
    }
  };

  const exportMenuItems: MenuProps["items"] = [
    {
      key: "excel",
      label: "Export to Excel",
      icon: <FileExcelOutlined />,
      onClick: handleExportExcel,
    },
    {
      key: "csv",
      label: "Export to CSV",
      icon: <FileTextOutlined />,
      onClick: handleExportCSV,
    },
  ];

  const columns: ColumnsType<Asset> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Date Purchased",
      dataIndex: "date_purchased",
      key: "date_purchased",
      render: (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString();
      },
    },
    {
      title: "Cost",
      dataIndex: "cost",
      key: "cost",
      render: (cost) => {
        if (cost === null || cost === undefined) return "-";
        return `$${parseFloat(cost.toString()).toFixed(2)}`;
      },
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const getStatusColor = (status?: string) => {
          switch (status?.toLowerCase()) {
            case "active":
              return "green";
            case "inactive":
              return "default";
            case "maintenance":
              return "orange";
            case "retired":
              return "red";
            case "warranty registered":
              return "blue";
            default:
              return "blue";
          }
        };
        return <Tag color={getStatusColor(status)}>{status || "active"}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Popconfirm
            title="Delete Asset"
            description="Are you sure you want to delete this asset? This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Manage Assets</h3>
        <Space>
          <Dropdown menu={{ items: exportMenuItems }} placement="bottomRight">
            <Button icon={<DownloadOutlined />} loading={loading}>
              Export
            </Button>
          </Dropdown>
          <Button onClick={fetchAssets} loading={loading}>
            Refresh
          </Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={assets}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}

