import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Serve clean routes (e.g. /diagnostic, /snapshot) as their .html entry in
 * dev + preview, mirroring the production rewrites in vercel.json so links
 * work the same everywhere.
 */
function cleanRouteRewrite(): Plugin {
  const routes = ["diagnostic", "snapshot"];
  const rewrite = (req: { url?: string | undefined }) => {
    const url = req.url ?? "";
    for (const route of routes) {
      if (url === `/${route}` || url.startsWith(`/${route}?`)) {
        req.url = `/${route}.html`;
        return;
      }
    }
  };
  return {
    name: "clean-route-rewrite",
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
  plugins: [react(), cleanRouteRewrite()],
  server: {
    port: 5173,
    open: false,
  },
  build: {
    rollupOptions: {
      input: {
        // The free Sold-Out Gap Calculator (unchanged).
        main: "index.html",
        // The Sold-Out Stage Diagnostic V0.
        diagnostic: "diagnostic.html",
        // The Sold-Out Snapshot Generator V0 (internal builder + founder view).
        snapshot: "snapshot.html",
      },
    },
  },
});
