import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Serve /diagnostic as /diagnostic.html in dev + preview, mirroring the
 * production rewrite in vercel.json so the link works the same everywhere.
 */
function diagnosticRewrite(): Plugin {
  const rewrite = (req: { url?: string | undefined }) => {
    const url = req.url ?? "";
    if (url === "/diagnostic" || url.startsWith("/diagnostic?")) {
      req.url = "/diagnostic.html";
    }
  };
  return {
    name: "diagnostic-rewrite",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        // @types/node isn't installed, so IncomingMessage is an empty stub.
        rewrite(req as unknown as { url?: string });
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewrite(req as unknown as { url?: string });
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), diagnosticRewrite()],
  server: {
    port: 5173,
    open: false,
  },
  build: {
    rollupOptions: {
      input: {
        // The free Sold-Out Gap Calculator (unchanged).
        main: "index.html",
        // The new Sold-Out Stage Diagnostic V0.
        diagnostic: "diagnostic.html",
      },
    },
  },
});
