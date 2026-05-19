import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cesium from 'vite-plugin-cesium'

// https://vite.dev/config/
// `base` matches the GitHub Pages subpath: https://<user>.github.io/firstrepo/
export default defineConfig({
  base: '/firstrepo/',
  plugins: [react(), cesium()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
