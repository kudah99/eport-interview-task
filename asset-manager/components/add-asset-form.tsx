"use client";

import { useState, useEffect } from "react";
import { Button, Input, Form, Select, DatePicker, InputNumber, Upload } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { toast } from "sonner";
import dayjs from "dayjs";

interface Category {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
}

export function AddAssetForm({ onSuccess }: { onSuccess?: () => void }) {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [categoriesRes, departmentsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/departments"),
        ]);

        if (categoriesRes.ok) {
          const catData = await categoriesRes.json();
          setCategories(catData.categories || []);
        }

        if (departmentsRes.ok) {
          const deptData = await departmentsRes.json();
          setDepartments(deptData.departments || []);
        }
      } catch (error) {
        console.error("Error fetching options:", error);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  const handleAddAsset = async (values: {
    name: string;
    category?: string;
    department?: string;
    date_purchased?: any;
    cost?: number;
    description?: string;
    status?: string;
  }) => {
    setIsLoading(true);

    try {
      // Format date_purchased if provided
      const payload = {
        ...values,
        date_purchased: values.date_purchased
          ? dayjs(values.date_purchased).format("YYYY-MM-DD")
          : null,
      };

      // Build multipart form data so we can upload images
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Attach up to 4 image files
      fileList.slice(0, 4).forEach((file) => {
        if (file.originFileObj) {
          formData.append("images", file.originFileObj as File);
        }
      });

      const response = await fetch("/api/assets", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create asset");
      }

      toast.success("Asset created successfully!");
      form.resetFields();
      setFileList([]);
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
      onFinish={handleAddAsset}
      autoComplete="off"
    >
      <Form.Item
        label="Asset Name"
        name="name"
        rules={[{ required: true, message: "Please enter asset name" }]}
      >
        <Input placeholder="e.g., Laptop-001, Office Chair, Company Vehicle" />
      </Form.Item>
      <Form.Item
        label="Category"
        name="category"
        rules={[{ required: true, message: "Please select a category" }]}
      >
        <Select
          placeholder="Select a category"
          loading={loadingOptions}
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          options={categories.map((cat) => ({
            value: cat.name,
            label: cat.name,
          }))}
        />
      </Form.Item>
      <Form.Item
        label="Date Purchased"
        name="date_purchased"
        rules={[{ required: true, message: "Please select purchase date" }]}
      >
        <DatePicker
          style={{ width: "100%" }}
          format="YYYY-MM-DD"
          placeholder="Select purchase date"
        />
      </Form.Item>
      <Form.Item
        label="Cost"
        name="cost"
        rules={[
          { required: true, message: "Please enter the cost" },
          { type: "number", min: 0, message: "Cost must be a positive number" },
        ]}
      >
        <InputNumber
          style={{ width: "100%" }}
          placeholder="Enter cost"
          addonBefore="$"
          min={0}
          step={0.01}
          precision={2}
        />
      </Form.Item>
      <Form.Item
        label="Department"
        name="department"
        rules={[{ required: true, message: "Please select a department" }]}
      >
        <Select
          placeholder="Select a department"
          loading={loadingOptions}
          showSearch
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          options={departments.map((dept) => ({
            value: dept.name,
            label: dept.name,
          }))}
        />
      </Form.Item>
      <Form.Item
        label="Status"
        name="status"
        initialValue="active"
      >
        <Select
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
            { value: "maintenance", label: "Maintenance" },
            { value: "retired", label: "Retired" },
          ]}
        />
      </Form.Item>
      <Form.Item
        label="Description"
        name="description"
      >
        <Input.TextArea
          rows={3}
          placeholder="Optional description for this asset"
        />
      </Form.Item>
      <Form.Item label="Asset Images (up to 4)">
        <Upload
          listType="picture-card"
          multiple
          fileList={fileList}
          beforeUpload={(file) => {
            if (fileList.length >= 4) {
              toast.error("You can only upload up to 4 images per asset");
              return Upload.LIST_IGNORE;
            }
            setFileList((prev) => [...prev, file]);
            // Prevent auto upload - we'll submit with the form
            return false;
          }}
          onRemove={(file) => {
            setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
          }}
        >
          {fileList.length >= 4 ? null : <div>Upload</div>}
        </Upload>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isLoading} block>
          Add Asset
        </Button>
      </Form.Item>
    </Form>
  );
}

