"use client";

import { useState } from "react";
import { Card, Badge, Button, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { CreateDepartmentForm } from "@/components/create-department-form";
import { DepartmentList } from "@/components/department-list";

export function DepartmentsContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDepartmentCreated = () => {
    // Close the modal
    setIsModalOpen(false);
    // Trigger refresh of department list
    setRefreshTrigger((prev) => prev + 1);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
              Departments
            </h1>
            <p style={{ color: "rgba(0, 0, 0, 0.45)" }}>
              Create and manage departments for organizational structure
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Badge status="success" text="Admin Only" />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showModal}
              size="large"
            >
              Add New Department
            </Button>
          </div>
        </div>
      </div>

      <Card
        title="Departments"
        style={{ borderColor: "#20b2aa" }}
      >
        <DepartmentList refreshTrigger={refreshTrigger} />
      </Card>

      <Modal
        title="Create Department"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={500}
      >
        <p style={{ color: "rgba(0, 0, 0, 0.45)", marginBottom: 16 }}>
          Create new departments to organize your organization's structure and assign assets to departments.
        </p>
        <CreateDepartmentForm onSuccess={handleDepartmentCreated} />
      </Modal>
    </>
  );
}

