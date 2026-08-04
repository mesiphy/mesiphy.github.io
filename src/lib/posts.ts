import { getCollection, type CollectionEntry } from 'astro:content';
import { CATEGORIES } from '../consts';

export type Post = CollectionEntry<'posts'>;

/**
 * 站点唯一的文章入口。draft: true 的文章只在 dev 下可见，
 * 这样草稿可以安全地提交进仓库而不会出现在线上。
 */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function postUrl(post: Post): string {
  return `/posts/${post.id}/`;
}

/** 标签统计，按出现次数降序，同频次按字典序，保证构建输出稳定。 */
export function collectTags(posts: Post[]): Array<{ tag: string; count: number }> {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'zh-CN'));
}

/** 按分类分组，顺序跟随 consts.ts 里登记的顺序而不是文章数量。 */
export function groupByCategory(posts: Post[]) {
  return CATEGORIES.map((category) => ({
    category,
    posts: posts.filter((post) => post.data.category === category.name),
  }));
}

/** 按年份分组，用于归档页。 */
export function groupByYear(posts: Post[]): Array<{ year: number; posts: Post[] }> {
  const groups = new Map<number, Post[]>();
  for (const post of posts) {
    const year = post.data.date.getFullYear();
    const bucket = groups.get(year);
    if (bucket) bucket.push(post);
    else groups.set(year, [post]);
  }
  return [...groups.entries()]
    .map(([year, items]) => ({ year, posts: items }))
    .sort((a, b) => b.year - a.year);
}

const DOT_MATRIX_DATE = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'UTC',
});

/** 复古打印风的日期：2026.08.04 */
export function formatDate(date: Date): string {
  return DOT_MATRIX_DATE.format(date).replace(/\//g, '.');
}

/** machine-readable，给 <time datetime> 和 sitemap 用 */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * 中英混排的粗略阅读时间。中文按字数、英文按词数分别计，再取和。
 * 只是给读者一个量级参考，不追求精确。
 */
export function readingTime(body: string): number {
  const cjk = (body.match(/[一-鿿]/g) ?? []).length;
  const words = (body.match(/[A-Za-z0-9]+/g) ?? []).length;
  return Math.max(1, Math.round(cjk / 400 + words / 200));
}
