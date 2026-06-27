const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const SL = require('../lib/SLDesign');

class DB {
  constructor(dbPath = 'data/bot.db') {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    this.db = new Database(dbPath);
    this.init();
  }

  init() {
    this.db.pragma('journal_mode = WAL');
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        jid TEXT PRIMARY KEY,
        name TEXT DEFAULT '',
        level INTEGER DEFAULT 1,
        xp INTEGER DEFAULT 0,
        total_msgs INTEGER DEFAULT 0,
        total_photos INTEGER DEFAULT 0,
        last_xp_time INTEGER DEFAULT 0,
        last_daily_time INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        sender TEXT,
        chat TEXT,
        body TEXT,
        timestamp INTEGER,
        type TEXT
      );
    `);
  }

  getUser(jid) {
    const row = this.db.prepare('SELECT * FROM users WHERE jid = ?').get(jid);
    if (!row) {
      this.db.prepare('INSERT OR IGNORE INTO users (jid) VALUES (?)').run(jid);
      return this.db.prepare('SELECT * FROM users WHERE jid = ?').get(jid);
    }
    return row;
  }

  updateUserName(jid, name) {
    this.db.prepare('UPDATE users SET name = ? WHERE jid = ? AND (name = ? OR name = ?)').run(name, jid, '', 'User');
  }

  addXp(jid, amount, now) {
    const user = this.getUser(jid);
    if (now - user.last_xp_time < 60000) return null;

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

    this.db.prepare('UPDATE users SET level = ?, xp = ?, last_xp_time = ? WHERE jid = ?')
      .run(newLevel, newXp, now, jid);

    return { newLevel, newXp, leveledUp, rankChanged, newRank };
  }

  addXpManual(jid, amount, name) {
    const user = this.getUser(jid);
    if (name) this.updateUserName(jid, name);

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

    this.db.prepare('UPDATE users SET level = ?, xp = ?, last_xp_time = ?, total_photos = total_photos + 1 WHERE jid = ?')
      .run(newLevel, newXp, Date.now(), jid);

    return { newLevel, newXp, leveledUp, rankChanged, newRank };
  }

  incrementMsg(jid) {
    this.db.prepare('UPDATE users SET total_msgs = total_msgs + 1 WHERE jid = ?').run(jid);
  }

  getTopHunters(limit = 10) {
    const rows = this.db.prepare('SELECT * FROM users ORDER BY level DESC, xp DESC LIMIT ?').all(limit);
    return rows;
  }

  saveMessage(msg) {
    try {
      this.db.prepare('INSERT OR IGNORE INTO messages (id, sender, chat, body, timestamp, type) VALUES (?, ?, ?, ?, ?, ?)')
        .run(msg.key.id, msg.key.remoteJid, msg.key.remoteJid, msg.message?.conversation || '', msg.messageTimestamp, msg.type || 'text');
    } catch (e) { }
  }

  close() {
    this.db.close();
  }
}

module.exports = DB;
