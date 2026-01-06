"use client";

import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

interface RecentAsset {
  id: string;
  name: string;
  category: string | null;
  department: string | null;
  cost: number | null;
  created_at: string;
}

interface AdminRecentAssetsTableProps {
  assets: RecentAsset[];
}

export function AdminRecentAssetsTable({ assets }: AdminRecentAssetsTableProps) {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
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
      title: "Department",
      dataIndex: "department",
      key: "department",
      render: (department: string | null) => (
        <Tag color="purple">{department || "Unassigned"}</Tag>
      ),
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

