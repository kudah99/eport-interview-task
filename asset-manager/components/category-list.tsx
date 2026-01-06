"use client";

import { useState, useEffect } from "react";
import { Table, Button, Popconfirm, Space, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ReloadOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { toast } from "sonner";
import { CreateCategoryForm } from "@/components/create-category-form";

interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

interface CategoryListProps {
  refreshTrigger?: number;
}

export function CategoryList({ refreshTrigger }: CategoryListProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();
      
      if (response.ok) {
        setCategories(data.categories || []);
      } else {
        toast.error(data.error || "Failed to fetch categories");
      }
    } catch (error) {
      toast.error("An error occurred while fetching categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [refreshTrigger]);

  const handleDelete = async (categoryId: string, categoryName: string) => {
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete category");
      }

      toast.success(`Category "${categoryName}" deleted successfully!`);
      fetchCategories(); // Refresh the list
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast.error(errorMessage);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    setEditingCategory(null);
    fetchCategories(); // Refresh the list
  };

  const handleEditCancel = () => {
    setEditModalOpen(false);
    setEditingCategory(null);
  };

  const columns: ColumnsType<Category> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <strong>{name}</strong>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (description: string) => description || <span style={{ color: "rgba(0, 0, 0, 0.45)" }}>-</span>,
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Category"
            description={`Are you sure you want to delete "${record.name}"? This action cannot be undone.`}
            onConfirm={() => handleDelete(record.id, record.name)}
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
        <h3 style={{ margin: 0 }}>All Categories ({categories.length})</h3>
        <Button onClick={fetchCategories} loading={loading} icon={<ReloadOutlined />}>
          Refresh
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={categories}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} categories` }}
      />

      <Modal
        title="Edit Category"
        open={editModalOpen}
        onCancel={handleEditCancel}
        footer={null}
        width={500}
      >
        <CreateCategoryForm
          categoryId={editingCategory?.id}
          initialValues={{
            name: editingCategory?.name || "",
            description: editingCategory?.description || "",
          }}
          onSuccess={handleEditSuccess}
        />
      </Modal>
    </div>
  );
}

