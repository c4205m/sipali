import { defineConfig } from "vite"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import babel from "@rolldown/plugin-babel"
import { VitePWA } from "vite-plugin-pwa"
import basicSsl from "@vitejs/plugin-basic-ssl"
import { fileURLToPath, URL } from "node:url"

export default defineConfig({
  base: "/sipali/",
  server: { host: true },
  preview: { host: true },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    basicSsl(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "favicon.ico", "favicon-96x96.png", "apple-touch-icon.png"],
      manifest: {
        name: "sipali — finance tracker",
        short_name: "sipali",
        description: "Personal finance tracker. Offline, local-first.",
        theme_color: "#05070f",
        background_color: "#05070f",
        display: "standalone",
        orientation: "portrait",
        id: "/sipali/",
        start_url: "/sipali/",
        scope: "/sipali/",
        icons: [
          { src: "web-app-manifest-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "web-app-manifest-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        // Cache the live exchange-rate API responses for offline use.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/(cdn\.jsdelivr\.net|latest\.currency-api\.pages\.dev)\/.*/,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "fx-rates" },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
})
