/* ============================================================
   工具
   ============================================================ */
const $ = s => document.querySelector(s);

function esc(s){
  return String(s ?? '').replace(/[&<>"']/g, m => (
    {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]
  ));
}

function fmtDate(ts){
  const d = new Date(ts), p = n => String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function fmtRel(ts){
  if (!ts) return '未知';
  const diff = Date.now() - ts;
  const MIN = 60000, HOUR = 3600000, DAY = 86400000;
  if (diff < MIN) return '刚刚';
  if (diff < HOUR) return Math.floor(diff/MIN) + ' 分钟前';
  if (diff < DAY) return Math.floor(diff/HOUR) + ' 小时前';
  if (diff < DAY*30) return Math.floor(diff/DAY) + ' 天前';
  return fmtDate(ts).slice(0,10);
}

const SPINES = ['#FFC9E0','#B9DCFF','#FFE3A3','#BFEBD6','#D9CDFF','#FFD2B8','#C9E8FF','#FFD6EA'];
function spineColor(id){
  const s = String(id);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h*31 + s.charCodeAt(i)) % 997;
  return SPINES[h % SPINES.length];
}

const EMOJIS = ['🐥','🐤','🐣','🐔','🥚','🌷','🌙','⭐','☁️','🍀','🧸','🎀','🍭','🌈','🦄','📖','🌻','🍰','🫧','🕯️'];

const SKINS = [
  { id: 'default', name: '童话 ', preview: 'linear-gradient(120deg,#ffd0e6,#b9dcff)' },
  { id: 'paper',   name: '纸质', preview: 'linear-gradient(120deg,#f0dbb0,#e0c078)' },
  { id: 'night',   name: '暗夜', preview: 'linear-gradient(120deg,#3a3142,#5a4a68)' },
  { id: 'sakura',  name: '樱花', preview: 'linear-gradient(120deg,#ff8ab8,#ffb8d4)' },
  { id: 'ocean',   name: '海洋', preview: 'linear-gradient(120deg,#6cb4e8,#9fd8ff)' },
  { id: 'forest',  name: '森林', preview: 'linear-gradient(120deg,#6fc486,#a8e0b8)' },
];

const CSS_TEMPLATES = {
  '首字下沉': `#chick-reader .chapter-body p:first-of-type::first-letter {
  font-size: 2.6em;
  font-weight: 800;
  color: #ff8ab8;
  float: left;
  line-height: 1;
  margin: 0 8px 0 0;
}`,
  '居中诗文': `#chick-reader .chapter-body {
  text-align: center;
  line-height: 2.2;
  font-family: "Songti SC", Georgia, serif;
}
#chick-reader .chapter-body p {
  margin: 1.4em 0;
}`,
  '纸质质感': `#chick-reader .chapter-body {
  background: #fbf6e8;
  padding: 30px;
  border-radius: 18px;
  box-shadow: inset 0 0 60px rgba(180, 140, 60, 0.15);
  font-family: Georgia, "Songti SC", serif;
}`,
  '粉色引用': `#chick-reader .chapter-body blockquote {
  background: linear-gradient(90deg, #ffe0ee, #e0eeff);
  border-left: 5px solid #ff8ab8;
  font-style: italic;
  padding: 14px 20px;
  border-radius: 12px;
}`,
  '大标题': `#chick-reader .chapter-body h1 {
  font-size: 2em;
  background: linear-gradient(90deg, #ff8ab8, #8ab8ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-align: center;
}`,
};

function chickSVG(cls = ''){
  return `<svg class="${cls}" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="60" cy="110" rx="28" ry="6" fill="#c9b8d4" opacity=".18"/>
    <ellipse cx="60" cy="74" rx="33" ry="31" fill="#FFE066"/>
    <ellipse cx="26" cy="76" rx="9" ry="14" fill="#FFD23F" transform="rotate(-14 26 76)"/>
    <ellipse cx="94" cy="76" rx="9" ry="14" fill="#FFD23F" transform="rotate(14 94 76)"/>
    <circle cx="60" cy="44" r="31" fill="#FFF3B0"/>
    <path d="M60 14 q4 -10 13 -8" stroke="#FFD23F" stroke-width="5" fill="none" stroke-linecap="round"/>
    <circle cx="47" cy="44" r="6.5" fill="#4a4055"/>
    <circle cx="73" cy="44" r="6.5" fill="#4a4055"/>
    <circle cx="49.5" cy="41.5" r="2.4" fill="#fff"/>
    <circle cx="75.5" cy="41.5" r="2.4" fill="#fff"/>
    <ellipse cx="35" cy="55" rx="7.5" ry="5" fill="#FFB3C6" opacity=".85"/>
    <ellipse cx="85" cy="55" rx="7.5" ry="5" fill="#FFB3C6" opacity=".85"/>
    <path d="M60 55 L53.5 63 L66.5 63 Z" fill="#FFAA33" stroke="#F09A2A" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M50 104 l-5 5 M50 104 v7 M50 104 l5 5" stroke="#FFAA33" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M70 104 l-5 5 M70 104 v7 M70 104 l5 5" stroke="#FFAA33" stroke-width="4" stroke-linecap="round" fill="none"/>
  </svg>`;
}

