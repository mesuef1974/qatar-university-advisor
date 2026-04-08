import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({ jsxRuntime: 'automatic' })],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['jspdf'],
  },
  build: {
    rollupOptions: {
      // ENG-002: تجاهل استيرادات jspdf الاختيارية
      external: ['canvg', 'html2canvas', 'dompurify'],
      output: {
        // ENG-002: Code splitting — فصل المكتبات الكبيرة لتحسين التحميل
        manualChunks(id) {
          if (id.includes('react-dom') || id.includes('react')) return 'vendor';
          if (id.includes('@supabase/supabase-js')) return 'supabase';
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
})
