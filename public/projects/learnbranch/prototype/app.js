const screens = [...document.querySelectorAll('[data-screen]')];
const sessionLists = [...document.querySelectorAll('[data-session-list]')];
const createLayer = document.querySelector('#create-session-layer');
const draftLayer = document.querySelector('#draft-review-layer');
const branchLayer = document.querySelector('#branch-layer');
const createForm = document.querySelector('#create-session-form');
const branchForm = document.querySelector('#branch-form');
const titleInput = document.querySelector('#session-title');
const rootQuestionInput = document.querySelector('#root-question');
const modelSelect = document.querySelector('#session-model');
const createSubmit = createForm.querySelector('.primary-action');
const createError = document.querySelector('[data-create-error]');
const branchError = document.querySelector('[data-branch-error]');
const branchQuestion = document.querySelector('#branch-question');
const branchDescription = document.querySelector('#branch-description');
const draftFilename = document.querySelector('#draft-filename');
const draftMarkdown = document.querySelector('#draft-markdown');
const draftPreview = document.querySelector('#draft-preview');
const toast = document.querySelector('#toast');

const nodeData = {
  root: { title: '产品经理的必修课', question: '成为产品经理需要建立哪些核心能力？', status: '根问题' },
  parent: { title: '求职产品实习岗位需要掌握哪些东西', question: '求职产品实习岗位需要掌握哪些基本面？', status: '父节点' },
  skill: { title: '硬技能', question: '产品实习需要掌握哪些工具？', status: '已理解' },
  thinking: { title: '产品思维', question: '如何建立产品问题分析框架？', status: '探索中' },
  figma: { title: 'Figma', question: '如何用 Figma 完成可测试的原型？', status: '待学习' },
  process: { title: 'ProcessOn', question: '如何用流程图表达业务逻辑？', status: '待学习' },
  sql: { title: 'SQL 基本功', question: '产品实习应掌握哪些 SQL 查询知识？', status: '探索中' },
  research: { title: '用户研究', question: '怎样设计有效的用户访谈？', status: '已理解' },
  review: { title: '复盘', question: '如何把项目经历整理为结构化复盘？', status: '存档' },
  current: { title: '求职产品实习岗位需要掌握哪些东西', question: '求职产品实习岗位需要掌握哪些基本面？', status: '当前节点' },
};

let currentScreen = 'home';
let currentNodeId = 'current';
let currentSessionTitle = '产品经理的必修课';
let nodeCount = 9;
let draftContext = { type: 'edit', title: currentSessionTitle, question: nodeData.current.question };
let lastFocused = null;
let toastTimer = null;
let layoutCompact = false;

function showScreen(name) {
  currentScreen = name;
  screens.forEach((screen) => {
    screen.hidden = screen.dataset.screen !== name;
  });
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = window.setTimeout(() => { toast.hidden = true; }, 2200);
}

function layerFor(name) {
  return { 'create-session': createLayer, 'draft-review': draftLayer, branch: branchLayer }[name];
}

function openModal(name, focusTarget) {
  const layer = layerFor(name);
  if (!layer) return;
  window.clearTimeout(toastTimer);
  toast.hidden = true;
  lastFocused = document.activeElement;
  layer.hidden = false;
  document.body.style.overflow = 'hidden';
  window.requestAnimationFrame(() => focusTarget?.focus());
}

function closeModal(name) {
  const layer = layerFor(name);
  if (!layer) return;
  layer.hidden = true;
  if (![createLayer, draftLayer, branchLayer].some((item) => !item.hidden)) {
    document.body.style.overflow = '';
  }
  if (lastFocused instanceof HTMLElement) lastFocused.focus();
}

function updateCreateState() {
  createSubmit.disabled = !(titleInput.value.trim() && rootQuestionInput.value.trim());
  createError.hidden = true;
}

function setSelectedSession(title) {
  currentSessionTitle = title;
  document.querySelectorAll('.session-card').forEach((card) => {
    const selected = card.dataset.sessionTitle === title;
    card.classList.toggle('is-selected', selected);
    card.setAttribute('aria-pressed', String(selected));
  });
}

function bindSessionCard(card) {
  if (!card.hasAttribute('aria-pressed')) card.setAttribute('aria-pressed', 'false');
  card.addEventListener('click', () => {
    setSelectedSession(card.dataset.sessionTitle);
    showScreen('detail');
  });
}

function createSessionCard(title, nodes = 1) {
  const card = document.createElement('button');
  card.className = 'session-card';
  card.type = 'button';
  card.dataset.sessionTitle = title;
  const strong = document.createElement('strong');
  strong.textContent = title;
  const status = document.createElement('span');
  status.textContent = '进行中';
  const time = document.createElement('time');
  time.dateTime = '2026-08-20';
  time.textContent = '2026/8/20';
  const count = document.createElement('span');
  count.textContent = `${nodes} 个节点`;
  card.append(strong, status, time, count);
  bindSessionCard(card);
  return card;
}

function addSession(title) {
  sessionLists.forEach((list) => list.prepend(createSessionCard(title)));
  setSelectedSession(title);
}

