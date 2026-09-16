import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Custom Vite middleware to proxy OpenStreetMap Nominatim reverse geocode server-side
// Completely eliminates browser CORS and 403 blocks, returning full street/locality address
const reverseGeocodePlugin = () => ({
  name: 'reverse-geocode-plugin',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url && req.url.startsWith('/api/geocode/reverse')) {
        try {
          const parsedUrl = new URL(req.url, 'http://localhost:3000');
          const lat = parsedUrl.searchParams.get('lat');
          const lon = parsedUrl.searchParams.get('lon');
          if (!lat || !lon) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Latitude and Longitude are required' }));
            return;
          }
          const osmRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'AnujEnterprisesApp/1.0 (contact@anujenterprises.com)',
                'Accept': 'application/json'
              }
            }
          );
          if (!osmRes.ok) {
            res.statusCode = osmRes.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: `Upstream error ${osmRes.status}` }));
            return;
          }
          const data = await osmRes.json();
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify(data));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
        return;
      }
      next();
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), reverseGeocodePlugin()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  esbuild: {
    drop: ['console', 'debugger'],
    legalComments: 'none'
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    minify: 'esbuild',
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-charts': ['recharts'],
          'vendor-xlsx': ['xlsx'],
          'vendor-motion': ['framer-motion'],
          'vendor-icons': ['lucide-react']
        }
      }
    }
  }
});
