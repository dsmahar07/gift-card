import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./utils/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Inter",
          "SF Pro Display",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        apple: {
          blue: "#007AFF",
          "blue-light": "#5AC8FA",
          gray: {
            50: "#FAFAFA",
            100: "#F5F5F7",
            200: "#E5E5EA",
            300: "#D1D1D6",
            400: "#C7C7CC",
            500: "#AEAEB2",
            600: "#8E8E93",
            700: "#636366",
            800: "#48484A",
            900: "#1C1C1E",
          },
        },
        system: {
          background: "#FFFFFF",
          "background-secondary": "#F2F2F7",
          "background-tertiary": "#FFFFFF",
          label: "#000000",
          "label-secondary": "#3C3C43",
          "label-tertiary": "#3C3C4399",
          "label-quaternary": "#3C3C432E",
          separator: "#3C3C4349",
          "separator-opaque": "#C6C6C8",
        },
        primary: {
          base: "#007AFF",
        },
        error: {
          base: "#FF3B30",
        },
        // Text colors for utilities
        "text-white-0": "#FFFFFF",
        "text-sub-600": "#8E8E93",
        "text-strong-950": "#1C1C1E",
        "text-disabled-300": "#C7C7CC",
        // Background colors for utilities
        "bg-white-0": "#FFFFFF",
        "bg-weak-50": "#F2F2F7",
        "bg-strong-950": "#1C1C1E",
        // Static colors
        "static-white": "#FFFFFF",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        "10": "0.625rem",
      },
      fontSize: {
        display: [
          "4.5rem",
          { lineHeight: "1.1", letterSpacing: "-0.02em" },
        ],
        "title-1": [
          "2.125rem",
          { lineHeight: "1.2", letterSpacing: "-0.01em" },
        ],
        "title-2": [
          "1.75rem",
          { lineHeight: "1.3", letterSpacing: "-0.005em" },
        ],
        "title-3": ["1.375rem", { lineHeight: "1.4" }],
        headline: ["1.0625rem", { lineHeight: "1.4", fontWeight: "600" }],
        body: ["1.0625rem", { lineHeight: "1.5" }],
        callout: ["1rem", { lineHeight: "1.4" }],
        subheadline: ["0.9375rem", { lineHeight: "1.4" }],
        footnote: ["0.8125rem", { lineHeight: "1.4" }],
        "caption-1": ["0.75rem", { lineHeight: "1.3" }],
        "caption-2": ["0.6875rem", { lineHeight: "1.3" }],
        "label-sm": ["0.875rem", { lineHeight: "1.25", fontWeight: "500" }],
      },
      boxShadow: {
        "fancy-buttons-neutral":
          "0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.05)",
        "fancy-buttons-primary":
          "0 1px 2px 0 rgba(0, 122, 255, 0.2), 0 4px 8px 0 rgba(0, 122, 255, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
        "fancy-buttons-error":
          "0 1px 2px 0 rgba(255, 59, 48, 0.2), 0 4px 8px 0 rgba(255, 59, 48, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
        "fancy-buttons-stroke":
          "0 0 0 1px rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      },
      backgroundColor: {
        "bg-white-0": "#FFFFFF",
        "bg-weak-50": "#F2F2F7",
        "bg-strong-950": "#1C1C1E",
      },
      textColor: {
        "text-white-0": "#FFFFFF",
        "text-sub-600": "#8E8E93",
        "text-strong-950": "#1C1C1E",
        "text-disabled-300": "#C7C7CC",
      },
    },
  },
  plugins: [],
};

export default config;

