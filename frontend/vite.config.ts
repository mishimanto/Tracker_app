import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react-router-dom') || id.includes('react-dom') || id.includes('/react/')) {
            return 'react';
          }
          if (id.includes('@tanstack/react-query')) {
            return 'query';
          }
          if (id.includes('framer-motion') || id.includes('@headlessui/react')) {
            return 'motion';
          }
          if (id.includes('recharts') || id.includes('date-fns')) {
            return 'charts';
          }
          if (id.includes('react-hook-form') || id.includes('@hookform/resolvers') || id.includes('/yup/')) {
            return 'forms';
          }
          if (id.includes('html2pdf.js')) {
            return 'pdf';
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
