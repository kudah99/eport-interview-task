import type { ThemeConfig } from "antd";

const theme: ThemeConfig = {
  token: {
    fontSize: 14,
    colorPrimary: "#20b2aa", // Teal color
    borderRadius: 6,
    fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  components: {
    Button: {
      borderRadius: 6,
      algorithm: true, // Enable algorithm for better color derivation
    },
    Card: {
      borderRadius: 8,
    },
  },
};

export default theme;

