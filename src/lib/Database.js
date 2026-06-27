const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

class DB {
  constructor(dbPath = 'data/bot.db') {
    this.dbPath = dbPath;
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    this._ready = this._init();
  }

  async _init() {
    const SQL = await initSqlJs();
    if (fs.existsSync(this.dbPath)) {
      const fileBuffer = fs.readFileSync(this.dbPath);
      this.db = new SQL.Database(fileBuffer);
    } else {
      this.db = new SQL.Database();
    }
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        jid TEXT PRIMARY KEY,
        name TEXT DEFAULT '',
        level INTEGER DEFAULT 1,
        xp INTEGER DEFAULT 0,
        total_msgs INTEGER DEFAULT 0,
        total_photos INTEGER DEFAULT 0,
        last_xp_time INTEGER DEFAULT 0,
        last_daily_time INTEGER DEFAULT 0
      )
    `);
    this.db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        sender TEXT,
        chat TEXT,
        body TEXT,
        timestamp INTEGER,
        type TEXT
      )
    `);
    this._save();
  }

  async _ensureReady() {
    if (!this._ready) throw new Error('DB not initialized');
    await this._ready;
  }

  _save() {
    const data = this.db.export();
    fs.writeFileSync(this.dbPath, Buffer.from(data));
  }

  _queryOne(sql, params = []) {
    const result = this.db.exec(sql, params);
    if (!result.length) return undefined;
    const cols = result[0].columns;
    const row = result[0].values[0];
    const obj = {};
    cols.forEach((c, i) => { obj[c] = row[i]; });
    return obj;
  }

  _queryAll(sql, params = []) {
    const result = this.db.exec(sql, params);
    if (!result.length) return [];
    const cols = result[0].columns;
    return result[0].values.map(row => {
      const obj = {};
      cols.forEach((c, i) => { obj[c] = row[i]; });
      return obj;
    });
  }

  _run(sql, params = []) {
    this.db.run(sql, params);
    this._save();
  }

  getUser(jid) {
    let row = this._queryOne('SELECT * FROM users WHERE jid = ?', [jid]);
    if (!row) {
      this._run('INSERT OR IGNORE INTO users (jid) VALUES (?)', [jid]);
      row = this._queryOne('SELECT * FROM users WHERE jid = ?', [jid]);
    }
    return row;
  }

  updateUserName(jid, name) {
    this._run("UPDATE users SET name = ? WHERE jid = ? AND (name = '' OR name = 'User')", [name, jid]);
  }

  addXp(jid, amount, now) {
    const user = this.getUser(jid);
    if (now - user.last_xp_time < 60000) return null;

    const SL = require('../lib/SLDesign');
    const newTotalXp = user.xp + amount;
    let newLevel = user.level;
    let newXp = newTotalXp;
    let leveledUp = false;

    while (newXp >= SL.getXpForLevel(newLevel + 1)) {
      newXp -= SL.getXpForLevel(newLevel + 1);
      newLevel++;
      leveledUp = true;
    }

    const oldRank = SL.getRank(user.level);
    const newRank = SL.getRank(newLevel);
    const rankChanged = newRank.name !== oldRank.name;

    this._run('UPDATE users SET level = ?, xp = ?, last_xp_time = ? WHERE jid = ?', [newLevel, newXp, now, jid]);

    return { newLevel, newXp, leveledUp, rankChanged, newRank };
  }

  addXpManual(jid, amount, name) {
    const user = this.getUser(jid);
    if (name) this.updateUserName(jid, name);

    const SL = require('../lib/SLDesign');
    const newTotalXp = user.xp + amount;
    let newLevel = user.level;
    let newXp = newTotalXp;
    let leveledUp = false;

    while (newXp >= SL.getXpForLevel(newLevel + 1)) {
      newXp -= SL.getXpForLevel(newLevel + 1);
      newLevel++;
      leveledUp = true;
    }

    const oldRank = SL.getRank(user.level);
    const newRank = SL.getRank(newLevel);
    const rankChanged = newRank.name !== oldRank.name;

    this._run('UPDATE users SET level = ?, xp = ?, last_xp_time = ?, total_photos = total_photos + 1 WHERE jid = ?', [newLevel, newXp, Date.now(), jid]);

    return { newLevel, newXp, leveledUp, rankChanged, newRank };
  }

  incrementMsg(jid) {
    this._run('UPDATE users SET total_msgs = total_msgs + 1 WHERE jid = ?', [jid]);
  }

  getTopHunters(limit = 10) {
    return this._queryAll('SELECT * FROM users ORDER BY level DESC, xp DESC LIMIT ?', [limit]);
  }

  saveMessage(msg) {
    try {
      this._run('INSERT OR IGNORE INTO messages (id, sender, chat, body, timestamp, type) VALUES (?, ?, ?, ?, ?, ?)',
        [msg.key.id, msg.key.remoteJid, msg.key.remoteJid, msg.message?.conversation || '', msg.messageTimestamp, msg.type || 'text']);
    } catch (e) { }
  }

  close() {
    this._save();
    this.db.close();
  }
}

module.exports = DB;
