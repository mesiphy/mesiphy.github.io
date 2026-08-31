export const SITE_TITLE = '未竟';
export const SITE_DESCRIPTION =
  'mesiphy 的个人站点。记录学习、技术实践、产品思考与正在发生的项目，以及那些仍未完成的问题。';
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
    description: '读书、学习，以及对世界尚未完成的理解。',
  },
  {
    name: '技术博客',
    slug: 'tech',
    description: '工程实践、工具链、开发过程与踩过的坑。',
  },
  {
    name: 'AI产品经理的思考',
    slug: 'ai-pm',
    description: '产品判断、竞品分析，以及仍在变化中的行业观察。',
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
  { href: '/projects/', label: '项目' },
  { href: '/graph/', label: '脉络' },
  { href: '/archive/', label: '归档' },
  { href: '/tags/', label: '标签' },
  { href: '/search/', label: '搜索' },
  { href: '/about/', label: '关于' },
];

/**
 * 知识脉络图：每个分类一张外部生成的图片，首页右栏竖排缩略图，/graph/ 放大图。
 *
 * 换图流程就是覆盖 src/assets/graph/knowledge-graph-<分类slug>.* 这个文件，
 * 不用改代码：扩展名不限（png / jpg / webp / avif / svg 都认），尺寸和
 * 「更新于」日期都在构建时从文件本身读出来。当前三个分类对应：
 *   knowledge-graph-knowledge.png
 *   knowledge-graph-tech.png
 *   knowledge-graph-ai-pm.png
 * 文件名由上面 CATEGORIES 的 slug 推导，新增分类会自动多出一个位子。
 *
 * 一个分类一张而不是合成一张：分类之间刻意互斥，本来就没有枝干可连，
 * 合成图只会让生图模型为了构图饱满而硬连几笔并不存在的边。
 *
 * 放 src/assets/ 而不是 public/ 是为了让 Astro 接手压缩、转 webp、推断宽高
 * （宽高进了 HTML 才不会加载时抖一下），代价是换图后要重新构建。
 */
export const GRAPH = {
  /** 图片目录与文件名前缀，实际文件是 `${dir}${prefix}-${分类slug}.${扩展名}` */
  dir: 'src/assets/graph/',
  prefix: 'knowledge-graph',
  title: '知识脉络',
  href: '/graph/',
  description: '每个栏目一张脉络图：每篇文章是一个节点，相近的主题连成枝干。',
} as const;

/** 脉络图的 alt。图本身传达不了内容，只能交代它是什么、怎么读。 */
export function graphAlt(categoryName: string): string {
  return `${categoryName}栏目的知识脉络图。该栏目的文章组成一棵树状图谱，每篇文章是一个节点，主题相近的文章之间以枝干相连。`;
}
