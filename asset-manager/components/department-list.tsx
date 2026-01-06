"use client";

import { useState, useEffect } from "react";
import { Table, Button, Popconfirm, Space, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ReloadOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { toast } from "sonner";
import { CreateDepartmentForm } from "@/components/create-department-form";

interface Department {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

interface DepartmentListProps {
  refreshTrigger?: number;
}

export function DepartmentList({ refreshTrigger }: DepartmentListProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/departments");
      const data = await response.json();
      
      if (response.ok) {
        setDepartments(data.departments || []);
      } else {
        toast.error(data.error || "Failed to fetch departments");
      }
    } catch (error) {
      toast.error("An error occurred while fetching departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [refreshTrigger]);

  const handleDelete = async (departmentId: string, departmentName: string) => {
    try {
      const response = await fetch(`/api/admin/departments/${departmentId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete department");
      }

      toast.success(`Department "${departmentName}" deleted successfully!`);
      fetchDepartments(); // Refresh the list
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast.error(errorMessage);
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    setEditingDepartment(null);
    fetchDepartments(); // Refresh the list
  };

  const handleEditCancel = () => {
    setEditModalOpen(false);
    setEditingDepartment(null);
  };

  const columns: ColumnsType<Department> = [
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
            title="Delete Department"
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
        <h3 style={{ margin: 0 }}>All Departments ({departments.length})</h3>
        <Button onClick={fetchDepartments} loading={loading} icon={<ReloadOutlined />}>
          Refresh
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={departments}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} departments` }}
      />

      <Modal
        title="Edit Department"
        open={editModalOpen}
        onCancel={handleEditCancel}
        footer={null}
        width={500}
      >
        <CreateDepartmentForm
          departmentId={editingDepartment?.id}
          initialValues={{
            name: editingDepartment?.name || "",
            description: editingDepartment?.description || "",
          }}
          onSuccess={handleEditSuccess}
        />
      </Modal>
    </div>
  );
}

