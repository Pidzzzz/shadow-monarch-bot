const Database = require('better-sqlite3');
const path = require('path');

class MessageStore {
  constructor(dbPath = 'data/messages.db') {
    this.db = new Database(dbPath);
    this.init();
  }

  init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        sender TEXT,
        chat TEXT,
        body TEXT,
        timestamp INTEGER,
        type TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_sender ON messages(sender);
      CREATE INDEX IF NOT EXISTS idx_chat ON messages(chat);
    `);
  }

  saveMessage(msg) {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO messages (id, sender, chat, body, timestamp, type)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(msg.key.id, msg.key.remoteJid, msg.key.remoteJid, msg.message?.conversation || '', msg.messageTimestamp, msg.type);
  }

  close() {
    this.db.close();
  }
}

module.exports = MessageStore;
