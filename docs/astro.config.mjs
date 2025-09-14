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
            // Each item here is one entry in the navigation menu.
            { label: 'Example Guide', slug: 'guides/example' },
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
