const fs = require('fs');
const path = require('path');
const SL = require('../lib/SLDesign');

const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

class DB {
  constructor() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    this.users = {};
    this._load();
  }

  _load() {
    try {
      if (fs.existsSync(USERS_FILE)) {
        this.users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
      }
    } catch (e) {
      this.users = {};
    }
  }

  _save() {
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(this.users, null, 2));
    } catch (e) { }
  }

  getUser(jid) {
    if (!this.users[jid]) {
      this.users[jid] = {
        jid,
        name: 'User',
        level: 1,
        xp: 0,
        total_msgs: 0,
        total_photos: 0,
        last_xp_time: 0,
        last_daily_time: 0
      };
      this._save();
    }
    return this.users[jid];
  }

  updateUserName(jid, name) {
    const user = this.getUser(jid);
    if (!user.name || user.name === 'User') {
      user.name = name;
      this._save();
    }
  }

  addXp(jid, amount, now) {
    const user = this.getUser(jid);
    if (now - user.last_xp_time < 60000) return null;

    let newXp = user.xp + amount;
    let newLevel = user.level;
    let leveledUp = false;

    while (newXp >= SL.getXpForLevel(newLevel + 1)) {
      newXp -= SL.getXpForLevel(newLevel + 1);
      newLevel++;
      leveledUp = true;
    }

    const oldRank = SL.getRank(user.level);
    const newRank = SL.getRank(newLevel);
    const rankChanged = newRank.name !== oldRank.name;

    user.level = newLevel;
    user.xp = newXp;
    user.last_xp_time = now;
    user.total_msgs++;
    this._save();

    return { newLevel, newXp, leveledUp, rankChanged, newRank };
  }

  addXpManual(jid, amount, name) {
    const user = this.getUser(jid);
    if (name) { user.name = name; }

    let newXp = user.xp + amount;
    let newLevel = user.level;
    let leveledUp = false;

    while (newXp >= SL.getXpForLevel(newLevel + 1)) {
      newXp -= SL.getXpForLevel(newLevel + 1);
      newLevel++;
      leveledUp = true;
    }

    const oldRank = SL.getRank(user.level);
    const newRank = SL.getRank(newLevel);
    const rankChanged = newRank.name !== oldRank.name;

    user.level = newLevel;
    user.xp = newXp;
    user.last_xp_time = Date.now();
    user.total_photos++;
    this._save();

    return { newLevel, newXp, leveledUp, rankChanged, newRank };
  }

  incrementMsg(jid) {
    const user = this.getUser(jid);
    user.total_msgs++;
    this._save();
  }

  getTopHunters(limit = 10) {
    return Object.values(this.users)
      .sort((a, b) => b.level - a.level || b.xp - a.xp)
      .slice(0, limit);
  }

  close() {
    this._save();
  }
}

module.exports = DB;
