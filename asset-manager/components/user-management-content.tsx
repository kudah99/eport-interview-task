"use client";

import { useState } from "react";
import { Card, Badge, Button, Modal } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import { CreateUserForm } from "@/components/create-user-form";
import { UserList } from "@/components/user-list";

export function UserManagementContent() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUserCreated = () => {
    // Trigger refresh of user list
    setRefreshTrigger((prev) => prev + 1);
    // Close the modal
    setIsModalOpen(false);
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
              User Management
            </h1>
            <p style={{ color: "rgba(0, 0, 0, 0.45)" }}>
              Create and manage user accounts in the system
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Badge status="success" text="Admin Only" />
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={showModal}
              size="large"
            >
              Add New User
            </Button>
          </div>
        </div>
      </div>

      <Card
        title="All Users"
        style={{ borderColor: "#20b2aa" }}
      >
        <UserList refreshTrigger={refreshTrigger} />
      </Card>

      <Modal
        title="Create New User"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={500}
      >
        <p style={{ color: "rgba(0, 0, 0, 0.45)", marginBottom: 16 }}>
          Create new user accounts with email and password. Users will receive their login credentials via email and will be able to login immediately after creation.
        </p>
        <CreateUserForm onSuccess={handleUserCreated} />
      </Modal>
    </>
  );
}

