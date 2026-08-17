import fs from 'node:fs';
import path from 'node:path';
import type { ImageMetadata } from 'astro';
import { CATEGORIES, GRAPH, graphAlt } from '../consts';

/**
 * 知识脉络图的解析。图片是外部生成后丢进 src/assets/graph/ 的，
 * 这里负责在构建时把它们找出来，顺带读出「更新于」日期。
 *
 * 只在构建期（SSG）跑，所以可以直接用 node:fs。
 * 注意：这个模块不能被 client:* 组件引入，否则打包会报解析不到 node:fs。
 */

/**
 * glob 的模式必须是字面量（构建时静态分析），没法按 slug 拼，
 * 所以一次捞出所有分类的图，再在下面按 slug 分派。
 * 扩展名放开是为了换图时直接覆盖文件，不用回来改代码。
 */
const matches = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/graph/knowledge-graph-*.{png,jpg,jpeg,webp,avif,svg}',
  { eager: true },
);

/** 同名多扩展名同时存在时的取用顺序，保证构建输出稳定而不是看文件系统心情 */
const EXT_PRIORITY = ['avif', 'webp', 'png', 'jpg', 'jpeg', 'svg'];

function extRank(p: string): number {
  const ext = p.split('.').pop()?.toLowerCase() ?? '';
  const i = EXT_PRIORITY.indexOf(ext);
  return i === -1 ? EXT_PRIORITY.length : i;
}

/** 从路径里取出 slug：.../knowledge-graph-ai-pm.png → ai-pm */
function slugOf(globPath: string): string {
  const filename = globPath.split('/').pop() ?? '';
  return filename.slice(`${GRAPH.prefix}-`.length).replace(/\.[^.]+$/, '');
}

/**
 * 文件的最后修改时间，当作脉络图的更新日期。读不到就不显示日期。
 *
 * 从项目根目录拼路径，而不是用 import.meta.url 去相对定位 ——
 * SSR 打包后 import.meta.url 指向 chunk 的位置，相对解析会落空。
 * 构建始终在项目根执行，所以 cwd 是可靠的基准。
 */
function mtimeOf(globPath: string): Date | undefined {
  const filename = globPath.split('/').pop();
  if (!filename) return undefined;
  try {
    return fs.statSync(path.join(process.cwd(), GRAPH.dir, filename)).mtime;
  } catch {
    return undefined;
  }
}

export interface GraphImage {
  src: ImageMetadata;
  /** SVG 走原生 img，不进 Astro 的位图压缩管线 */
  isVector: boolean;
  updated?: Date;
}

export interface CategoryGraph {
  category: (typeof CATEGORIES)[number];
  alt: string;
  /** 该分类的文章篇数，即节点数 */
  count: number;
  /** 没放图时为 undefined，页面据此显示占位提示而不是渲染碎图 */
  image?: GraphImage;
  /** 缺图时提示该把文件放哪，免得日后翻代码 */
  expectedFile: string;
}

/** slug → 图片，取扩展名优先级最高的那张 */
function resolveBySlug(): Map<string, GraphImage> {
  const best = new Map<string, { globPath: string; src: ImageMetadata }>();

  for (const [globPath, mod] of Object.entries(matches)) {
    const slug = slugOf(globPath);
    const current = best.get(slug);
    if (
      !current ||
      extRank(globPath) < extRank(current.globPath) ||
      (extRank(globPath) === extRank(current.globPath) && globPath < current.globPath)
    ) {
      best.set(slug, { globPath, src: mod.default });
    }
  }

  return new Map(
    [...best].map(([slug, { globPath, src }]) => [
      slug,
      { src, isVector: src.format === 'svg', updated: mtimeOf(globPath) },
    ]),
  );
}

/**
 * 每个分类一项，顺序跟随 consts.ts 里登记的顺序。
 * 缺图的分类也会返回（image 为 undefined），这样首页能提示该补哪张图。
 *
 * counts 由调用方传入：这个模块不碰 content collection，
 * 免得把 node:fs 的依赖扩散到内容层。
 */
export function getCategoryGraphs(counts: Map<string, number>): CategoryGraph[] {
  const bySlug = resolveBySlug();

  return CATEGORIES.map((category) => ({
    category,
    alt: graphAlt(category.name),
    count: counts.get(category.name) ?? 0,
    image: bySlug.get(category.slug),
    expectedFile: `${GRAPH.prefix}-${category.slug}.png`,
  }));
}

/**
 * 生成 srcset 用的宽度：按容器实际显示宽度的 1x / 2x 取，
 * 并且不超过原图宽度 —— 放大只会让 Astro 报警且徒增体积。
 */
export function widthsFor(displayWidth: number, natural: number): number[] {
  const wanted = [displayWidth, displayWidth * 2];
  const capped = wanted.map((w) => Math.min(Math.round(w), natural));
  return [...new Set(capped)].sort((a, b) => a - b);
}
