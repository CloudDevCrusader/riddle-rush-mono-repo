# Local Development Guide for Riddle Rush

This guide provides comprehensive instructions for setting up and running Riddle Rush locally for development and testing.

## 🚀 Quick Start

### Prerequisites

- **Node.js** v20+ (LTS recommended)
- **pnpm** v10+ (`npm install -g pnpm`)
- **Git** (for version control)
- **VS Code** (recommended IDE) with extensions:
  - ESLint
  - Prettier
  - Vue Language Features (Volar)

### Installation

```bash
# Clone the repository
git clone https://gitlab.com/your-repo/riddle-rush-nuxt-pwa.git
cd riddle-rush-nuxt-pwa

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Your app will be available at: `http://localhost:3000`

## 📱 Development Modes

### Standard Development

```bash
pnpm dev
```

- **Port**: 3000
- **Host**: localhost
- **Features**: Hot module replacement, error overlay, debug console

### Debug Mode

```bash
pnpm dev:debug
```

- **Additional**: Detailed logging, verbose output
- **Use case**: Troubleshooting complex issues

### Mobile Testing

```bash
pnpm dev:mobile
```

- **Host**: 0.0.0.0 (accessible on local network)
- **Use case**: Testing on physical devices

### HTTPS Mode (for PWA)

```bash
pnpm dev:https
```

- **Protocol**: HTTPS
- **Required for**: Service Worker, PWA installation
- **Use case**: Testing PWA features

### Mobile + HTTPS

```bash
pnpm dev:mobile-https
```

- **Combines**: Network access + HTTPS
- **Use case**: Full PWA testing on mobile devices

## 📱 Mobile Device Testing

### iOS (iPhone/iPad)

1. **Connect** your device to the same WiFi network as your computer
2. **Run** development server: `pnpm dev:mobile`
3. **Find your computer's IP**:
   - Mac: `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - Windows: `ipconfig` (look for IPv4 address)
4. **On device**: Open Safari and navigate to `http://[your-ip]:3000`
5. **PWA Testing**: Use "Add to Home Screen"

### Android

1. **Connect** your device to the same WiFi network
2. **Run** development server: `pnpm dev:mobile`
3. **Find your computer's IP** (see above)
4. **On device**: Open Chrome and navigate to `http://[your-ip]:3000`
5. **PWA Testing**: Use "Add to Home screen"

### Common Mobile Testing Issues

| Issue                    | Solution                                     |
| ------------------------ | -------------------------------------------- |
| Can't connect to server  | Check firewall settings, ensure same network |
| Slow performance         | Use USB debugging instead of WiFi            |
| PWA install not working  | Use HTTPS mode (`pnpm dev:https`)            |
| Touch events not working | Check viewport meta tag, test on real device |

## 🧪 Testing

### Unit Tests

```bash
# Run unit tests
pnpm test:unit

# Run with coverage
pnpm test:unit:coverage

# Watch mode
pnpm test
```

### End-to-End Tests

```bash
# Run E2E tests
pnpm test:e2e

# Run with UI
pnpm test:e2e:ui

# Run specific test
pnpm test:e2e --grep "test name"
```

### Testing on Different Devices

Use Chrome DevTools Device Toolbar:

1. Open DevTools (F12)
2. Click "Toggle Device Toolbar" (Ctrl+Shift+M)
3. Select device from dropdown
4. Test responsive behavior

## 🐛 Debugging

### Common Issues & Solutions

#### Port 3000 already in use

```bash
# Find process using port (Mac/Linux)
lsof -i :3000

# Find process using port (Windows)
netstat -ano | findstr :3000

# Kill process (Mac/Linux)
kill -9 <PID>

# Kill process (Windows)
taskkill /PID <PID> /F
```

#### Build fails

```bash
# Clean and rebuild
rm -rf .nuxt .output
pnpm install
pnpm dev
```

#### Hot reload not working

```bash
# Clear cache and restart
pnpm dev --clear
```

#### Missing dependencies

```bash
# Reinstall dependencies
rm -rf node_modules
pnpm install
```

### Debugging Tools

#### Vue DevTools

- Install from Chrome Web Store
- Works with development builds
- Inspect component hierarchy, state, events

#### Network Debugging

- Chrome DevTools > Network tab
- Check XHR requests, WebSocket connections
- Test API responses

#### Performance Debugging

- Chrome DevTools > Performance tab
- Record and analyze performance
- Check for rendering bottlenecks

## 🔧 Configuration

### Environment Variables

Create `.env` file in project root:

```env
# Development
NODE_ENV=development
BASE_URL=/
DEBUG=riddle-rush:*

# Testing
# NODE_ENV=test
# CI=true
```

### Nuxt Configuration

Key configuration files:

- `nuxt.config.ts` - Main Nuxt configuration
- `app.vue` - Root component
- `layouts/default.vue` - Default layout

## 📦 Building for Production

### Standard Build

```bash
pnpm build
```

### Debug Build

```bash
pnpm build:debug
```

### Static Generation

```bash
pnpm generate
```

### Preview Production Build

```bash
pnpm preview
```

### Preview with HTTPS

```bash
pnpm preview:https
```

## 📦 Deployment

### Local Preview

```bash
# Build and preview
pnpm generate
pnpm preview
```

### Test Deployment

```bash
# Test on Netlify/Vercel locally
pnpm build
npx serve .output/public
```

## 🎯 Best Practices

### Code Quality

```bash
# Lint code
pnpm lint

# Fix lint issues
pnpm lint:fix

# Format code
pnpm format

# Type checking
pnpm typecheck
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Commit changes
git add .
git commit -m "feat: add amazing feature"

# Push to remote
git push origin feature/your-feature
```

### Performance Optimization

- Use lazy loading for components: `<LazyComponent />`
- Optimize images (use WebP format)
- Minimize JavaScript bundle size
- Use CSS containment for complex components

## 📚 Resources

### Documentation

- [Nuxt 4 Documentation](https://nuxt.com/docs)
- [Vue 3 Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)

### Tools

- [Vue DevTools](https://devtools.vuejs.org/)
- [Nuxt DevTools](https://devtools.nuxt.com/)
- [Playwright](https://playwright.dev/)
- [Vitest](https://vitest.dev/)

### Community

- [Nuxt Discord](https://discord.com/invite/nuxt)
- [Vue Forum](https://forum.vuejs.org/)
- [GitHub Discussions](https://github.com/nuxt/nuxt/discussions)

## 🎉 Tips & Tricks

1. **Use `pnpm dev:debug`** for detailed logging when troubleshooting
2. **Clear cache** with `rm -rf .nuxt .output` when experiencing weird issues
3. **Test on real devices** for accurate touch and performance testing
4. **Use HTTPS mode** when testing PWA features like service workers
5. **Leverage Chrome DevTools** for debugging and performance analysis
6. **Run tests frequently** to catch issues early
7. **Use the Vue DevTools** to inspect component state and events

## 📞 Support

For additional help:

- Check the [troubleshooting guide](#-debugging)
- Review the [common issues](#-common-issues--solutions)
- Consult the [documentation](#-resources)
- Ask in the [community channels](#-community)

Happy coding! 🚀