function toast(msg){
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 320);
  }, 2200);
}

/* ============================================================
   认证 & API
   ============================================================ */
const tokenStore = {
  get: () => localStorage.getItem('chick_token'),
  set: t => localStorage.setItem('chick_token', t),
  clear: () => localStorage.removeItem('chick_token')
};

async function api(path, options = {}){
  const headers = { 'Content-Type': 'application/json' };
  const t = tokenStore.get();
  if (t) headers.Authorization = 'Bearer ' + t;
  const res = await fetch('/api' + path, {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok){
    if (res.status === 401 && !path.startsWith('/auth/login') && !path.startsWith('/auth/register')){
      tokenStore.clear();
      state.user = null;
      renderUserArea();
    }
    throw new Error(data.error || `请求失败 (${res.status})`);
  }
  return data;
}

/* ============================================================
   状态
   ============================================================ */
const state = {
  user: null,
  categories: [],
  articles: [],
  currentArticle: null,
  view: 'shelf',
  activeCategory: 'all',
  search: '',
  openChapters: {}
};

const isAdmin = () => state.user && state.user.role === 'admin';

/* ============================================================
   弹窗基础
   ============================================================ */
function showModal(innerHTML, onReady){
  const back = document.createElement('div');
  back.className = 'modal-backdrop';
  back.innerHTML = `<div class="modal">${innerHTML}</div>`;
  document.body.appendChild(back);
  const close = () => back.remove();
  back.addEventListener('click', e => { if (e.target === back) close(); });
  back.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', close));
  if (onReady) onReady(back, close);
  return { close, back };
}

/* ============================================================
   渲染：用户区
   ============================================================ */
function renderUserArea(){
  const el = $('#userArea');
  if (state.user){
    el.innerHTML = `
      <div class="user-chip">
        <span class="user-avatar">${state.user.role === 'admin' ? '👑' : '🐥'}</span>
        <span class="user-name">${esc(state.user.username)}</span>
        <span class="user-role">${state.user.role === 'admin' ? '管理员' : '读者'}</span>
        <button class="btn ghost" data-action="logout">退出</button>
      </div>`;
  } else {
    el.innerHTML = `<button class="btn" data-action="login">🔑 登录 / 注册</button>`;
  }
}

/* ============================================================
   渲染：侧边栏
   ============================================================ */
function catItem(key, label, count, icon){
  const active = state.activeCategory === key ? ' active' : '';
  const del = (isAdmin() && key !== 'all')
    ? `<button class="cat-del" data-action="del-cat" data-cat-id="${key}" title="删除分类">×</button>`
    : '';
  return `<div class="cat-item${active}" data-action="select-cat" data-cat-key="${esc(key)}">
      <span class="cat-left"><span class="cat-icon">${icon}</span>${esc(label)}</span>
      <span class="cat-right">${del}<span class="cat-count">${count}</span></span>
    </div>`;
}

function renderSidebar(){
  const total = state.articles.length;
  let html = `
    <div class="side-block">
      <div class="side-title">📚 书架分类</div>
      ${catItem('all', '全部书籍', total, '🌈')}
      ${state.categories.map(c => catItem(String(c.id), c.name, c.count, '📖')).join('')}
      ${isAdmin() ? '<button class="btn ghost side-add" data-action="add-cat">＋ 新建分类</button>' : ''}
    </div>`;
  if (isAdmin()){
    html += `
      <div class="side-block">
        <div class="side-title">🔑 管理员模式</div>
        <p class="hint">你可以新建、编辑和整理书架上的书啦～</p>
        <button class="btn" data-action="new-article" style="width:100%; margin-bottom:8px">＋ 新建文章</button>
        <button class="btn ghost" data-action="manage-users" style="width:100%">👥 用户管理</button>
      </div>`;
  } else if (state.user){
    html += `
      <div class="side-block">
        <div class="side-title">🐥 读者模式</div>
        <p class="hint">你可以自由阅读所有文章，<br>但只有管理员能编辑和上传哦～</p>
      </div>`;
  } else {
    html += `
      <div class="side-block">
        <div class="side-title">🐣 访客模式</div>
        <p class="hint">访客可以自由阅读所有文章。<br>登录后可以解锁更多功能～</p>
        <button class="btn" data-action="login" style="width:100%">🔑 登录 / 注册</button>
      </div>`;
  }
  $('#sidebar').innerHTML = html;
}

/* ============================================================
   渲染：主区域
   ============================================================ */
function renderMain(){
  $('#main').innerHTML = state.view === 'reader' ? renderReader() : renderShelf();
}

function renderShelf(){
  const q = state.search.trim().toLowerCase();
  let list = state.articles.slice();
  if (state.activeCategory !== 'all'){
    list = list.filter(a => String(a.categoryId) === String(state.activeCategory));
  }
  if (q){
    list = list.filter(a =>
      (a.title || '').toLowerCase().includes(q) ||
      (a.summary || '').toLowerCase().includes(q) ||
      (a.category || '').toLowerCase().includes(q));
  }
  const catName = state.activeCategory === 'all'
    ? '全部书籍'
    : (state.categories.find(c => String(c.id) === String(state.activeCategory))?.name || '分类');

  const cards = list.map(a => {
    const raw = (a.summary || '').replace(/\s+/g, ' ').trim();
    const excerpt = raw.slice(0, 60);
    const tools = isAdmin() ? `
      <div class="card-tools">
        <button class="mini" data-action="edit-article" data-id="${a.id}" title="编辑信息">✏️</button>
        <button class="mini" data-action="delete-article" data-id="${a.id}" title="删除这本书">🗑️</button>
      </div>` : '';
    return `
      <article class="book-card" style="--spine:${spineColor(a.id)}" data-action="open-article" data-id="${a.id}">
        ${tools}
        <div class="book-top">
          <span class="book-emoji">${a.emoji || '🐥'}</span>
          <span class="tag">${esc(a.category || '未分类')}</span>
        </div>
        <h3 class="book-title">${esc(a.title)}</h3>
        <p class="book-excerpt">${esc(excerpt)}${raw.length > 60 ? '…' : ''}</p>
        <div class="book-meta">
          <span>📖 ${a.chapterCount} 章</span>
          <span>· 更新于 ${fmtRel(a.updatedAt)}</span>
        </div>
      </article>`;
  }).join('');

  const emptyBlock = `
    <div class="empty">
      ${chickSVG('empty-chick')}
      <p>${q ? '没有找到相关的文章呢～换个关键词试试？' : '这个书架上还空空的呢～'}</p>
      ${isAdmin() && !q ? '<button class="btn" data-action="new-article">＋ 写下第一篇文章</button>' : ''}
      ${!isAdmin() && !q ? '<p class="hint">管理员登录后就可以添加文章啦 🐣</p>' : ''}
    </div>`;

  return `
    <div class="main-head">
      <div>
        <h2>${esc(catName)}</h2>
        <p class="hint">共 ${list.length} 本文${q ? ` · 搜索「${esc(state.search)}」` : ''}</p>
      </div>
      ${isAdmin() ? '<button class="btn" data-action="new-article">＋ 新建文章</button>' : ''}
    </div>
    <div class="article-grid">${cards || emptyBlock}</div>`;
}

/* ---------- 阅读视图 ---------- */
function renderReader(){
  const a = state.currentArticle;
  if (!a){ state.view = 'shelf'; return renderShelf(); }

  const skinClass = 'skin-' + (a.skin || 'default');
  const customCss = (a.customCss || '').trim();
  const customStyleTag = customCss ? `<style data-article-css>${customCss}</style>` : '';

  const chapterList = a.chapters.map((c, i) => {
    const open = !!state.openChapters[c.id];
    const isHtml = c.contentType === 'html';
    const tools = isAdmin() ? `
      <button class="mini" data-action="edit-chapter" data-cid="${c.id}" title="编辑本章">✏️</button>
      <button class="mini" data-action="delete-chapter" data-cid="${c.id}" title="删除本章">🗑️</button>` : '';

    let body = '';
    if (open){
      const inner = isHtml
        ? (c.content || '<span class="hint">（本章还没有内容）</span>')
        : (esc(c.content) || '<span class="hint">（本章还没有内容）</span>');
      body = `<div class="chapter-body ${isHtml ? 'html-mode' : 'text-mode'}">${inner}</div>`;
    }

    return `
      <section class="chapter${open ? ' open' : ''}">
        <div class="chapter-head" data-action="toggle-chapter" data-cid="${c.id}">
          <div class="chapter-name">
            <span class="chapter-index">${String(i+1).padStart(2,'0')}</span>
            <span>${esc(c.title)}</span>
            ${isHtml ? '<span class="tag" style="margin-left:6px">HTML</span>' : ''}
          </div>
          <div class="chapter-tools">
            ${tools}
            <span class="chev">${open ? '▾' : '▸'}</span>
          </div>
        </div>
        ${body}
      </section>`;
  }).join('');

  const noChapter = `
    <div class="empty">
      ${chickSVG('empty-chick')}
      <p>这篇文章还没有章节呢～</p>
      ${isAdmin() ? '<button class="btn" data-action="new-chapter">＋ 写下第一章</button>' : ''}
    </div>`;

  return `
    ${customStyleTag}
    <div class="reader ${skinClass}" id="chick-reader" data-article-id="${a.id}">
      <button class="btn ghost back-btn" data-action="back-shelf">← 回到书架</button>

      <div class="reader-head">
        <div class="reader-emoji">${a.emoji || '🐥'}</div>
        <div class="reader-info">
          <h2>${esc(a.title)}</h2>
          <div class="reader-meta">
            <span class="tag">${esc(a.category || '未分类')}</span>
            <span>📖 共 ${a.chapters.length} 章</span>
            <span>更新于 ${fmtDate(a.updatedAt)}</span>
            ${customCss ? '<span class="tag" style="background:linear-gradient(110deg,#e3f0ff,#ffe3f1)">🎨 自定义 CSS</span>' : ''}
          </div>
          ${a.summary ? `<p class="reader-summary">${esc(a.summary)}</p>` : ''}
        </div>
        <div class="reader-actions">
          ${isAdmin() ? `
            <button class="btn" data-action="new-chapter">＋ 添加章节</button>
            <button class="btn ghost" data-action="edit-article" data-id="${a.id}">✏️ 编辑信息</button>
            <button class="btn danger" data-action="delete-article" data-id="${a.id}">🗑️ 删除</button>
          ` : ''}
        </div>
      </div>

      <div class="chapters">${chapterList || noChapter}</div>
    </div>`;
}

/* ============================================================
   总渲染
   ============================================================ */
function render(){
  renderUserArea();
  renderSidebar();
  renderMain();
}

/* ============================================================
   加载数据
   ============================================================ */
async function loadAll(){
  try {
    const [cats, arts] = await Promise.all([api('/categories'), api('/articles')]);
    state.categories = cats;
    state.articles = arts;
    render();
  } catch (e){ toast(e.message); }
}

async function refreshUser(){
  if (!tokenStore.get()){ state.user = null; return; }
  try {
    const { user } = await api('/auth/me');
    state.user = user;
  } catch {
    tokenStore.clear();
    state.user = null;
  }
}

/* ============================================================
   登录 / 注册
   ============================================================ */
function openAuthModal(mode = 'login'){
  const html = `
    <div class="login-chick">${chickSVG()}</div>
    <h3 class="modal-title" style="text-align:center">
      ${mode === 'login' ? '欢迎回来 🐥' : '加入图书馆 🐣'}
    </h3>
    <div class="field">
      <label>用户名</label>
      <input type="text" id="authUser" placeholder="2-20 个字符" autocomplete="username">
    </div>
    <div class="field">
      <label>密码</label>
      <input type="password" id="authPass" placeholder="至少 6 位" autocomplete="${mode === 'login' ? 'current-password' : 'new-password'}">
    </div>
    <p class="err" id="authErr"></p>
    <div class="modal-actions">
      <button class="btn ghost" data-close>取消</button>
      <button class="btn" id="authSubmit">${mode === 'login' ? '登录' : '注册'}</button>
    </div>
    <p class="tip">
      ${mode === 'login'
        ? '还没有账号？<a href="#" id="switchAuth">注册一个</a>'
        : '已有账号？<a href="#" id="switchAuth">去登录</a>'}
    </p>
    <p class="tip">💡 数据库中的第一位注册用户会自动成为管理员</p>
  `;
  showModal(html, (back, close) => {
    const userIn = back.querySelector('#authUser');
    const passIn = back.querySelector('#authPass');
    const errEl = back.querySelector('#authErr');
    const submit = back.querySelector('#authSubmit');
    userIn.focus();
    back.querySelector('#switchAuth').addEventListener('click', e => {
      e.preventDefault();
      close();
      openAuthModal(mode === 'login' ? 'register' : 'login');
    });
    const doSubmit = async () => {
      errEl.textContent = '';
      const username = userIn.value.trim();
      const password = passIn.value;
      if (!username || !password){ errEl.textContent = '请填写用户名和密码'; return; }
      submit.disabled = true;
      submit.textContent = mode === 'login' ? '登录中…' : '注册中…';
      try {
        const data = await api(mode === 'login' ? '/auth/login' : '/auth/register', {
          method: 'POST', body: { username, password }
        });
        tokenStore.set(data.token);
        state.user = data.user;
        close();
        toast(data.message || (mode === 'login' ? '登录成功' : '注册成功'));
        await loadAll();
      } catch (e){
        errEl.textContent = e.message;
        submit.disabled = false;
        submit.textContent = mode === 'login' ? '登录' : '注册';
      }
    };
    submit.addEventListener('click', doSubmit);
    back.addEventListener('keydown', e => { if (e.key === 'Enter') doSubmit(); });
  });
}

function logout(){
  tokenStore.clear();
  state.user = null;
  state.view = 'shelf';
  state.currentArticle = null;
  render();
  toast('已退出登录');
}

/* ============================================================
   文章弹窗（含皮肤 + 自定义 CSS）
   ============================================================ */
function openArticleModal(article = null){
  const isEdit = !!article;
  const cats = state.categories;
  let selectedEmoji = article?.emoji || '🐥';
  let selectedSkin = article?.skin || 'default';

  const html = `
    <h3 class="modal-title">${isEdit ? '✏️ 编辑文章信息' : '📖 新建一篇文章'}</h3>

    <div class="field">
      <label>标题</label>
      <input type="text" id="artTitle" placeholder="给这篇文章取个名字…" value="${esc(article?.title || '')}">
    </div>

    <div class="field">
      <label>分类</label>
      <select id="artCategory">
        <option value="">— 未分类 —</option>
        ${cats.map(c => `<option value="${c.id}" ${String(article?.categoryId) === String(c.id) ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
      </select>
    </div>

    <div class="field">
      <label>封面 emoji</label>
      <div class="emoji-picker" id="emojiPicker">
        ${EMOJIS.map(e => `<button type="button" class="emoji-opt${e === selectedEmoji ? ' on' : ''}" data-emoji="${e}">${e}</button>`).join('')}
      </div>
    </div>

    <div class="field">
      <label>📖 阅读皮肤（整篇文章统一风格）</label>
      <div class="skin-picker" id="skinPicker">
        ${SKINS.map(s => `
          <button type="button" class="skin-opt${s.id === selectedSkin ? ' on' : ''}" data-skin="${s.id}">
            <span class="skin-preview" style="background:${s.preview}"></span>
            <span class="skin-name">${s.name}</span>
          </button>`).join('')}
      </div>
    </div>

    <div class="field">
      <label>🎨 自定义 CSS（可留空；会覆盖上面的皮肤）</label>
      <textarea id="artCss" class="mono" rows="9" placeholder="在这里写 CSS 代码，例如：&#10;#chick-reader .chapter-body {&#10;  font-family: 'Songti SC', serif;&#10;}">${esc(article?.customCss || '')}</textarea>
      <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px" id="cssTemplates">
        ${Object.keys(CSS_TEMPLATES).map(name => `
          <button type="button" class="btn ghost" data-tpl="${name}" style="padding:6px 12px; font-size:12px">＋ ${name}</button>
        `).join('')}
      </div>
      <p class="hint">
        💡 建议每个选择器都以 <code>#chick-reader</code> 开头，只影响这本书的阅读页。
      </p>
    </div>

    <div class="field">
      <label>简介（可选）</label>
      <textarea id="artSummary" rows="3" placeholder="用一两句话介绍这篇文章…">${esc(article?.summary || '')}</textarea>
    </div>

    <p class="err" id="artErr"></p>

    <div class="modal-actions">
      <button class="btn ghost" data-close>取消</button>
      <button class="btn" id="artSave">${isEdit ? '保存修改' : '创建'}</button>
    </div>
  `;

  showModal(html, (back, close) => {
    const picker = back.querySelector('#emojiPicker');
    picker.addEventListener('click', e => {
      const btn = e.target.closest('.emoji-opt');
      if (!btn) return;
      selectedEmoji = btn.dataset.emoji;
      picker.querySelectorAll('.emoji-opt').forEach(b => b.classList.toggle('on', b === btn));
    });

    const skinPicker = back.querySelector('#skinPicker');
    skinPicker.addEventListener('click', e => {
      const btn = e.target.closest('.skin-opt');
      if (!btn) return;
      selectedSkin = btn.dataset.skin;
      skinPicker.querySelectorAll('.skin-opt').forEach(b => b.classList.toggle('on', b === btn));
    });

    const cssArea = back.querySelector('#artCss');
    back.querySelector('#cssTemplates').addEventListener('click', e => {
      const btn = e.target.closest('[data-tpl]');
      if (!btn) return;
      const tpl = CSS_TEMPLATES[btn.dataset.tpl];
      if (!tpl) return;
      cssArea.value = (cssArea.value.trim() ? cssArea.value.replace(/\s*$/, '\n\n') : '') + tpl + '\n';
      cssArea.focus();
    });

    back.querySelector('#artSave').addEventListener('click', async () => {
      const title = back.querySelector('#artTitle').value.trim();
      const categoryId = back.querySelector('#artCategory').value || null;
      const summary = back.querySelector('#artSummary').value.trim();
      const customCss = back.querySelector('#artCss').value;
      const errEl = back.querySelector('#artErr');
      if (!title){ errEl.textContent = '标题不能为空'; return; }

      try {
        if (isEdit){
          await api('/articles/' + article.id, {
            method: 'PUT',
            body: { title, categoryId, emoji: selectedEmoji, summary, skin: selectedSkin, customCss }
          });
          toast('文章信息已更新');
          close();
          await loadAll();
          if (state.currentArticle && state.currentArticle.id === article.id){
            await openArticle(article.id, true);
          }
        } else {
          const { id } = await api('/articles', {
            method: 'POST',
            body: { title, categoryId, emoji: selectedEmoji, summary, skin: selectedSkin, customCss }
          });
          toast('新的文章已编入 🐥');
          close();
          await loadAll();
          await openArticle(id);
        }
      } catch (e){ errEl.textContent = e.message; }
    });
  });
}

/* ============================================================
   章节弹窗（纯文本 / HTML）
   ============================================================ */
function openChapterModal(chapter = null){
  const isEdit = !!chapter;
  let contentType = chapter?.contentType || 'plain';

  const html = `
    <h3 class="modal-title">${isEdit ? '✏️ 编辑章节' : '✍️ 写下新章节'}</h3>

    <div class="field">
      <label>章节标题</label>
      <input type="text" id="chTitle" placeholder="例如：第一章 · 云朵上的清晨" value="${esc(chapter?.title || '')}">
    </div>

    <div class="field">
      <label>内容格式</label>
      <div class="format-switch" id="formatSwitch">
        <button type="button" class="format-opt${contentType === 'plain' ? ' on' : ''}" data-format="plain">📝 纯文本（自动换行）</button>
        <button type="button" class="format-opt${contentType === 'html' ? ' on' : ''}" data-format="html">🎨 HTML（可自定义样式）</button>
      </div>
      <p class="hint" id="formatHint"></p>
    </div>

    <div class="field">
      <label>正文内容</label>
      <textarea id="chContent" rows="14" placeholder="写点什么吧…">${esc(chapter?.content || '')}</textarea>
    </div>

    <p class="err" id="chErr"></p>

    <div class="modal-actions">
      <button class="btn ghost" data-close>取消</button>
      <button class="btn" id="chSave">${isEdit ? '保存修改' : '发布章节'}</button>
    </div>
  `;

  showModal(html, (back, close) => {
    const textarea = back.querySelector('#chContent');
    const hint = back.querySelector('#formatHint');
    const switcher = back.querySelector('#formatSwitch');

    function refreshUI(){
      switcher.querySelectorAll('.format-opt').forEach(b =>
        b.classList.toggle('on', b.dataset.format === contentType));
      if (contentType === 'html'){
        textarea.classList.add('mono');
        textarea.placeholder = '可以写 HTML 标签，例如：\n<h1>标题</h1>\n<p>段落文字</p>\n<blockquote>引用</blockquote>';
        hint.innerHTML = '🎨 HTML 模式：会解析标签。可以用 &lt;h1&gt; &lt;p&gt; &lt;strong&gt; &lt;em&gt; &lt;blockquote&gt; &lt;ul&gt; &lt;li&gt; &lt;img&gt; &lt;a&gt; &lt;hr&gt; 等。';
      } else {
        textarea.classList.remove('mono');
        textarea.placeholder = '写点什么吧…';
        hint.textContent = '📝 纯文本模式：换行会保留，标签会原样显示。';
      }
    }
    refreshUI();

    switcher.addEventListener('click', e => {
      const btn = e.target.closest('.format-opt');
      if (!btn) return;
      contentType = btn.dataset.format;
      refreshUI();
    });

    back.querySelector('#chTitle').focus();

    back.querySelector('#chSave').addEventListener('click', async () => {
      const title = back.querySelector('#chTitle').value.trim() || '未命名章节';
      const content = back.querySelector('#chContent').value;
      const errEl = back.querySelector('#chErr');
      try {
        if (isEdit){
          await api('/chapters/' + chapter.id, {
            method: 'PUT',
            body: { title, content, contentType }
          });
          toast('章节已更新');
        } else {
          await api(`/articles/${state.currentArticle.id}/chapters`, {
            method: 'POST',
            body: { title, content, contentType }
          });
          toast('章节已发布 🐣');
        }
        close();
        await loadAll();
        await openArticle(state.currentArticle.id, true);
      } catch (e){ errEl.textContent = e.message; }
    });
  });
}

/* ============================================================
   用户管理
   ============================================================ */
async function openUsersModal(){
  try {
    const users = await api('/users');
    const html = `
      <h3 class="modal-title">👥 用户管理</h3>
      <div id="userList">
        ${users.map(u => `
          <div class="user-row">
            <div class="info">
              <span>${u.role === 'admin' ? '👑' : '🐥'}</span>
              <span class="name">${esc(u.username)}</span>
              <span class="role-pill ${u.role === 'admin' ? 'admin' : ''}">${u.role === 'admin' ? '管理员' : '读者'}</span>
            </div>
            <div class="acts">
              <button class="btn ghost" data-action="toggle-role" data-uid="${u.id}" data-role="${u.role}">
                ${u.role === 'admin' ? '降为读者' : '升为管理员'}
              </button>
              <button class="btn danger" data-action="del-user" data-uid="${u.id}">删除</button>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="modal-actions">
        <button class="btn" data-close>关闭</button>
      </div>
    `;
    showModal(html, (back, close) => {
      back.addEventListener('click', async e => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.dataset.action;
        if (action === 'toggle-role'){
          const uid = btn.dataset.uid;
          const newRole = btn.dataset.role === 'admin' ? 'user' : 'admin';
          try {
            await api(`/users/${uid}/role`, { method: 'PUT', body: { role: newRole } });
            toast('角色已更新');
            close();
            openUsersModal();
          } catch (err){ toast(err.message); }
        }
        if (action === 'del-user'){
          const uid = btn.dataset.uid;
          if (!confirm('确定要删除这个用户吗？')) return;
          try {
            await api('/users/' + uid, { method: 'DELETE' });
            toast('用户已删除');
            close();
            openUsersModal();
          } catch (err){ toast(err.message); }
        }
      });
    });
  } catch (e){ toast(e.message); }
}

/* ============================================================
   打开文章
   ============================================================ */
async function openArticle(id, keepChapterState = false){
  try {
    const a = await api('/articles/' + id);
    state.currentArticle = a;
    state.view = 'reader';
    if (!keepChapterState) state.openChapters = {};
    render();
  } catch (e){ toast(e.message); }
}

/* ============================================================
   新建分类
   ============================================================ */
function openAddCategoryModal(){
  const html = `
    <h3 class="modal-title">📁 新建分类</h3>
    <div class="field">
      <label>分类名称</label>
      <input type="text" id="catName" placeholder="例如：短篇" maxlength="20">
    </div>
    <p class="err" id="catErr"></p>
    <div class="modal-actions">
      <button class="btn ghost" data-close>取消</button>
      <button class="btn" id="catSave">创建</button>
    </div>
  `;
  showModal(html, (back, close) => {
    back.querySelector('#catName').focus();
    const save = async () => {
      const name = back.querySelector('#catName').value.trim();
      const errEl = back.querySelector('#catErr');
      if (!name){ errEl.textContent = '分类名不能为空'; return; }
      try {
        await api('/categories', { method: 'POST', body: { name } });
        toast('分类已创建');
        close();
        await loadAll();
      } catch (e){ errEl.textContent = e.message; }
    };
    back.querySelector('#catSave').addEventListener('click', save);
    back.addEventListener('keydown', e => { if (e.key === 'Enter') save(); });
  });
}

/* ============================================================
   事件
   ============================================================ */
function bindEvents(){
  let searchTimer;
  $('#searchInput').addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.search = e.target.value;
      if (state.view === 'reader'){
        state.view = 'shelf';
        state.currentArticle = null;
      }
      render();
    }, 200);
  });

  document.addEventListener('click', async e => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;

    switch (action){
      case 'login':  openAuthModal('login'); break;
      case 'logout': logout(); break;

      case 'select-cat':
        state.activeCategory = el.dataset.catKey;
        state.view = 'shelf';
        state.currentArticle = null;
        state.openChapters = {};
        render();
        break;

      case 'del-cat': {
        e.stopPropagation();
        const catId = el.dataset.catId;
        const cat = state.categories.find(c => String(c.id) === String(catId));
        if (!cat) return;
        if (!confirm(`确定删除分类「${cat.name}」吗？\n该分类下的书籍将变为「未分类」。`)) return;
        try {
          await api('/categories/' + catId, { method: 'DELETE' });
          if (String(state.activeCategory) === String(catId)) state.activeCategory = 'all';
          toast('分类已删除');
          await loadAll();
        } catch (err){ toast(err.message); }
        break;
      }

      case 'add-cat': openAddCategoryModal(); break;

      case 'new-article':
        if (!isAdmin()) return toast('需要管理员权限');
        openArticleModal();
        break;

      case 'open-article':
        if (e.target.closest('.mini')) return;
        await openArticle(el.dataset.id);
        break;

      case 'edit-article': {
        e.stopPropagation();
        const id = el.dataset.id;
        let article = state.articles.find(a => String(a.id) === String(id));
        if (state.currentArticle && String(state.currentArticle.id) === String(id)){
          article = state.currentArticle;
        }
        if (article) openArticleModal(article);
        break;
      }

      case 'delete-article': {
        e.stopPropagation();
        const id = el.dataset.id;
        if (!confirm('确定要删除这篇文章吗？\n所有章节都会一起消失，无法恢复。')) return;
        try {
          await api('/articles/' + id, { method: 'DELETE' });
          toast('文章已删除');
          if (state.currentArticle && String(state.currentArticle.id) === String(id)){
            state.view = 'shelf';
            state.currentArticle = null;
          }
          await loadAll();
        } catch (err){ toast(err.message); }
        break;
      }

      case 'back-shelf':
        state.view = 'shelf';
        state.currentArticle = null;
        state.openChapters = {};
        render();
        break;

      case 'toggle-chapter':
        state.openChapters[el.dataset.cid] = !state.openChapters[el.dataset.cid];
        renderMain();
        break;

      case 'new-chapter':
        if (!isAdmin()) return toast('需要管理员权限');
        openChapterModal();
        break;

      case 'edit-chapter': {
        e.stopPropagation();
        const cid = el.dataset.cid;
        const ch = state.currentArticle?.chapters.find(c => String(c.id) === String(cid));
        if (ch) openChapterModal(ch);
        break;
      }

      case 'delete-chapter': {
        e.stopPropagation();
        const cid = el.dataset.cid;
        if (!confirm('确定删除这一章吗？')) return;
        try {
          await api('/chapters/' + cid, { method: 'DELETE' });
          toast('章节已删除');
          await loadAll();
          await openArticle(state.currentArticle.id, true);
        } catch (err){ toast(err.message); }
        break;
      }

      case 'manage-users':
        if (!isAdmin()) return;
        openUsersModal();
        break;
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape'){
      const back = document.querySelector('.modal-backdrop');
      if (back) back.remove();
    }
  });
}

/* ============================================================
   启动
   ============================================================ */
async function boot(){
  $('#brandChick').innerHTML = chickSVG();
  bindEvents();
  await refreshUser();
  await loadAll();
}
boot();
