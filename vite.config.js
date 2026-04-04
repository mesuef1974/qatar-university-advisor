import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // ENG-002: Code splitting — فصل المكتبات الكبيرة لتحسين التحميل
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:   ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
    // تحذير عند تجاوز 500 KB لأي chunk
    chunkSizeWarningLimit: 500,
  },
})
