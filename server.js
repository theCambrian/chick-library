const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'chick-library-secret-change-me-in-prod';

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

/* ============ 中间件 ============ */
function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: '请先登录' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, username, role FROM users WHERE id = ?').get(payload.id);
    if (!user) return res.status(401).json({ error: '用户不存在' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: '登录已过期，请重新登录' });
  }
}

function adminRequired(req, res, next) {
  authRequired(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: '需要管理员权限' });
    next();
  });
}

/* ============ 认证 ============ */
app.post('/api/auth/register', (req, res) => {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');
  if (username.length < 2 || username.length > 20) return res.status(400).json({ error: '用户名长度需在 2-20 个字符之间' });
  if (password.length < 6) return res.status(400).json({ error: '密码至少 6 位' });
  if (db.prepare('SELECT id FROM users WHERE username = ?').get(username)) return res.status(409).json({ error: '用户名已被注册' });

  const count = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  const role = count === 0 ? 'admin' : 'user';
  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare('INSERT INTO users (username, password_hash, role, created_at) VALUES (?, ?, ?, ?)').run(username, hash, role, Date.now());
  const user = { id: info.lastInsertRowid, username, role };
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    token, user,
    message: role === 'admin' ? '🎉 你是第一位用户，已自动成为管理员！' : '注册成功，欢迎来到小鸡图书馆'
  });
});

app.post('/api/auth/login', (req, res) => {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!row || !bcrypt.compareSync(password, row.password_hash)) return res.status(401).json({ error: '用户名或密码错误' });
  const user = { id: row.id, username: row.username, role: row.role };
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user });
});

app.get('/api/auth/me', authRequired, (req, res) => res.json({ user: req.user }));

/* ============ 分类 ============ */
app.get('/api/categories', (req, res) => {
  const rows = db.prepare(`
    SELECT c.id, c.name,
      (SELECT COUNT(*) FROM articles a WHERE a.category_id = c.id) AS count
    FROM categories c ORDER BY c.id ASC
  `).all();
  res.json(rows);
});

app.post('/api/categories', adminRequired, (req, res) => {
  const name = String(req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: '分类名不能为空' });
  if (name.length > 20) return res.status(400).json({ error: '分类名太长啦' });
  if (db.prepare('SELECT id FROM categories WHERE name = ?').get(name)) return res.status(409).json({ error: '这个分类已经存在了' });
  const info = db.prepare('INSERT INTO categories (name, created_at) VALUES (?, ?)').run(name, Date.now());
  res.json({ id: info.lastInsertRowid, name, count: 0 });
});

app.delete('/api/categories/:id', adminRequired, (req, res) => {
  const id = Number(req.params.id);
  if (!db.prepare('SELECT id FROM categories WHERE id = ?').get(id)) return res.status(404).json({ error: '分类不存在' });
  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  res.json({ ok: true });
});

/* ============ 文章 ============ */
app.get('/api/articles', (req, res) => {
  const category = req.query.category;
  const q = String(req.query.q || '').trim();
  let sql = `
    SELECT a.id, a.title, a.emoji, a.summary, a.skin, a.created_at, a.updated_at,
           c.id AS category_id, c.name AS category_name,
           (SELECT COUNT(*) FROM chapters ch WHERE ch.article_id = a.id) AS chapter_count
    FROM articles a LEFT JOIN categories c ON c.id = a.category_id WHERE 1=1
  `;
  const params = [];
  if (category && category !== 'all') { sql += ' AND c.name = ?'; params.push(category); }
  if (q) {
    const like = `%${q}%`;
    sql += ` AND (a.title LIKE ? OR a.summary LIKE ? OR c.name LIKE ?
      OR EXISTS (SELECT 1 FROM chapters ch WHERE ch.article_id = a.id AND (ch.title LIKE ? OR ch.content LIKE ?)))`;
    params.push(like, like, like, like, like);
  }
  sql += ' ORDER BY a.updated_at DESC';
  const rows = db.prepare(sql).all(...params);
  res.json(rows.map(r => ({
    id: r.id, title: r.title, emoji: r.emoji, summary: r.summary,
    skin: r.skin || 'default',
    category: r.category_name, categoryId: r.category_id,
    chapterCount: r.chapter_count, createdAt: r.created_at, updatedAt: r.updated_at
  })));
});

app.get('/api/articles/:id', (req, res) => {
  const id = Number(req.params.id);
  const a = db.prepare(`
    SELECT a.*, c.name AS category_name FROM articles a
    LEFT JOIN categories c ON c.id = a.category_id WHERE a.id = ?
  `).get(id);
  if (!a) return res.status(404).json({ error: '文章不存在' });

  const chapters = db.prepare(`
    SELECT id, title, content, content_type, created_at, updated_at
    FROM chapters WHERE article_id = ? ORDER BY order_index ASC, id ASC
  `).all(id);

  res.json({
    id: a.id, title: a.title, emoji: a.emoji, summary: a.summary,
    skin: a.skin || 'default',
    customCss: a.custom_css || '',
    category: a.category_name, categoryId: a.category_id,
    createdAt: a.created_at, updatedAt: a.updated_at,
    chapters: chapters.map(c => ({
      id: c.id, title: c.title, content: c.content,
      contentType: c.content_type || 'plain',
      createdAt: c.created_at, updatedAt: c.updated_at
    }))
  });
});

