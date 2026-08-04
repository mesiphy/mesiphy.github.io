export const SITE_TITLE = '油墨手记';
export const SITE_DESCRIPTION = '学习记录、作品集与技术分享。知识分享、技术博客、AI 产品经理的思考。';
export const SITE_AUTHOR = 'mesiphy';
export const SITE_URL = 'https://mesiphy.github.io';

/** 每页文章数 */
export const PAGE_SIZE = 8;

/**
 * 分类：少而互斥。中文名用于展示，slug 用于 URL（避免中文被百分号编码）。
 * 新增分类需要同时在这里登记，content.config.ts 的 schema 会据此校验。
 */
export const CATEGORIES = [
  {
    name: '知识分享',
    slug: 'knowledge',
    description: '读书、哲学与人生思考的沉淀。',
  },
  {
    name: '技术博客',
    slug: 'tech',
    description: '工程实践、工具链与开发流程。',
  },
  {
    name: 'AI产品经理的思考',
    slug: 'ai-pm',
    description: '竞品分析、产品判断与行业观察。',
  },
] as const;

export type CategoryName = (typeof CATEGORIES)[number]['name'];

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name) as [string, ...string[]];

export function categoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function categoryByName(name: string) {
  return CATEGORIES.find((c) => c.name === name);
}

export const NAV_LINKS = [
  { href: '/posts/', label: '文章' },
  { href: '/archive/', label: '归档' },
  { href: '/tags/', label: '标签' },
  { href: '/search/', label: '搜索' },
  { href: '/about/', label: '关于' },
];
