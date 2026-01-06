"use client";

import { Modal, Descriptions, Button, Space, Tag, InputNumber, DatePicker } from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import dayjs, { Dayjs } from "dayjs";

interface Asset {
  id: string;
  name: string;
  category?: string;
  department?: string;
  date_purchased?: string;
  cost?: number;
  status?: string;
  description?: string;
  created_at?: string;
  warranty_period_months?: number;
  warranty_expiry_date?: string;
  warranty_notes?: string;
  warranty_registered_at?: string;
  warranty_registered_by?: string;
}

interface AssetDetailModalProps {
  asset: Asset | null;
  open: boolean;
  onClose: () => void;
  onWarrantyRegistered?: () => void;
}

export function AssetDetailModal({ asset, open, onClose, onWarrantyRegistered }: AssetDetailModalProps) {
  const [registering, setRegistering] = useState(false);
  const [warrantyPeriodMonths, setWarrantyPeriodMonths] = useState<number>(24);
  const [warrantyExpiryDate, setWarrantyExpiryDate] = useState<Dayjs | null>(null);
  const [notes, setNotes] = useState("");

  // Initialize warranty expiry date when asset changes or modal opens
  useEffect(() => {
    if (asset && open && asset.date_purchased) {
      const defaultDate = dayjs(asset.date_purchased).add(warrantyPeriodMonths, "month");
      setWarrantyExpiryDate(defaultDate);
    } else if (!open) {
      // Reset when modal closes
      setWarrantyExpiryDate(null);
      setNotes("");
      setWarrantyPeriodMonths(24);
    }
  }, [asset, open, warrantyPeriodMonths]);

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "green";
      case "inactive":
        return "default";
      case "maintenance":
        return "orange";
      case "retired":
        return "red";
      case "warranty registered":
        return "blue";
      default:
        return "blue";
    }
  };

  const handleRegisterWarranty = async () => {
    if (!asset) return;

    // Validate required fields
    if (!asset.date_purchased) {
      toast.error("Date purchased is required to register warranty");
      return;
    }

    if (!warrantyExpiryDate) {
      toast.error("Please select warranty expiry date");
      return;
    }

    setRegistering(true);
    try {
      const response = await fetch("/api/assets/register-warranty", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          asset_id: asset.id,
          warranty_period_months: warrantyPeriodMonths,
          warranty_expiry_date: warrantyExpiryDate.format("YYYY-MM-DD"),
          notes: notes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register warranty");
      }

      toast.success("Warranty registered successfully!");
      onWarrantyRegistered?.();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast.error(errorMessage);
    } finally {
      setRegistering(false);
    }
  };

  if (!asset) return null;

  return (
    <Modal
      title="Asset Details"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <Button
          key="register"
          type="primary"
          icon={<SafetyCertificateOutlined />}
          onClick={handleRegisterWarranty}
          loading={registering}
          disabled={asset.status?.toLowerCase() === "warranty registered"}
        >
          {asset.status?.toLowerCase() === "warranty registered"
            ? "Warranty Already Registered"
            : "Register Warranty"}
        </Button>,
      ]}
      width={700}
    >
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Asset Name">{asset.name}</Descriptions.Item>
        <Descriptions.Item label="Category">{asset.category || "-"}</Descriptions.Item>
        <Descriptions.Item label="Department">{asset.department || "-"}</Descriptions.Item>
        <Descriptions.Item label="Date Purchased">
          {asset.date_purchased
            ? new Date(asset.date_purchased).toLocaleDateString()
            : "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Cost">
          {asset.cost !== null && asset.cost !== undefined
            ? `$${parseFloat(asset.cost.toString()).toFixed(2)}`
            : "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={getStatusColor(asset.status)}>
            {asset.status || "active"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Description">
          {asset.description || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Created At">
          {asset.created_at
            ? new Date(asset.created_at).toLocaleString()
            : "-"}
        </Descriptions.Item>
      </Descriptions>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Warranty Registration</h3>
        {asset.status?.toLowerCase() === "warranty registered" ? (
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Tag color="blue" icon={<SafetyCertificateOutlined />} style={{ fontSize: 14, padding: "8px 16px" }}>
              Warranty Registered
            </Tag>
            <Descriptions column={1} bordered size="small">
              {asset.warranty_period_months && (
                <Descriptions.Item label="Warranty Period">
                  {asset.warranty_period_months} months
                </Descriptions.Item>
              )}
              {asset.warranty_expiry_date && (
                <Descriptions.Item label="Warranty Expiry Date">
                  {new Date(asset.warranty_expiry_date).toLocaleDateString()}
                </Descriptions.Item>
              )}
              {asset.warranty_notes && (
                <Descriptions.Item label="Notes">
                  {asset.warranty_notes}
                </Descriptions.Item>
              )}
              {asset.warranty_registered_at && (
                <Descriptions.Item label="Registered At">
                  {new Date(asset.warranty_registered_at).toLocaleString()}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Space>
        ) : (
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <div>
              <label style={{ display: "block", marginBottom: 8 }}>
                Warranty Period (Months)
              </label>
              <InputNumber
                min={1}
                max={120}
                value={warrantyPeriodMonths}
                onChange={(value) => {
                  setWarrantyPeriodMonths(value || 24);
                  if (asset.date_purchased) {
                    setWarrantyExpiryDate(
                      dayjs(asset.date_purchased).add(value || 24, "month")
                    );
                  }
                }}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 8 }}>
                Warranty Expiry Date *
              </label>
              <DatePicker
                value={warrantyExpiryDate}
                onChange={(date) => setWarrantyExpiryDate(date)}
                style={{ width: "100%" }}
                format="YYYY-MM-DD"
                disabledDate={(current) => {
                  if (!asset.date_purchased) return true;
                  return current && current < dayjs(asset.date_purchased);
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 8 }}>
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about the warranty..."
                style={{
                  width: "100%",
                  minHeight: 80,
                  padding: 8,
                  border: "1px solid #d9d9d9",
                  borderRadius: 4,
                }}
              />
            </div>
          </Space>
        )}
      </div>
    </Modal>
  );
}

