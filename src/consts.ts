export const SITE_TITLE = '惚恍';
export const SITE_DESCRIPTION =
  'mesiphy 的个人站点。留下音乐与心绪，记录学习、技术实践、产品思考和正在发生的项目。';
export const SITE_AUTHOR = 'mesiphy';
export const SITE_URL = 'https://mesiphy.github.io';

/** 每页文章数 */
export const PAGE_SIZE = 8;

/**
 * 栏目：每篇文章只有一个主栏目，交叉主题由标签表达。
 * 中文名用于 frontmatter 和展示，slug 用于路由和脉络图，href 是统一入口。
 * 新增分类需要同时在这里登记，content.config.ts 的 schema 会据此校验。
 */
export const CATEGORIES = [
  {
    name: '知识笔记',
    slug: 'knowledge',
    href: '/knowledge/',
    description: '读书、学习，记录通用技术与工具实践。',
  },
  {
    name: '惚恍',
    slug: 'huhuang',
    href: '/huhuang/',
    description: '个人感悟、情绪与自我理解，留下尚未成形的思考。',
  },
  {
    name: 'AI',
    slug: 'ai',
    href: '/ai/',
    description: 'AI 学习、辅助编程、产品方法与项目实践。',
  },
] as const;

export type CategoryName = (typeof CATEGORIES)[number]['name'];
export type CategorySlug = (typeof CATEGORIES)[number]['slug'];

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name) as [CategoryName, ...CategoryName[]];

export function categoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function categoryByName(name: string) {
  return CATEGORIES.find((c) => c.name === name);
}

export const NAV_LINKS = [
  { href: '/', label: '首页' },
  { href: '/music/', label: '音乐' },
  ...CATEGORIES.map(({ href, name }) => ({ href, label: name })),
];

export const CONTENT_NAV_LINKS = [
  { href: '/posts/', label: '全部文章' },
  { href: '/graph/', label: '脉络' },
  { href: '/archive/', label: '归档' },
  { href: '/tags/', label: '标签' },
  { href: '/search/', label: '搜索' },
];

/**
 * 知识脉络图：每个栏目一张外部生成的图片，在 /graph/ 展示。
 *
 * 换图流程就是覆盖 src/assets/graph/knowledge-graph-<分类slug>.* 这个文件，
 * 不用改代码：扩展名不限（png / jpg / webp / avif / svg 都认），尺寸和
 * 「更新于」日期都在构建时从文件本身读出来。当前三个栏目对应：
 *   knowledge-graph-knowledge.png
 *   knowledge-graph-huhuang.png
 *   knowledge-graph-ai.png
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
