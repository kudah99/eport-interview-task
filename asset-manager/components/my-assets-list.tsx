"use client";

import { useState, useEffect } from "react";
import { Table, Tag, Button, Space, Dropdown } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { MenuProps } from "antd";
import { ReloadOutlined, DownloadOutlined, FileExcelOutlined, FileTextOutlined, EyeOutlined } from "@ant-design/icons";
import { toast } from "sonner";
import { exportToExcel, exportToCSV } from "@/lib/export";
import { AssetDetailModal } from "@/components/asset-detail-modal";

interface Asset {
  id: string;
  name: string;
  category?: string;
  department?: string;
  date_purchased?: string;
  cost?: number;
  status?: string;
  description?: string;
  created_at?: string;
}

export function MyAssetsList({ refreshTrigger }: { refreshTrigger?: number }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/assets");
      const data = await response.json();

      if (response.ok) {
        setAssets(data.assets || []);
      } else {
        const errorMsg = data.error || "Failed to fetch assets";
        if (errorMsg.includes("table") && errorMsg.includes("not found")) {
          toast.error(
            "Database tables not set up. Please run the SQL schema in Supabase.",
            { duration: 5000 }
          );
        } else {
          toast.error(errorMsg);
        }
      }
    } catch (error) {
      toast.error("An error occurred while fetching assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [refreshTrigger]);

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

  const handleExportExcel = () => {
    const result = exportToExcel(assets, "my-assets");
    if (result.success) {
      toast.success("Assets exported to Excel successfully!");
    } else {
      toast.error(`Export failed: ${result.error}`);
    }
  };

  const handleExportCSV = () => {
    const result = exportToCSV(assets, "my-assets");
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
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status || "active"}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedAsset(record);
            setModalOpen(true);
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Space>
          <Dropdown menu={{ items: exportMenuItems }} placement="bottomRight">
            <Button icon={<DownloadOutlined />} loading={loading}>
              Export
            </Button>
          </Dropdown>
          <Button icon={<ReloadOutlined />} onClick={fetchAssets} loading={loading}>
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
      <AssetDetailModal
        asset={selectedAsset}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedAsset(null);
        }}
        onWarrantyRegistered={() => {
          fetchAssets();
        }}
      />
    </div>
  );
}

