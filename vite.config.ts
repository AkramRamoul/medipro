import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import obfuscatorPlugin from "rollup-plugin-obfuscator";

export default defineConfig(({ mode }) => {
  const isProduction = process.env.NODE_ENV === "production" || mode === "production";

  return {
    define: {
      global: "globalThis",
    },
    optimizeDeps: {
      include: ["buffer"],
    },
    plugins: [react()],
    base: "./",
    build: {
      outDir: "dist-react",
      rollupOptions: {
        plugins: [
          isProduction &&
            obfuscatorPlugin({
              options: {
                compact: true,
                controlFlowFlattening: false,
                deadCodeInjection: false,
                stringArray: true,
                stringArrayEncoding: ["base64"],
                stringArrayThreshold: 0.75,
                rotateStringArray: true,
                selfDefending: false,
                debugProtection: false,
              },
            }),
        ].filter(Boolean),
      },
    },
    server: {
      port: 5123,
      strictPort: true,
    },
  };
});
