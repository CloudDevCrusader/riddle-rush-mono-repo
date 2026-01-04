# PWA Icons

To generate PWA icons from the SVG template:

1. Use an online tool like https://realfavicongenerator.net/
2. Or use ImageMagick:

   ```bash
   convert pwa-icon-template.svg -resize 192x192 pwa-192x192.png
   convert pwa-icon-template.svg -resize 512x512 pwa-512x512.png
   ```

3. Or use the PWA Asset Generator:
   ```bash
   npx pwa-asset-generator pwa-icon-template.svg ./public
   ```

For now, the app will work without icons, but they should be added for a complete PWA experience.
