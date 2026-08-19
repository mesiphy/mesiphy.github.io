// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import satteriDiagrams from './src/plugins/satteri-diagrams.mjs';

// 用户站（仓库名 mesiphy.github.io）部署在域名根路径，因此不需要配置 base。
// 如果将来改成项目仓库（例如 /blog/），必须同时设置 base，否则全站资源 404。
export default defineConfig({
  site: 'https://mesiphy.github.io',
  integrations: [sitemap()],
  markdown: {
    processor: satteri({
      mdastPlugins: [
        satteriDiagrams({ server: process.env.KROKI_BASE_URL ?? 'https://kroki.io' }),
      ],
    }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
