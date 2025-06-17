import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === "development" ? "/" : process.env.VITE_BASE_PATH || "/",
  optimizeDeps: {
    entries: ["src/main.tsx"],
  },
  plugins: [
    react(),
  ],
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // @ts-ignore
    allowedHosts: true,
    proxy: {
      '/api/inposta-shipment': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/inposta-shipment/, '/api/inposta-shipment'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('InPosta Proxy (Frontend -> Backend) error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying InPosta request (Frontend -> Backend):', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received InPosta response (Backend -> Frontend):', proxyRes.statusCode, req.url);
          });
        },
      },
      '/api/v1': {
        target: 'https://app.inpostaradeski.mk',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/v1/, '/api/v1'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('InPosta Direct Proxy (Frontend -> InPosta) error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying InPosta direct request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received InPosta direct response:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
  build: {
    target: 'es2017'
  }
});