function updateNodeDetail(id) {
  const node = nodeData[id] ?? nodeData.current;
  currentNodeId = id;
  document.querySelectorAll('[data-node-title]').forEach((item) => { item.textContent = node.title; });
  document.querySelectorAll('[data-node-question]').forEach((item) => { item.textContent = node.question; });
  document.querySelectorAll('[data-node-path]').forEach((item) => { item.textContent = node.title; });
  document.querySelectorAll('[data-current-node]').forEach((item) => { item.textContent = node.title; });
  document.querySelectorAll('.graph-node').forEach((item) => item.classList.toggle('is-active-node', item.dataset.nodeId === id));
  const callout = document.querySelector('[data-node-callout]');
  callout.querySelector('strong').textContent = node.title;
  callout.querySelector('span').textContent = `${node.status} · 点击再次进入详情`;
}

function renderDraftPreview() {
  draftPreview.replaceChildren();
  let currentList = null;
  draftMarkdown.value.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) { currentList = null; return; }
    if (line.startsWith('### ')) {
      currentList = null;
      const heading = document.createElement('h3');
      heading.textContent = line.slice(4);
      draftPreview.append(heading);
      return;
    }
    if (/^(?:-|\d+\.)\s/.test(line)) {
      const ordered = /^\d+\./.test(line);
      if (!currentList || currentList.tagName !== (ordered ? 'OL' : 'UL')) {
        currentList = document.createElement(ordered ? 'ol' : 'ul');
        draftPreview.append(currentList);
      }
      const item = document.createElement('li');
      item.textContent = line.replace(/^(?:-|\d+\.)\s*/, '');
      currentList.append(item);
      return;
    }
    currentList = null;
    const paragraph = document.createElement('p');
    paragraph.textContent = line;
    draftPreview.append(paragraph);
  });
}

function prepareDraft(context) {
  draftContext = context;
  draftFilename.value = `${context.title}.md`;
  if (context.type === 'branch') {
    draftMarkdown.value = `### 一、SQL 查询基础\n- SELECT 与字段选择\n- WHERE 条件筛选\n- GROUP BY 与聚合\n\n### 二、产品分析实践\n- 用 SQL 验证指标变化\n- 将查询结果转化为产品判断`;
  }
  renderDraftPreview();
  openModal('draft-review', draftMarkdown);
}

function updateAnswerFromPreview() {
  const answer = document.querySelector('[data-answer-copy]');
  answer.replaceChildren(...[...draftPreview.children].map((child) => child.cloneNode(true)));
}

function svgNode(tag, attributes = {}) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

function addBranchNode(title, question) {
  const id = `branch-${Date.now()}`;
  nodeData[id] = { title, question, status: '当前节点' };
  nodeCount += 1;

  const miniContainer = document.querySelector('#mini-dynamic-nodes');
  const miniEdge = svgNode('path', { d: 'M65 328H185', fill: 'none', stroke: '#111', 'stroke-width': '1.35' });
  const miniGroup = svgNode('g', { class: 'graph-node is-active-node', 'data-node-id': id, transform: 'translate(185 328)', role: 'button', tabindex: '0' });
  miniGroup.append(svgNode('circle', { r: '10' }), Object.assign(svgNode('text', { x: '18', y: '5' }), { textContent: title }));
  miniContainer.append(miniEdge, miniGroup);

  const largeContainer = document.querySelector('#large-dynamic-nodes');
  const largeEdge = svgNode('path', { d: 'M205 416H430', fill: 'none', stroke: '#111', 'stroke-width': '1.35' });
  const largeGroup = svgNode('g', { class: 'graph-node is-active-node', 'data-node-id': id, 'data-status': 'exploring', transform: 'translate(430 416)', role: 'button', tabindex: '0' });
  largeGroup.append(svgNode('circle', { r: '13' }), Object.assign(svgNode('text', { x: '21', y: '5' }), { textContent: title }));
  largeContainer.append(largeEdge, largeGroup);

  document.querySelectorAll('[data-node-count]').forEach((item) => { item.textContent = `${nodeCount} 节点`; });
  bindGraphNode(miniGroup);
  bindGraphNode(largeGroup);
  updateNodeDetail(id);
}

function bindGraphNode(node) {
  node.addEventListener('click', () => {
    const id = node.dataset.nodeId;
    if (currentNodeId === id && currentScreen === 'graph') showScreen('detail');
    else updateNodeDetail(id);
  });
  node.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      node.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
  });
}

function applyGraphFilters() {
  const allowed = [...document.querySelectorAll('[data-status-filter]:checked')].map((input) => input.value);
  document.querySelectorAll('.large-graph .graph-node[data-status]').forEach((node) => {
    node.classList.toggle('is-filtered', !allowed.includes(node.dataset.status));
  });
}

function applyGraphSearch() {
  const query = document.querySelector('[data-graph-search]').value.trim().toLocaleLowerCase();
  document.querySelectorAll('.large-graph .graph-node').forEach((node) => {
    const text = node.textContent.toLocaleLowerCase();
    node.classList.toggle('is-match', Boolean(query) && text.includes(query));
  });
}

