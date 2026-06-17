// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// emb715/react-native-small-ui
// https://astro.build/config
export default defineConfig({
  site: 'https://small-ui.embthings.com',
  base: '/',
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
