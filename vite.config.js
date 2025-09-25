import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        type: 'module'
      },
      manifest: {
        name: 'Time Tracker',
        short_name: 'TimeTracker',
        description: 'A simple time tracking and scheduling application',
        start_url: '.',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#3b82f6',
        icon: 'src/assets/favicon.ico'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  server: {
    port: 4000
  },
  build: {
    outDir: 'dist'
  }
})