import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      input: {
        orchid: "orchid-3d.html"
      },
      output: {
        manualChunks: {
          three: ["three", "@react-three/fiber", "@react-three/drei"]
        }
      }
    }
  }
});
