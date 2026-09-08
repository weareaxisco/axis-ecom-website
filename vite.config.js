import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom')) return 'vendor-react-dom'
          if (id.includes('node_modules/react-router')) return 'vendor-router'
          if (id.includes('node_modules/react/')) return 'vendor-react'
          if (id.includes('node_modules/@supabase/supabase-js')) return 'vendor-supabase'
          if (id.includes('node_modules/lucide-react')) return 'vendor-icons'
          return undefined
        },
      },
    },
    chunkSizeWarningLimit: 250,
  },
  server: {
    allowedHosts: ['lunchbox-secular-baguette.ngrok-free.dev'],
  },
})
