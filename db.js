const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'data.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/* ============ 建表 ============ */
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'user',
    created_at    INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS categories (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT UNIQUE NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS articles (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    category_id INTEGER,
    emoji       TEXT DEFAULT '🐥',
    summary     TEXT DEFAULT '',
    skin        TEXT NOT NULL DEFAULT 'default',
    custom_css  TEXT NOT NULL DEFAULT '',
    author_id   INTEGER,
    created_at  INTEGER NOT NULL,
    updated_at  INTEGER NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (author_id)   REFERENCES users(id)      ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS chapters (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id   INTEGER NOT NULL,
    title        TEXT NOT NULL,
    content      TEXT DEFAULT '',
    content_type TEXT NOT NULL DEFAULT 'plain',
    order_index  INTEGER NOT NULL DEFAULT 0,
    created_at   INTEGER NOT NULL,
    updated_at   INTEGER NOT NULL,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_chapters_article ON chapters(article_id, order_index);
  CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
`);

/* ============ 自动升级旧数据库 ============ */
function ensureColumn(table, column, definition){
  const cols = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!cols.some(c => c.name === column)){
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    console.log(`🔧 为 ${table} 表添加新字段：${column}`);
  }
}
ensureColumn('articles', 'skin', "TEXT NOT NULL DEFAULT 'default'");
ensureColumn('articles', 'custom_css', "TEXT NOT NULL DEFAULT ''");
ensureColumn('chapters', 'content_type', "TEXT NOT NULL DEFAULT 'plain'");

/* ============ 初始示例数据 ============ */
function seed() {
  const catCount = db.prepare('SELECT COUNT(*) AS c FROM categories').get().c;
  const artCount = db.prepare('SELECT COUNT(*) AS c FROM articles').get().c;
  if (catCount > 0 || artCount > 0) return;

  const now = Date.now();
  const addCat = db.prepare('INSERT INTO categories (name, created_at) VALUES (?, ?)');
  const catIds = {};
  for (const name of ['童话故事', '诗歌', '随笔', '奇幻']) {
    catIds[name] = addCat.run(name, now).lastInsertRowid;
  }

  const addArt = db.prepare(`
    INSERT INTO articles (title, category_id, emoji, summary, skin, custom_css, author_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?)
  `);
  const addCh = db.prepare(`
    INSERT INTO chapters (article_id, title, content, content_type, order_index, created_at, updated_at)
    VALUES (?, ?, ?, 'plain', ?, ?, ?)
  `);

  const poemCss = `#chick-reader .chapter-body {
  font-family: "Songti SC", Georgia, serif;
  text-align: center;
  line-height: 2.2;
}
#chick-reader .chapter-body p {
  margin: 1.4em 0;
}`;

  const data = [
    {
      title: '住在云朵上的小鸡',
      category: '童话故事',
      emoji: '🐥',
      summary: '一只小鸡在云朵上盖起了小房子，它想收集全世界的晚安。',
      skin: 'default',
      css: '',
      chapters: [
        ['第一章 · 云朵上的清晨',
         '天还没亮，云朵就软软地翻了个身。\n\n小鸡抖了抖绒毛，推开那扇用蒲公英做的门。\n\n「今天也要收集一个晚安呀。」它这样对自己说。'],
        ['第二章 · 会发光的露珠',
         '云朵下面挂着一排露珠，每一颗里面都藏着一小段月光。\n\n小鸡小心翼翼地摘下一颗，放进围裙的口袋里。\n\n口袋亮了一整夜。']
      ]
    },
    {
      title: '星星掉进了牛奶里',
      category: '童话故事',
      emoji: '⭐',
      summary: '深夜的厨房，一颗小星星掉进了温热的牛奶，于是整间屋子都亮了起来。',
      skin: 'night',
      css: '',
      chapters: [
        ['第一章 · 深夜的厨房',
         '午夜十二点，冰箱轻轻地哼起了歌。\n\n一颗星星从窗口跌进来，扑通一声，掉进了那杯还冒着热气的牛奶里。\n\n牛奶变成了银河的颜色。']
      ]
    },
    {
      title: '关于慢慢走这件事',
      category: '随笔',
      emoji: '🍀',
      summary: '写给每一个走得很慢、却一直没有停下的人。',
      skin: 'paper',
      css: '',
      chapters: [
        ['写在前面',
         '<p>我一直觉得，<strong>走得慢不是缺点</strong>。</p>\n<blockquote>就像春天不会因为来得晚一点，就少开一朵花。</blockquote>']
      ]
    },
    {
      title: '蓝色鲸鱼与粉色月亮',
      category: '奇幻',
      emoji: '🌙',
      summary: '鲸鱼游过整片夜空，只为把月亮送回它该在的地方。',
      skin: 'ocean',
      css: '',
      chapters: [
        ['第一章 · 起航',
         '鲸鱼说，它见过最深的海，也见过最高的天。\n\n但它从没见过月亮掉下来。\n\n直到那个粉色的夜晚。']
      ]
    },
    {
      title: '三行小诗',
      category: '诗歌',
      emoji: '🌷',
      summary: '很短的三行诗，用自定义 CSS 排成居中样式。',
      skin: 'default',
      css: poemCss,
      chapters: [
        ['春',
         '<p>云朵是天空的<br>枕头</p><p>我把梦<br>轻轻放在上面</p><p>晚安</p>']
      ]
    }
  ];

  const tx = db.transaction(() => {
    for (const a of data) {
      const artId = addArt.run(a.title, catIds[a.category], a.emoji, a.summary, a.skin, a.css, now, now).lastInsertRowid;
      a.chapters.forEach(([t, c], i) => {
        addCh.run(artId, t, c, i, now - i * 1000, now - i * 1000);
      });
    }
    db.prepare(`
      UPDATE chapters SET content_type = 'html'
      WHERE article_id IN (SELECT id FROM articles WHERE title IN ('关于慢慢走这件事', '三行小诗'))
    `).run();
  });
  tx();
  console.log('🌱 已写入示例数据');
}

seed();

module.exports = db;