import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import proxyOptions from './proxyOptions';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      port: 8080,
      proxy: proxyOptions
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    build: {
      outDir: path.resolve(__dirname, "../trixapos/public/trixapos"), // ✅ Build to /trixapos/
      emptyOutDir: true,
      target: "es2015",
    },
    base: `/${env.VITE_BASE_NAME || "trixapos"}/`, // ✅ Ensure assets load correctly
  };
});
