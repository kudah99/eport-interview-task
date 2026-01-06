"use client";

import React, { useState } from "react";
import { Button, Input, Form, message } from "antd";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CreateCategoryFormProps {
  onSuccess?: () => void;
  categoryId?: string;
  initialValues?: {
    name: string;
    description?: string;
  };
}

export function CreateCategoryForm({ onSuccess, categoryId, initialValues }: CreateCategoryFormProps) {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!categoryId;

  // Set initial values when editing
  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const handleSubmit = async (values: { name: string; description?: string }) => {
    setIsLoading(true);

    try {
      let response;
      if (isEditMode) {
        // Update existing category
        response = await fetch(`/api/admin/categories/${categoryId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
      } else {
        // Create new category
        response = await fetch("/api/admin/create-category", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${isEditMode ? "update" : "create"} category`);
      }

      toast.success(`Asset category ${isEditMode ? "updated" : "created"} successfully!`);
      form.resetFields();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      autoComplete="off"
    >
      <Form.Item
        label="Category Name"
        name="name"
        rules={[{ required: true, message: "Please enter category name" }]}
      >
        <Input placeholder="e.g., Laptops, Furniture, Vehicles" />
      </Form.Item>
      <Form.Item
        label="Description"
        name="description"
      >
        <Input.TextArea
          rows={3}
          placeholder="Optional description for this category"
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isLoading} block>
          {isEditMode ? "Update Category" : "Create Category"}
        </Button>
      </Form.Item>
    </Form>
  );
}

