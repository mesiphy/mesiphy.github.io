import { deflateSync } from 'node:zlib';

const DIAGRAM_TYPES = new Map([
  ['actdiag', 'actdiag'],
  ['blockdiag', 'blockdiag'],
  ['bpmn', 'bpmn'],
  ['bytefield', 'bytefield'],
  ['c4', 'c4plantuml'],
  ['c4plantuml', 'c4plantuml'],
  ['d2', 'd2'],
  ['dbml', 'dbml'],
  ['ditaa', 'ditaa'],
  ['dot', 'graphviz'],
  ['erd', 'erd'],
  ['excalidraw', 'excalidraw'],
  ['goat', 'goat'],
  ['graphviz', 'graphviz'],
  ['mermaid', 'mermaid'],
  ['nomnoml', 'nomnoml'],
  ['nwdiag', 'nwdiag'],
  ['packetdiag', 'packetdiag'],
  ['pikchr', 'pikchr'],
  ['plantuml', 'plantuml'],
  ['puml', 'plantuml'],
  ['rackdiag', 'rackdiag'],
  ['seqdiag', 'seqdiag'],
  ['structurizr', 'structurizr'],
  ['svgbob', 'svgbob'],
  ['symbolator', 'symbolator'],
  ['tikz', 'tikz'],
  ['uml', 'plantuml'],
  ['umlet', 'umlet'],
  ['vega', 'vega'],
  ['vega-lite', 'vegalite'],
  ['vegalite', 'vegalite'],
  ['wavedrom', 'wavedrom'],
  ['wireviz', 'wireviz'],
]);

const TYPE_LABELS = new Map([
  ['c4plantuml', 'C4-PlantUML'],
  ['graphviz', 'Graphviz'],
  ['mermaid', 'Mermaid'],
  ['plantuml', 'PlantUML'],
  ['vegalite', 'Vega-Lite'],
]);

const PLANTUML_START = /^\s*@start(?:uml|mindmap|wbs|json|yaml|gantt|ditaa|salt)\b/i;

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function resolveDiagramType(node) {
  const language = node.lang?.toLowerCase();
  const explicitType = language && DIAGRAM_TYPES.get(language);

  if (explicitType) return { language, type: explicitType };

  // 兼容旧文章中把 PlantUML 误标为 text 的写法；新内容仍应显式使用 plantuml。
  if ((!language || language === 'text') && PLANTUML_START.test(node.value)) {
    return { language: 'plantuml', type: 'plantuml' };
  }

  return undefined;
}

function encodeDiagram(source) {
  // Kroki 的 GET 协议使用带 zlib 头/校验和的 deflate，不是 raw DEFLATE。
  return deflateSync(Buffer.from(source, 'utf8'), { level: 9 }).toString('base64url');
}

function diagramHtml(node, diagram, server) {
  const typeLabel = TYPE_LABELS.get(diagram.type) ?? diagram.type;
  const caption = node.meta?.trim() || `${typeLabel} 图`;
  const safeCaption = escapeHtml(caption);
  const safeSource = escapeHtml(node.value);
  const url = `${server}/${diagram.type}/svg/${encodeDiagram(node.value)}`;

  return [
    `<figure class="diagram" data-diagram-type="${diagram.type}">`,
    `<a class="diagram-canvas" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="在新标签页打开${safeCaption}">`,
    `<img src="${url}" alt="${safeCaption}" loading="lazy" decoding="async" referrerpolicy="no-referrer">`,
    '</a>',
    `<figcaption>${safeCaption} · ${typeLabel} · 点击查看原图</figcaption>`,
    '<details class="diagram-source" data-pagefind-ignore="all">',
    `<summary>查看并复制 ${typeLabel} 源码</summary>`,
    `<pre><code class="language-${diagram.language}">${safeSource}</code></pre>`,
    '</details>',
    '</figure>',
  ].join('\n');
}

/**
 * 把受支持的 fenced code block 转成 Kroki SVG，同时保留可折叠复制的源代码。
 * KROKI_BASE_URL 可指向自托管实例；末尾斜杠会被统一移除。
 */
export default function satteriDiagrams({ server = 'https://kroki.io' } = {}) {
  const normalizedServer = server.replace(/\/+$/, '');

  return {
    name: 'diagram-code-blocks',
    code(node, context) {
      const diagram = resolveDiagramType(node);
      if (!diagram) return;

      context.replaceNode(node, {
        rawHtml: diagramHtml(node, diagram, normalizedServer),
      });
    },
  };
}
