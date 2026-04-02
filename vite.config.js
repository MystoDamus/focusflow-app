import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

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
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "FocusFlow Guild",
        short_name: "FocusFlow",
        description: "Gamified study campaign with quests, flashcards, and boss battles.",
        theme_color: "#0b0714",
        background_color: "#0b0714",
        display: "standalone",
        start_url: "/",
      },
    }),
  ],
});