document.querySelectorAll('.session-card').forEach(bindSessionCard);

document.querySelectorAll('[data-session-search]').forEach((input) => {
  input.addEventListener('input', () => {
    const sidebar = input.closest('.session-sidebar');
    const query = input.value.trim().toLocaleLowerCase();
    let visible = 0;
    sidebar.querySelectorAll('.session-card').forEach((card) => {
      const match = card.dataset.sessionTitle.toLocaleLowerCase().includes(query);
      card.hidden = !match;
      if (match) visible += 1;
    });
    sidebar.querySelector('[data-no-results]').hidden = visible > 0;
  });
});

document.querySelectorAll('[data-go-home]').forEach((button) => button.addEventListener('click', () => showScreen('home')));
document.querySelectorAll('[data-open-create]').forEach((button) => button.addEventListener('click', () => openModal('create-session', titleInput)));
document.querySelectorAll('[data-show-graph]').forEach((button) => button.addEventListener('click', () => showScreen('graph')));
document.querySelectorAll('[data-show-detail]').forEach((button) => button.addEventListener('click', () => showScreen('detail')));
document.querySelectorAll('[data-open-branch]').forEach((button) => button.addEventListener('click', () => openModal('branch', branchQuestion)));
document.querySelectorAll('[data-open-draft]').forEach((button) => button.addEventListener('click', () => prepareDraft({ type: 'edit', title: nodeData[currentNodeId].title, question: nodeData[currentNodeId].question })));

document.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', () => closeModal(button.dataset.closeModal)));

[titleInput, rootQuestionInput].forEach((input) => input.addEventListener('input', updateCreateState));
modelSelect.addEventListener('change', () => {
  const alternative = modelSelect.value === 'deepseek-chat' ? 'deepseek-reasoner' : 'deepseek-chat';
  document.querySelector('[data-model-alternative]').textContent = `备选模型：${alternative}`;
});

createForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  const question = rootQuestionInput.value.trim();
  if (!title || !question) {
    createError.textContent = '请填写会话标题和根问题。';
    createError.hidden = false;
    (title ? rootQuestionInput : titleInput).focus();
    return;
  }
  addSession(title);
  nodeData.current = { title: question, question, status: '当前节点' };
  updateNodeDetail('current');
  closeModal('create-session');
  createForm.reset();
  updateCreateState();
  prepareDraft({ type: 'session', title, question });
});

branchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = branchQuestion.value.trim();
  const question = branchDescription.value.trim();
  if (!title || !question) {
    branchError.textContent = '请填写节点名称和发送给 AI 的问题描述。';
    branchError.hidden = false;
    (title ? branchDescription : branchQuestion).focus();
    return;
  }
  branchError.hidden = true;
  closeModal('branch');
  prepareDraft({ type: 'branch', title, question });
});

draftMarkdown.addEventListener('input', renderDraftPreview);
document.querySelector('[data-save-draft]').addEventListener('click', () => {
  updateAnswerFromPreview();
  closeModal('draft-review');
  if (draftContext.type === 'branch') {
    addBranchNode(draftContext.title, draftContext.question);
    showScreen('graph');
    showToast('分支已保存到 Obsidian，并加入图谱。');
  } else {
    showScreen('detail');
    showToast('草稿已保存到 Obsidian。');
  }
});

document.querySelectorAll('.graph-node').forEach(bindGraphNode);
document.querySelectorAll('[data-status-filter]').forEach((input) => input.addEventListener('change', applyGraphFilters));
document.querySelector('[data-graph-search]').addEventListener('input', applyGraphSearch);

document.querySelector('[data-layout-graph]').addEventListener('click', () => {
  layoutCompact = !layoutCompact;
  document.querySelector('.large-graph').classList.toggle('is-compact', layoutCompact);
});
document.querySelector('[data-fit-graph]').addEventListener('click', () => {
  document.querySelector('.large-graph').classList.remove('is-compact');
  layoutCompact = false;
});

document.querySelector('[data-organize]').addEventListener('click', () => showToast('会话结构已整理。'));
document.querySelector('[data-export-canvas]').addEventListener('click', () => showToast('已导出 Obsidian Canvas。'));
document.querySelector('[data-show-outline]').addEventListener('click', () => showToast('纲要已根据当前节点生成。'));
document.querySelector('[data-export-overview]').addEventListener('click', () => showToast('整览已导出。'));
document.querySelector('[data-read-node]').addEventListener('click', () => document.querySelector('.answer-block').scrollIntoView({ block: 'start' }));
document.querySelector('.settings-button').addEventListener('click', () => showToast('设置将在产品实现中接入。'));
document.querySelector('.vault-button').addEventListener('click', () => showToast('当前 Vault：LearnBranch 演示 Vault'));

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (!branchLayer.hidden) closeModal('branch');
  else if (!draftLayer.hidden) closeModal('draft-review');
  else if (!createLayer.hidden) closeModal('create-session');
});

renderDraftPreview();
updateCreateState();
updateNodeDetail('current');
showScreen('home');
