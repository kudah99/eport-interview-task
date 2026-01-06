"use client";

import { useState } from "react";
import { Card, Badge, Button, Modal } from "antd";
import { AppstoreAddOutlined } from "@ant-design/icons";
import { CreateCategoryForm } from "@/components/create-category-form";
import { CategoryList } from "@/components/category-list";

export function AssetCategoriesContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCategoryCreated = () => {
    // Close the modal
    setIsModalOpen(false);
    // Trigger refresh of category list
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
              Asset Categories
            </h1>
            <p style={{ color: "rgba(0, 0, 0, 0.45)" }}>
              Create and manage asset categories to organize your assets
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Badge status="success" text="Admin Only" />
            <Button
              type="primary"
              icon={<AppstoreAddOutlined />}
              onClick={showModal}
              size="large"
            >
              Add New Category
            </Button>
          </div>
        </div>
      </div>

      <Card
        title="Asset Categories"
        style={{ borderColor: "#20b2aa" }}
      >
        <CategoryList refreshTrigger={refreshTrigger} />
      </Card>

      <Modal
        title="Create Asset Category"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={500}
      >
        <p style={{ color: "rgba(0, 0, 0, 0.45)", marginBottom: 16 }}>
          Create new asset categories to help organize and classify assets in your system.
        </p>
        <CreateCategoryForm onSuccess={handleCategoryCreated} />
      </Modal>
    </>
  );
}

