"use client";

import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

interface RecentAsset {
  id: string;
  name: string;
  category: string | null;
  department: string | null;
  cost: number | null;
  status: string | null;
  created_at: string;
}

interface RecentAssetsTableProps {
  assets: RecentAsset[];
}

export function RecentAssetsTable({ assets }: RecentAssetsTableProps) {
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

  const columns: ColumnsType<RecentAsset> = [
    {
      title: "Asset Name",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category: string | null) => (
        <Tag color="blue">{category || "Uncategorized"}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string | null) => {
        const statusColor = getStatusColor(status || "active");
        return <Tag color={statusColor}>{status || "active"}</Tag>;
      },
    },
    {
      title: "Cost",
      dataIndex: "cost",
      key: "cost",
      render: (cost: number | null) =>
        cost ? formatCurrency(cost) : <span style={{ color: "rgba(0, 0, 0, 0.45)" }}>N/A</span>,
      align: "right",
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={assets}
      rowKey="id"
      pagination={false}
      size="small"
    />
  );
}

