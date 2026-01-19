import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "app-icon.png", "splash-screen.png", "toothyquest-logo.jpeg"],
      manifest: {
        name: "ToothyQuest - Make Brushing Fun!",
        short_name: "ToothyQuest",
        description: "Join Toothy on magical dental adventures! Kids explore 50+ quests learning brushing, flossing & healthy habits.",
        theme_color: "#2AAAA5",
        background_color: "#FEF3E2",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        id: "/",
        categories: ["kids", "education", "health", "games"],
        lang: "en",
        dir: "ltr",
        prefer_related_applications: false,
        icons: [
          {
            src: "/app-icon.png",
            sizes: "72x72",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/app-icon.png",
            sizes: "96x96",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/app-icon.png",
            sizes: "128x128",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/app-icon.png",
            sizes: "144x144",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/app-icon.png",
            sizes: "152x152",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/app-icon.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/app-icon.png",
            sizes: "384x384",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/app-icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/app-icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "/splash-screen.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide",
            label: "ToothyQuest Home Screen",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5,
              },
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
