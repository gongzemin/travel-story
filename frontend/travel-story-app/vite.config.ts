import { sentryVitePlugin } from '@sentry/vite-plugin'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    sentryVitePlugin({
      org: 'nextmin',
      project: 'javascript-react',
    }),
  ],

  build: {
    sourcemap: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        // rewrite: path => path.replace(/^\/api/, ''), // 代理去掉 /api
      },
    },
  },
})
