import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(__dirname, "../..");

  // Load env from the repo root so `VITE_API_PORT` works with turbo/pnpm.
  const env = loadEnv(mode, repoRoot, "");

  const apiPortRaw = env.API_PORT || env.VITE_API_PORT || process.env.API_PORT || process.env.VITE_API_PORT;
  const apiPort = apiPortRaw ? Number(apiPortRaw) : 8799;
  const apiTarget =
    env.VITE_API_TARGET || process.env.VITE_API_TARGET || `http://127.0.0.1:${apiPort}`;

  const webPortRaw = env.WEB_PORT || env.VITE_WEB_PORT || process.env.WEB_PORT || process.env.VITE_WEB_PORT;
  const webPort = webPortRaw ? Number(webPortRaw) : 5173;

  return {
    plugins: [react()],
    server: {
      port: webPort,
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true
        }
      }
    }
  };
});
