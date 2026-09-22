import { defineCollection, reference } from 'astro:content';
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

const cover = z.string().refine(
  (value) => /^\/(?!\/)/.test(value) || /^https:\/\//.test(value),
  '封面必须是 / 开头的站内路径或 HTTPS 图片地址',
).optional();

const albums = defineCollection({
  loader: glob({ base: './content/albums', pattern: '*.md' }),
  schema: z.object({
    title: z.string().min(1),
    date: z.coerce.date(),
    released: z.coerce.date().optional(),
    neteaseId: z.string().regex(/^[1-9]\d*$/).optional(),
    description: z.string().min(1),
    cover,
    draft: z.boolean().default(false),
    updated: z.coerce.date().optional(),
  }),
});

const music = defineCollection({
  loader: glob({ base: './content/music', pattern: '*.md' }),
  schema: z.object({
    title: z.string().min(1),
    artist: z.string().min(1),
    album: reference('albums'),
    trackNumber: z.number().int().positive(),
    date: z.coerce.date(),
    released: z.coerce.date().optional(),
    tags: z.array(z.string().trim().min(1)).default([]),
    // 保留为字符串，避免平台 ID 被数值转换改变。
    neteaseId: z.string().regex(/^[1-9]\d*$/, '请填写引号包围的网易云歌曲 ID'),
    description: z.string().min(1),
    noteType: z.enum(['创作感想', '听后感']).default('创作感想'),
    cover,
    // 未验证或不支持外链的曲目只提供原平台链接。
    embed: z.boolean().default(false),
    draft: z.boolean().default(false),
    updated: z.coerce.date().optional(),
  }),
});

export const collections = { posts, albums, music };
