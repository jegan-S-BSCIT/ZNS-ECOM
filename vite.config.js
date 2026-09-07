import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      ignored: ['**/asset/**']
    }
  },
  build: {
    // Vendors change on a different clock than app code, so give them their
    // own long-lived chunks instead of busting one 500kB bundle per deploy.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('@supabase')) return 'supabase';
          if (id.includes('react-router')) return 'router';
          if (id.includes('/react-dom/') || id.includes('/react/') || id.includes('scheduler')) return 'react';
          return 'vendor';
        }
      }
    }
  }
});
