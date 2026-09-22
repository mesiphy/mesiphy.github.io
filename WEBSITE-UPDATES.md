# 网站更新指南（Agent）

本站为 Astro 静态网站。以下路径均相对项目根目录；修改源文件，不修改 `dist/`。字段规则以 `src/content.config.ts` 为准。

## 1. 新增或修改文章

在 `content/posts/` 新建 `小写英文-连字符.md`，或直接编辑现有文件：

```markdown
---
title: 文章标题
date: 2026-09-22
description: 一两句话概括内容。
category: 知识笔记
tags: [学习]
draft: false
---

Markdown 正文。
```

- `category` 只能填 `知识笔记`、`惚恍`、`AI`；日期填写实际日期。
- 修改文章时同步摘要；显著修订增加 `updated: YYYY-MM-DD`，保留原 `date`。已发布文件名决定 `/posts/<文件名>/` 地址，避免改名。
- 正文图片放 `public/`，引用如 `![说明](/图片名.png)`。`draft: true` 仅开发预览可见。

## 2. 更换栏目背景

| 页面 | 图片与修改入口 |
| --- | --- |
| 首页 | 当前为 `public/home/background-left.webp`；在 `src/home.config.ts` 设置 `desktopImage`、`mobileImage`，网址路径写 `/home/图片名`；用 `desktopPosition`、`mobilePosition` 调整裁切。 |
| 音乐及单曲、专辑详情 | 覆盖 `src/assets/backgrounds/music-scene.png`；遮罩与文字颜色在 `src/styles/music.css` 的 `body[data-section='music']`。 |
| 知识笔记及所属文章 | 覆盖 `src/assets/backgrounds/knowledge-paper.png`；遮罩在 `src/styles/global.css` 的 `body[data-category='knowledge']`。 |
| 惚恍、AI、公共工具页 | 当前共用 `src/assets/backgrounds/watercolor-light-desktop.webp` 和 `watercolor-light-mobile.webp`；替换会同时影响这些页面。 |

仅给 AI 独立换图：先添加 `src/assets/backgrounds/ai-scene.webp`，再在 `src/styles/global.css` 添加：

```css
body[data-category='ai'] {
  --watercolor-bg: url('../assets/backgrounds/ai-scene.webp');
}
```

惚恍同理，选择器用 `huhuang`；同时作用于栏目与所属文章。需独立手机图时，在 `@media (max-width: 40rem)` 中用同一选择器覆盖变量。

音乐、知识笔记图片由 `src/layouts/BaseLayout.astro` 导入并转为 WebP；若改文件名或格式，须同步修改导入。首页遮罩在 `src/pages/index.astro` 的 `.backdrop::after`。换图后检查桌面、手机裁切及文字清晰度。

## 3. 曲目、专辑介绍与封面

- 单曲：编辑 `content/music/<id>.md`；专辑：编辑 `content/albums/<id>.md`。顶部元数据控制名称等信息，Markdown 正文就是介绍或感想。
- 将封面放入 `public/music/`，在对应文件顶部的 `---` 区域设置 `cover: /music/图片名.webp`；也支持 HTTPS 图片地址。推荐方形 JPG、PNG 或 WebP。
- 单曲未填 `cover` 时继承专辑封面；均未填写或图片加载失败时显示文字封面。卡片与对应详情页共用此配置。
- 新增内容可复制 `content/music/example-track-one.md`、`content/albums/example-album.md` 并改用新的小写英文连字符文件名。单曲 `album` 指向专辑文件名（不含 `.md`），`trackNumber` 为专辑内不重复的正整数。
- 单曲 `neteaseId` 填真实网易云歌曲链接 `song?id=` 后的数字，并用引号包围；`embed` 默认保持 `false`，确认官方外链可播放后再开启。
- 发布歌曲时，歌曲及所属专辑均须 `draft: false`。地址分别为 `/music/<id>/`、`/music/albums/<id>/`。

## 4. 检查与发布

1. `npm run dev` 查看页面；音乐页搜索筛选可直接验证，全站全文搜索需构建后验证。
2. 发布前运行 `npm test`、`npm run check`、`npm run build`，再用 `npm run preview` 检查正式页面、图片和链接；草稿不应出现。
3. 按用户要求提交相关源文件与图片；推送到 `main` 后，`.github/workflows/deploy.yml` 自动部署 GitHub Pages。保留工作区中其他已有改动。
