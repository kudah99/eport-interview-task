"use client";

import React, { useState } from "react";
import { Button, Input, Form } from "antd";
import { toast } from "sonner";

interface CreateDepartmentFormProps {
  onSuccess?: () => void;
  departmentId?: string;
  initialValues?: {
    name: string;
    description?: string;
  };
}

export function CreateDepartmentForm({ onSuccess, departmentId, initialValues }: CreateDepartmentFormProps) {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!departmentId;

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
        // Update existing department
        response = await fetch(`/api/admin/departments/${departmentId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
      } else {
        // Create new department
        response = await fetch("/api/admin/create-department", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${isEditMode ? "update" : "create"} department`);
      }

      toast.success(`Department ${isEditMode ? "updated" : "created"} successfully!`);
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
        label="Department Name"
        name="name"
        rules={[{ required: true, message: "Please enter department name" }]}
      >
        <Input placeholder="e.g., IT, HR, Finance, Operations" />
      </Form.Item>
      <Form.Item
        label="Description"
        name="description"
      >
        <Input.TextArea
          rows={3}
          placeholder="Optional description for this department"
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isLoading} block>
          {isEditMode ? "Update Department" : "Create Department"}
        </Button>
      </Form.Item>
    </Form>
  );
}

