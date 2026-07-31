import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],

  build: {
    chunkSizeWarningLimit: 1200,

    rollupOptions: {
      input: {
        home: resolve(__dirname, "index.html"),
        about: resolve(__dirname, "about.html"),
        contact: resolve(__dirname, "contact.html"),
        project: resolve(__dirname, "project.html"),

        newrank: resolve(__dirname, "project-01-newrank.html"),
        newrankAnalysis: resolve(
          __dirname,
          "project-01-newrank-analysis.html"
        ),
        xgimiDomestic: resolve(
          __dirname,
          "project-02-xgimi-domestic.html"
        ),
        xgimiFootballAnalysis: resolve(
          __dirname,
          "project-02-xgimi-football-analysis.html"
        ),
        xgimiOverseas: resolve(
          __dirname,
          "project-03-xgimi-overseas.html"
        ),
        xgimiEdmAnalysis: resolve(
          __dirname,
          "project-03-xgimi-edm-analysis.html"
        ),
        graphicPoster: resolve(
          __dirname,
          "project-04-graphic-poster.html"
        ),
        modeling3d: resolve(
          __dirname,
          "project-05-3d-modeling.html"
        ),

        orchid: resolve(__dirname, "orchid-3d.html"),
      },

      output: {
        manualChunks: {
          three: [
            "three",
            "@react-three/fiber",
            "@react-three/drei",
          ],
        },
      },
    },
  },
});