app.post('/api/articles', adminRequired, (req, res) => {
  const title = String(req.body.title || '').trim();
  if (!title) return res.status(400).json({ error: '书名不能为空' });
  const categoryId = req.body.categoryId ? Number(req.body.categoryId) : null;
  const emoji = String(req.body.emoji || '🐥').slice(0, 8);
  const summary = String(req.body.summary || '').trim();
  const skin = String(req.body.skin || 'default').slice(0, 20);
  const customCss = String(req.body.customCss || '').slice(0, 50000);
  const now = Date.now();
  const info = db.prepare(`
    INSERT INTO articles (title, category_id, emoji, summary, skin, custom_css, author_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(title, categoryId, emoji, summary, skin, customCss, req.user.id, now, now);
  res.json({ id: info.lastInsertRowid });
});

app.put('/api/articles/:id', adminRequired, (req, res) => {
  const id = Number(req.params.id);
  if (!db.prepare('SELECT id FROM articles WHERE id = ?').get(id)) return res.status(404).json({ error: '文章不存在' });
  const title = String(req.body.title || '').trim();
  if (!title) return res.status(400).json({ error: '书名不能为空' });
  const categoryId = req.body.categoryId ? Number(req.body.categoryId) : null;
  const emoji = String(req.body.emoji || '🐥').slice(0, 8);
  const summary = String(req.body.summary || '').trim();
  const skin = String(req.body.skin || 'default').slice(0, 20);
  const customCss = String(req.body.customCss || '').slice(0, 50000);
  db.prepare(`UPDATE articles SET title=?, category_id=?, emoji=?, summary=?, skin=?, custom_css=?, updated_at=? WHERE id=?`)
    .run(title, categoryId, emoji, summary, skin, customCss, Date.now(), id);
  res.json({ ok: true });
});

app.delete('/api/articles/:id', adminRequired, (req, res) => {
  const id = Number(req.params.id);
  if (!db.prepare('SELECT id FROM articles WHERE id = ?').get(id)) return res.status(404).json({ error: '文章不存在' });
  db.prepare('DELETE FROM articles WHERE id = ?').run(id);
  res.json({ ok: true });
});

/* ============ 章节 ============ */
app.post('/api/articles/:id/chapters', adminRequired, (req, res) => {
  const articleId = Number(req.params.id);
  if (!db.prepare('SELECT id FROM articles WHERE id = ?').get(articleId)) return res.status(404).json({ error: '文章不存在' });
  const title = String(req.body.title || '').trim() || '未命名章节';
  const content = String(req.body.content || '');
  const contentType = req.body.contentType === 'html' ? 'html' : 'plain';
  const now = Date.now();
  const max = db.prepare('SELECT COALESCE(MAX(order_index), -1) AS m FROM chapters WHERE article_id = ?').get(articleId).m;
  const info = db.prepare(`
    INSERT INTO chapters (article_id, title, content, content_type, order_index, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(articleId, title, content, contentType, max + 1, now, now);
  db.prepare('UPDATE articles SET updated_at = ? WHERE id = ?').run(now, articleId);
  res.json({ id: info.lastInsertRowid });
});

app.put('/api/chapters/:id', adminRequired, (req, res) => {
  const id = Number(req.params.id);
  const ch = db.prepare('SELECT id, article_id FROM chapters WHERE id = ?').get(id);
  if (!ch) return res.status(404).json({ error: '章节不存在' });
  const title = String(req.body.title || '').trim() || '未命名章节';
  const content = String(req.body.content || '');
  const contentType = req.body.contentType === 'html' ? 'html' : 'plain';
  const now = Date.now();
  db.prepare('UPDATE chapters SET title=?, content=?, content_type=?, updated_at=? WHERE id=?')
    .run(title, content, contentType, now, id);
  db.prepare('UPDATE articles SET updated_at = ? WHERE id = ?').run(now, ch.article_id);
  res.json({ ok: true });
});

app.delete('/api/chapters/:id', adminRequired, (req, res) => {
  const id = Number(req.params.id);
  const ch = db.prepare('SELECT id, article_id FROM chapters WHERE id = ?').get(id);
  if (!ch) return res.status(404).json({ error: '章节不存在' });
  db.prepare('DELETE FROM chapters WHERE id = ?').run(id);
  db.prepare('UPDATE articles SET updated_at = ? WHERE id = ?').run(Date.now(), ch.article_id);
  res.json({ ok: true });
});

/* ============ 用户管理 ============ */
app.get('/api/users', adminRequired, (req, res) => {
  res.json(db.prepare('SELECT id, username, role, created_at FROM users ORDER BY id ASC').all());
});

app.put('/api/users/:id/role', adminRequired, (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user.id) return res.status(400).json({ error: '不能修改自己的角色' });
  const role = req.body.role === 'admin' ? 'admin' : 'user';
  if (!db.prepare('SELECT id FROM users WHERE id = ?').get(id)) return res.status(404).json({ error: '用户不存在' });
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
  res.json({ ok: true });
});

app.delete('/api/users/:id', adminRequired, (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user.id) return res.status(400).json({ error: '不能删除自己' });
  if (!db.prepare('SELECT id FROM users WHERE id = ?').get(id)) return res.status(404).json({ error: '用户不存在' });
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  res.json({ ok: true });
});

/* ============ 兜底 ============ */
app.use((req, res) => res.status(404).json({ error: '接口不存在' }));
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: '服务器出错了' }); });

app.listen(PORT, () => {
  console.log('');
  console.log('  🐥  小鸡图书馆已启动');
  console.log(`  🌐  http://localhost:${PORT}`);
  console.log('');
});