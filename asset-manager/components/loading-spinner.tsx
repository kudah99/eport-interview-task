"use client";

import { Spin } from "antd";
import { useEffect, useState } from "react";

export function LoadingSpinner() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const containerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#ffffff",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  };

  // Use simple CSS spinner during SSR to avoid Date.now() issue with Ant Design Spin
  // Switch to Ant Design Spin after client-side hydration
  if (!isMounted) {
    return (
      <div style={containerStyle}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <Spin size="large" />
    </div>
  );
}

