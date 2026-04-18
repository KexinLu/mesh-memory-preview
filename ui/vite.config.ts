import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// Read `.env` from the deploy-kit root so the UI and docker-compose
// share a single config surface. When shipped inside `~/.mesh-memory`,
// VITE_API_URL / VITE_API_TOKEN live next to DASHSCOPE_API_KEY /
// LLM_PROVIDER in one file.
export default defineConfig({
  plugins: [react()],
  envDir: path.resolve(__dirname, '..'),
  server: {
    port: 4200,
  },
})
