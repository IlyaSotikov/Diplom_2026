import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const isApacheMode = mode === 'apache'

  return {
    plugins: [react()],
    base: isApacheMode ? '/Diplom_2026/server/public/app/' : '/',
    build: isApacheMode
      ? {
          outDir: '../server/public/app',
          emptyOutDir: true,
        }
      : undefined,
    server: {
      port: 5173,
      strictPort: true,
    },
  }
})

