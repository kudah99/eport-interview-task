"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Form, Card, Typography, Alert } from "antd";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

const { Title, Text } = Typography;

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [form] = Form.useForm();
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (values: { email: string }) => {
    const supabase = createClient();
    setIsLoading(true);

    try {
      // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
      toast.success("Password reset email sent!");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <Card>
          <div style={{ marginBottom: 24 }}>
            <Title level={2} style={{ marginBottom: 8 }}>Check Your Email</Title>
            <Text type="secondary">Password reset instructions sent</Text>
          </div>
          <Alert
            message="Email Sent"
            description="If you registered using your email and password, you will receive a password reset email."
            type="success"
            showIcon
          />
        </Card>
      ) : (
        <Card>
          <div style={{ marginBottom: 24 }}>
            <Title level={2} style={{ marginBottom: 8 }}>Reset Your Password</Title>
            <Text type="secondary">
              Type in your email and we&apos;ll send you a link to reset your password
            </Text>
          </div>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleForgotPassword}
            autoComplete="off"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input placeholder="m@example.com" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={isLoading} block>
                Send reset email
              </Button>
            </Form.Item>
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <Text>
                Already have an account?{" "}
                <Link href="/auth/login">Login</Link>
              </Text>
            </div>
          </Form>
        </Card>
      )}
    </div>
  );
}
