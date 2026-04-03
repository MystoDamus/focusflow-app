import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          ui: ["lucide-react"],
          backend: ["@supabase/supabase-js"],
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
  plugins: [
    react(),
  ],
});
