const RANKS = {
  E: { name: 'E-Rank', emoji: '🅴', min: 1,   color: '#808080', title: 'Awakened' },
  D: { name: 'D-Rank', emoji: '🅳', min: 5,   color: '#CD7F32', title: 'Novice Hunter' },
  C: { name: 'C-Rank', emoji: '🅲', min: 10,  color: '#C0C0C0', title: 'Veteran Hunter' },
  B: { name: 'B-Rank', emoji: '🅱️', min: 20,  color: '#FFD700', title: 'Elite Hunter' },
  A: { name: 'A-Rank', emoji: '🅰️', min: 35,  color: '#FF4500', title: 'Master Hunter' },
  S: { name: 'S-Rank', emoji: '🆂', min: 50,  color: '#9B59B6', title: "Shadow Monarch's Vessel" },
  SS: { name: 'National Level', emoji: '👑', min: 70, color: '#FF1493', title: 'Shadow Monarch' }
};

function getRank(level) {
  if (level >= 70) return RANKS.SS;
  if (level >= 50) return RANKS.S;
  if (level >= 35) return RANKS.A;
  if (level >= 20) return RANKS.B;
  if (level >= 10) return RANKS.C;
  if (level >= 5)  return RANKS.D;
  return RANKS.E;
}

function getXpForLevel(level) {
  return Math.floor(100 * Math.pow(level, 1.5));
}

function makeXpBar(current, needed, size = 10) {
  const pct = Math.min(current / needed, 1);
  const filled = Math.round(pct * size);
  return '█'.repeat(filled) + '░'.repeat(size - filled);
}

function makeSeparator() {
  return '━'.repeat(28);
}

function makeBorder() {
  return '╔══════════════════════════════════╗';
}

function makeBorderBottom() {
  return '╚══════════════════════════════════╝';
}

function makeMidBorder() {
  return '╠══════════════════════════════════╣';
}

function makeProfileCard(jid, name, level, xp) {
  const rank = getRank(level);
  const xpNeeded = getXpForLevel(level);
  const xpNext = getXpForLevel(level + 1);
  const bar = makeXpBar(xp, xpNext, 15);

  return [
    makeBorder(),
    '║     ⚔️  SHADOW MONARCH  ⚔️      ║',
    '║         LEVEL SYSTEM             ║',
    makeMidBorder(),
    `║ 👤 ${name}`,
    `║ ${rank.emoji} ${rank.name}`,
    `║ ⚡ Level: ${level}`,
    `║ 📊 XP: ${xp} / ${xpNext}`,
    `║ ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰ ▸ ${Math.floor(xp/xpNext*100)}%`,
    makeMidBorder(),
    `║ 🏷️ Title: ${rank.title}`,
    makeBorderBottom()
  ].join('\n');
}

function makeLevelUpMessage(name, oldLevel, newLevel) {
  const newRank = getRank(newLevel);
  return [
    '⚡⚡⚡ **LEVEL UP** ⚡⚡⚡',
    '',
    '┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓',
    `┃ 👤 ${name}`,
    `┃ ⬆️ Level ${oldLevel} → ${newLevel}`,
    `┃ ${newRank.emoji} ${newRank.name}`,
    '┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛',
    '',
    '「 The shadows grow stronger... 」'
  ].join('\n');
}

function makeRankUpMessage(name, newRank) {
  return [
    '🏆🏆🏆 **RANK UP** 🏆🏆🏆',
    '',
    '┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓',
    `┃ 👤 ${name}`,
    `┃ 🆕 ${newRank.emoji} ${newRank.name}`,
    `┃ 🏷️ New Title: ${newRank.title}`,
    '┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛',
    '',
    '「 You have become stronger. 」'
  ].join('\n');
}

function makeWelcomeMessage(name, level) {
  const rank = getRank(level);
  return [
    makeBorder(),
    '║       🌀 GATE OPENED 🌀         ║',
    makeMidBorder(),
    `║ 👤 Hunter: ${name}`,
    `║ ${rank.emoji} ${rank.name} | Level ${level}`,
    '║',
    '║ 「 Welcome to the dungeon... 」',
    makeBorderBottom()
  ].join('\n');
}

function makePhotoXpGain(name, gained, level, xp) {
  const rank = getRank(level);
  const xpNeeded = getXpForLevel(level + 1);
  return [
    `📸 **Photo detected** — +${gained} XP`,
    `👤 ${name} | ${rank.emoji} Lv.${level} [${xp}/${xpNeeded}]`,
    '「 The system recognizes your contribution. 」'
  ].join('\n');
}

function makeLeaderboardHeader() {
  return [
    makeBorder(),
    '║     🏆  SHADOW ARMY  🏆        ║',
    '║        TOP HUNTERS               ║',
    makeMidBorder()
  ].join('\n');
}

function makeLeaderboardEntry(rank, name, level, xp, rankInfo) {
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
  return `${medal} ${rankInfo.emoji} Lv.${level} ${name} [${xp} XP]`;
}

module.exports = {
  RANKS,
  getRank,
  getXpForLevel,
  makeXpBar,
  makeSeparator,
  makeBorder,
  makeBorderBottom,
  makeMidBorder,
  makeProfileCard,
  makeLevelUpMessage,
  makeRankUpMessage,
  makeWelcomeMessage,
  makePhotoXpGain,
  makeLeaderboardHeader,
  makeLeaderboardEntry
};
