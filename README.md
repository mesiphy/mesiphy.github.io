# 油墨手记

个人技术博客，部署在 GitHub Pages：<https://mesiphy.github.io/>

用 Astro 构建，纯静态输出，零客户端框架。设计基调是复古油墨打印机风格：浅暖灰米色纸面、深油墨字、极淡点阵纹理，标题走等宽字体制造打字机感。

## 本地开发

```bash
npm install     # 首次
npm run dev     # http://localhost:4321
npm run build   # 构建 + 生成搜索索引到 dist/
npm run preview # 预览 dist/ 的构建产物
npm run check   # TypeScript / Astro 类型检查
```

搜索索引由 Pagefind 在 `astro build` 之后生成，所以 **搜索功能只在 `build` + `preview` 下可用，`dev` 下是空的**。这是预期行为，不是 bug。

## 目录结构

```
content/posts/          文章源文件（纯 Markdown，刻意放在 src/ 外，方便整体迁移）
public/                 直接拷贝到站点根目录的静态资源（robots.txt、图片等）
src/
  consts.ts             站点标题、分类登记表、导航、每页条数
  content.config.ts     frontmatter 的 schema 校验
  lib/posts.ts          文章读取、排序、分组、日期与阅读时间格式化
  components/           Header / Footer / PostCard / TableOfContents / Pagination 等
  layouts/              BaseLayout（通用外壳）、PostLayout（文章页 + 侧边目录）
  pages/                路由。文件路径即 URL
  styles/global.css     设计系统：色板、字体栈、排版、代码块
.github/workflows/      GitHub Actions 自动部署
```

## 写一篇新文章

在 `content/posts/` 下新建 `.md` 文件。**文件名就是 URL**，所以用小写英文加连字符，不要用中文或空格。

```markdown
---
title: 文章标题
date: 2026-08-04
description: 一两句话说清这篇讲什么。会出现在列表页、搜索结果和分享卡片里。
category: 技术博客
tags: [Git, 工程实践]
draft: false
---

正文从这里开始。
```

frontmatter 字段说明：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `title` | 是 | 文章标题 |
| `date` | 是 | 发布日期，`YYYY-MM-DD` |
| `description` | 是 | 摘要，用于列表页和 SEO |
| `category` | 是 | 必须是 `知识分享` / `技术博客` / `AI产品经理的思考` 之一，写错构建会直接失败 |
| `tags` | 否 | 数组，自由添加，默认空 |
| `draft` | 否 | `true` 时只在 `npm run dev` 可见，不会发布到线上 |
| `updated` | 否 | 显著修订后填写，会在文章页显示"最后修订于" |

分类是刻意受限的：schema 从 `src/consts.ts` 的登记表生成，拼错分类名构建会报错而不是静默产生一个空分类页。新增分类需要先在 `src/consts.ts` 的 `CATEGORIES` 里登记。

草稿可以放心提交进仓库，`draft: true` 的文章不会出现在线上的任何位置，包括列表、归档、标签、RSS 和搜索索引。

## 部署

push 到 `main` 就会触发 `.github/workflows/deploy.yml`，构建并发布到 GitHub Pages。仓库设置里 Pages 的 Source 需要选 **GitHub Actions**（不是 Deploy from a branch）。

站点是用户站（仓库名 `mesiphy.github.io`），部署在域名根路径，所以 `astro.config.mjs` 里不需要配 `base`。如果将来改成项目仓库（比如 `/blog/`），必须同时设置 `base`，否则全站资源会 404。

## 换成自己的域名

1. 在 `public/` 下新建 `CNAME` 文件，内容是裸域名，例如 `example.com`
2. DNS 加解析：`A` 记录指向 GitHub Pages 的四个 IP，或用 `CNAME` 指向 `mesiphy.github.io`
3. 把 `src/consts.ts` 的 `SITE_URL` 和 `astro.config.mjs` 的 `site` 改成新域名，否则 sitemap、RSS 和 canonical 链接还指向旧地址
