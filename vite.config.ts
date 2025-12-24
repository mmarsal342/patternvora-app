
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      // REMOVED COOP/COEP headers - they block Tailwind CDN!
      // These headers are only needed in production (vercel.json) for FFmpeg
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'prompt', // Show update prompt instead of auto-update
        includeAssets: ['favicon.svg', 'robots.txt'],
        manifest: {
          name: 'PatternVora - Infinite Pattern Generator',
          short_name: 'PatternVora',
          description: 'Generate infinite high-fidelity pattern assets in seconds. Perfect for stock contributors, brand designers, and content creators.',
          theme_color: '#4f46e5',
          background_color: '#f8fafc',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          categories: ['design', 'graphics', 'productivity'],
          icons: [
            {
              src: '/icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icons/maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ],
          screenshots: [
            {
              src: '/screenshots/desktop.png',
              sizes: '1920x1080',
              type: 'image/png',
              form_factor: 'wide',
              label: 'PatternVora Desktop'
            },
            {
              src: '/screenshots/mobile.png',
              sizes: '750x1334',
              type: 'image/png',
              form_factor: 'narrow',
              label: 'PatternVora Mobile'
            }
          ]
        },
        workbox: {
          // Cache strategies
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              // Don't cache API calls - always network first
              urlPattern: /^https:\/\/patternvora-api\..*\.workers\.dev\/.*/i,
              handler: 'NetworkOnly'
            }
          ],
          // Don't precache large files
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB
        },
        devOptions: {
          enabled: false // Disable in dev to avoid confusion
        }
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    worker: {
      format: 'es'
    },
    optimizeDeps: {
      exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
    }
  };
});
