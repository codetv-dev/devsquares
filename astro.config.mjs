// @ts-check
import { defineConfig, envField } from 'astro/config';
import react from '@astrojs/react';
import clerk from '@clerk/astro';

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  output: 'server',

  env: {
      schema: {
          CONVEX_URL: envField.string({
              context: 'client',
              access: 'public',
          }),
      },
	},

  integrations: [react(), clerk()],
  adapter: netlify(),
});