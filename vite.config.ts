import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ManifestOptions, VitePWA } from 'vite-plugin-pwa'

const manifest: Partial<ManifestOptions> = {
  name: "8248 FRC Scouting App",
  short_name: "FRC Scouting",
  description: "A scouting app made by FRC team 8248 to collect data about FRC matches during competitions",
  theme_color: "#16181C",
  icons: [
    {
      src: "/icon_64x64.png",
      sizes: "64x64",
      type: "image/png"
    },
    {
      src: "/icon_128x128.png",
      sizes: "128x128",
      type: "image/png"
    },
    {
      src: "/icon_192x192.png",
      sizes: "192x192",
      type: "image/png",
    },
    {
      src: "/icon_512x512.png",
      sizes: "512x512",
      type: "image/png"
    },
    {
      src: "/icon_512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any"
    },
  ]
}

const includeAssets = ['fonts/*.woff2', 'imgs/*.png']

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA({manifest, minify: false, includeAssets})],
})
