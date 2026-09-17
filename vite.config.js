import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { realpathSync } from 'node:fs'

// The dev server may be launched via the Windows 8.3 short path (SPACEI~1);
// resolve to the real long path so Vite's module resolution stays consistent.
const root = realpathSync.native(process.cwd())

export default defineConfig({
  root,
  plugins: [react()],
  server: {
    port: 5199,
    strictPort: true,
  },
})
