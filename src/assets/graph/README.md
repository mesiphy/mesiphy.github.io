每个栏目一张知识脉络图，放进这个目录，按栏目 slug 命名：

    knowledge-graph-knowledge.png   知识分享
    knowledge-graph-tech.png        技术博客
    knowledge-graph-ai-pm.png       AI产品经理的思考

- 支持 png / jpg / jpeg / webp / avif / svg，同名多扩展名时的取用优先级见 src/lib/graph.ts
- 换图就是覆盖同名文件，不需要改代码；重新构建后生效
- 图片下方的「更新于」日期取自文件修改时间，无需手填
- 建议宽度 1600px 以上，Astro 会自动压缩并生成 webp 与多档 srcset
- 栏目 slug 以 src/consts.ts 的 CATEGORIES 为准；新增栏目会自动多出一个位子

缺哪张图，首页右栏和 /graph/ 就在对应位置显示「待生成」加期望的文件名，
不会渲染碎图，也不影响构建。
