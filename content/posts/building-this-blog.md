---
title: 用 Astro 和 GitHub Pages 搭一个博客
date: 2026-08-04
description: 从零开始搭建这个站点的过程记录。为什么先打通发布管道再谈设计，以及内容目录为什么要放在框架之外。
category: 技术博客
tags: [Astro, GitHub Pages, 静态站点, 建站]
---

搭博客最容易犯的错，是先花两周挑主题、调配色，最后卡在部署上，站点从来没有真正上线过。所以这次的顺序是反过来的：先让一篇最简陋的文章能自动发布到公网，链路通了，再往上叠设计。

## 为什么选 Astro

候选方案有三个，各有各的代价。

| 方案 | 优点 | 代价 |
| --- | --- | --- |
| Astro | 原生吃 Markdown，默认零 JS，自定义样式阻力小 | 依赖 Node 生态，包比较多 |
| Hugo | 单二进制，构建快，十年后大概还能跑 | Go template 语法别扭，自定义设计曲线陡 |
| 手写 HTML | 完全可控，最适合学原理 | 归档、标签、RSS 都要自己实现 |

决定性的因素是「自定义设计的阻力」。我对视觉有明确想法，而 Astro 让我可以直接写 CSS，不需要先跟模板语法搏斗。

## 内容目录放在框架之外

这是整个项目里最重要的一个决定。文章源文件不放在 `src/` 里，而是放在仓库根目录：

```
content/posts/       ← 纯 Markdown，可以整体搬走
src/                 ← 框架相关的一切
public/images/       ← 静态资源
```

Astro 的 content collections 用 glob loader 指向仓库外层目录：

```ts
const posts = defineCollection({
  loader: glob({ base: './content/posts', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    category: z.enum(CATEGORY_NAMES),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});
```

这样做的好处是：三年后如果 Astro 不维护了，或者我想换 Hugo，`content/` 整个目录直接拷走就行，一个字都不用改。框架是会过期的，Markdown 不会。

顺带一个收益是 schema 校验。`category` 用 `z.enum` 限定在登记过的分类里，写错分类名构建就会报错，而不是默默生成一个孤儿页面。

## URL 里不放日期

`/posts/slug/` 这种扁平结构，比 `/2026/08/04/slug/` 稳得多。原因很实际：文章改期是常事，一旦日期进了 URL，改期就等于制造死链。

分类同样不进 URL。分类写在 frontmatter 里，源文件全部平铺在 `content/posts/` 下。想按分类浏览就走 `/categories/tech/` 这样的独立路由，文章本身的地址不受影响。

## 草稿可以安全地提交

`draft: true` 的文章只在开发环境可见：

```ts
const posts = await getCollection(
  'posts',
  ({ data }) => import.meta.env.DEV || !data.draft,
);
```

写了一半的东西可以放心 commit 进仓库，不会漏到线上。这比「本地留着不提交」靠谱得多，至少不会因为换电脑丢稿。

## 部署

用户站的仓库名必须是 `<用户名>.github.io`，站点就落在域名根路径。这里有个新手常踩的坑：

> 如果用的是普通仓库（比如叫 `blog`），站点地址会带 `/blog/` 后缀，此时 `astro.config.mjs` 里必须同时设置 `base`。配错的结果是页面能打开但样式全 404，看起来像是「设计没生效」，其实是路径问题。

GitHub Actions 部分是标准配方：push 到 main 触发构建，产物交给 `deploy-pages`。整套流程跑完大概一分半。

## 关于中文排版

有两件事值得单独说。

第一，别用 Google Fonts 加载中文字体。一个中文字重动辄好几 MB，首屏会明显发白。这个站点全部走系统字体栈，标题用等宽字体制造打字机感，正文交给系统的中文无衬线。零字体请求。

第二，中文正文一行 30 到 40 字最舒服，对应大约 34em。行高 1.75，字号 17px 起步——中文在 16px 以下笔画容易发虚，尤其在低分屏上。

## 下一步

现在的状态是：结构、样式、归档、标签、分页、搜索、RSS 都跑通了。接下来是往 `content/posts/` 里填东西，这部分没有任何技术含量，只有写不写的区别。
