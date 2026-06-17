// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vite plugin: serve docs/public/example/* in dev mode.
 *
 * In production Astro copies public/ into dist/ automatically, so static
 * files are served by the host. In dev, Vite's router intercepts /example/
 * before Astro's public-file handler runs. This plugin registers a middleware
 * that answers /example/* requests directly from the filesystem, before any
 * routing occurs.
 */
function serveExamplePreview() {
  const exampleDir = path.join(__dirname, 'public', 'example');
  return {
    name: 'serve-example-preview',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? '';
        if (!url.startsWith('/example')) return next();

        // Strip the /example prefix to get the file path within exampleDir
        let filePath = url.slice('/example'.length) || '/';
        // Strip query strings
        filePath = filePath.split('?')[0];
        // Resolve index.html for directory requests
        if (filePath.endsWith('/')) filePath += 'index.html';

        const abs = path.join(exampleDir, filePath);

        if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) return next();

        const ext = path.extname(abs).toLowerCase();
        const mimeTypes = {
          '.html': 'text/html; charset=utf-8',
          '.js':   'application/javascript',
          '.css':  'text/css',
          '.json': 'application/json',
          '.png':  'image/png',
          '.ico':  'image/x-icon',
          '.svg':  'image/svg+xml',
          '.woff2':'font/woff2',
          '.woff': 'font/woff',
          '.ttf':  'font/ttf',
        };
        res.setHeader('Content-Type', mimeTypes[ext] ?? 'application/octet-stream');
        res.setHeader('Cache-Control', 'no-store');
        fs.createReadStream(abs).pipe(res);
      });
    },
  };
}

// emb715/react-native-small-ui
// https://astro.build/config
export default defineConfig({
  site: 'https://small-ui.embthings.com',
  base: '/',
  vite: {
    plugins: [serveExamplePreview()],
  },
  integrations: [
    starlight({
      customCss: ['./src/custom.css'],
      title: 'React Native Small UI',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/emb715/react-native-small-ui',
        },
        {
          icon: 'npm',
          label: 'NPM',
          href: 'https://www.npmjs.com/package/react-native-small-ui',
        },
      ],
      sidebar: [
        {
          label: 'Getting Started',
          link: '/getting-started',
        },
        {
          label: 'Guides',
          items: [
            { label: 'Live Preview', slug: 'guides/live-preview' },
            { label: 'Variants', slug: 'guides/variants' },
            { label: 'Theming', slug: 'guides/theming' },
            { label: 'Platform & Color Mode Registry', slug: 'guides/platform-registry' },
            { label: 'Bundle Optimization', slug: 'guides/bundle-optimization' },
          ],
        },
        {
          label: 'Utilities',
          autogenerate: { directory: 'utilities' },
        },
        {
          label: 'Components',
          autogenerate: { directory: 'components' },
        },
      ],
    }),
  ],
});
