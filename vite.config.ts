import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("react-router-dom")) return "router";
          if (id.includes("@supabase/")) return "supabase";
          if (id.includes("@tanstack/react-query") || id.includes("@tanstack/query-core")) return "query";
          if (id.includes("react-hook-form") || id.includes("@hookform/resolvers") || id.includes("zod")) return "forms";
          if (id.includes("date-fns") || id.includes("react-day-picker")) return "dates";
          if (id.includes("sonner")) return "feedback";
          if (id.includes("class-variance-authority") || id.includes("clsx") || id.includes("tailwind-merge")) return "ui-utils";
          if (id.includes("lucide-react")) return "icons";
          if (id.includes("recharts")) return "charts";
          if (id.includes("@radix-ui")) return "radix";
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) return "react-vendor";
          return "vendor";
        },
      },
    },
  },
}));
