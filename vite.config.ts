import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the build works both locally and on GitHub Pages
// (project sites are served from /<repo-name>/, relative paths avoid
// needing to hardcode the repo name here).
export default defineConfig({
  plugins: [react()],
  base: './',
})
