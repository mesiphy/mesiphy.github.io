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

## 日常更新速查

两件事：加文章、换脉络图。都是往固定位置放文件，然后提交。

| 要做什么 | 放哪 | 命名 |
| --- | --- | --- |
| 加一篇文章 | `content/posts/` | `小写英文-连字符.md`，文件名即 URL |
| 换某栏目的脉络图 | `src/assets/graph/` | `knowledge-graph-<栏目slug>.png` |
| 加图片、附件 | `public/` | 原样拷到站点根目录，正文里写 `/图片名.png` |

```bash
git add -A && git commit -m "post: 新文章标题" && git push
```

push 到 `main` 之后 GitHub Actions 自动构建部署，约一两分钟生效。**本地不需要跑 build**，但建议先 `npm run check` 拦一下 frontmatter 写错。

## 目录结构

```
content/posts/          文章源文件（纯 Markdown，刻意放在 src/ 外，方便整体迁移）
public/                 直接拷贝到站点根目录的静态资源（robots.txt、正文里引用的图片等）
src/
  assets/graph/         知识脉络图（走 Astro 资源管线，会被自动压缩）
  consts.ts             站点标题、分类登记表、导航、每页条数、脉络图配置
  content.config.ts     frontmatter 的 schema 校验
  lib/posts.ts          文章读取、排序、分组、日期与阅读时间格式化
  lib/graph.ts          构建时解析脉络图文件（按栏目 slug 匹配，读取修改时间）
  components/           Header / Footer / PostCard / KnowledgeGraph / TableOfContents 等
  layouts/              BaseLayout（通用外壳）、PostLayout（文章页 + 侧边目录）
  pages/                路由。文件路径即 URL
  styles/global.css     设计系统：色板、字体栈、排版、代码块
.github/workflows/      GitHub Actions 自动部署
```

`public/` 和 `src/assets/` 的区别：`public/` 原样拷贝、路径可预测，适合正文里 `![](/foo.png)` 引用的图；`src/assets/` 会被 Astro 压缩、转 webp、生成多档 srcset 并把宽高写进 HTML，适合由组件渲染的图（目前只有脉络图）。

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

正文里引用图片：把图放进 `public/`，然后写 `![说明](/图片名.png)`，路径以 `/` 开头。

## 更新知识脉络图

每个栏目一张图，外部用生图模型画好后放进 `src/assets/graph/`，**按栏目 slug 命名**：

| 文件名 | 对应栏目 |
| --- | --- |
| `knowledge-graph-knowledge.png` | 知识分享 |
| `knowledge-graph-tech.png` | 技术博客 |
| `knowledge-graph-ai-pm.png` | AI产品经理的思考 |

换图就是**覆盖同名文件**，不需要改任何代码。首页右栏显示三张缩略图，`/graph/` 显示大图。

- 扩展名不限：`png` / `jpg` / `jpeg` / `webp` / `avif` / `svg` 都认。同名多扩展名同时存在时的取用优先级见 `src/lib/graph.ts`
- 建议宽度 1600px 以上。Astro 会自动压缩、转 webp、生成多档 srcset，不必自己压
- 图下方的「更新于」日期取自**文件修改时间**，不用手填
- 缺哪张图，对应位置显示「待生成」加期望的文件名，不会渲染碎图，也不影响构建
- 新增栏目时会自动多出一个位子，文件名由 `CATEGORIES` 的 slug 推导

一个栏目一张而不是全站合成一张：栏目之间刻意互斥，本来就没有枝干可连，合成图只会让生图模型为了构图饱满而硬连几笔并不存在的边。

**注意**：脉络图放在 `src/assets/` 而不是 `public/`，所以换图后必须重新构建才生效（push 到 `main` 会自动构建）。这是换取自动压缩和防加载抖动的代价。

给生图模型的提示词可以参考：以某栏目的文章标题为节点，主题相近的连成枝干，树状布局，浅米色背景 `#f2ece0`、深色节点、细线枝干，留白充足。

## 部署

push 到 `main` 就会触发 `.github/workflows/deploy.yml`，跑 `npm ci` → `npm run check` → `npm run build`，然后发布到 GitHub Pages。仓库设置里 Pages 的 Source 需要选 **GitHub Actions**（不是 Deploy from a branch）。

`npm run check` 在部署流程里是一道闸：frontmatter 写错分类名、漏必填字段会在这里失败，而不是等到线上页面变成空白。所以部署失败先看 Actions 日志的这一步。

站点是用户站（仓库名 `mesiphy.github.io`），部署在域名根路径，所以 `astro.config.mjs` 里不需要配 `base`。如果将来改成项目仓库（比如 `/blog/`），必须同时设置 `base`，否则全站资源会 404。

## 换成自己的域名

1. 在 `public/` 下新建 `CNAME` 文件，内容是裸域名，例如 `example.com`
2. DNS 加解析：`A` 记录指向 GitHub Pages 的四个 IP，或用 `CNAME` 指向 `mesiphy.github.io`
3. 把 `src/consts.ts` 的 `SITE_URL` 和 `astro.config.mjs` 的 `site` 改成新域名，否则 sitemap、RSS 和 canonical 链接还指向旧地址
