import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * GitHub Pages has no server-side routing. Copying index.html to 404.html
 * lets a deep link such as /evermore/timeline still boot the app.
 */
function spaFallback(): { name: string; apply: 'build'; closeBundle: () => void } {
  return {
    name: 'evermore-spa-fallback',
    apply: 'build',
    closeBundle() {
      const outDir = resolve(process.cwd(), 'dist')
      try {
        const html = readFileSync(resolve(outDir, 'index.html'), 'utf8')
        writeFileSync(resolve(outDir, '404.html'), html)
      } catch {
        // Nothing to do: the build output is incomplete, the build itself already failed loudly.
      }
    },
  }
}

export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [
    react(),
    tailwindcss(),
    spaFallback(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'Evermore',
        short_name: 'Evermore',
        description: "A Universe of One's Own",
        lang: 'en',
        theme_color: '#080D14',
        background_color: '#080D14',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  server: {
    port: 5173,
    host: true,
  },
})
