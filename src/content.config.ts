import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { CATEGORY_NAMES } from './consts';

/**
 * 正文源文件放在仓库根目录的 content/posts/ 下，是纯 Markdown + frontmatter。
 * 刻意不放进 src/，这样换框架时内容目录可以整体搬走。
 */
const posts = defineCollection({
  loader: glob({ base: './content/posts', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    category: z.enum(CATEGORY_NAMES),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    /** 可选：显著修订后填写，会在文章页显示 */
    updated: z.coerce.date().optional(),
  }),
});

export const collections = { posts };
