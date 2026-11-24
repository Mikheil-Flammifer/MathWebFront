import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.DEV_PROXY_TARGET || 'http://localhost:8080'

  return {
    plugins: [react(), tailwindcss()],
    test: {
      include: ['src/**/*.{test,spec}.{js,jsx}'],
    },
    server: {
      port: 5173,
      proxy: {
        '/api': { target, changeOrigin: false },
      },
    },
  }
})