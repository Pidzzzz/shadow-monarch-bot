const SL = require('../lib/SLDesign');

module.exports = {
  name: 'help',
  description: 'Show available commands',
  async execute(message, args, sock) {
    const chat = message.key.remoteJid;
    const helpText = [
      SL.makeBorder(),
      '║     ⚔️ SHADOW MONARCH ⚔️       ║',
      '║          BOT COMMANDS            ║',
      SL.makeMidBorder(),
      '║ 📍 Leveling',
      '║  .level    — Your hunter profile',
      '║  .leaderboard — Top hunters',
      '║',
      '║ 🎨 Media',
      '║  .sticker  — Reply image → sticker',
      '║',
      '║ ⬇️ Downloader',
      '║  .tiktok <url> — TikTok video',
      '║  .ytplay <url> — YouTube video',
      '║',
      '║ 🔧 Utility',
      '║  .ping     — Check bot status',
      '║  .info     — Bot information',
      '║  .echo <text> — Repeat text',
      '║',
      '║ 💡 Tips',
      '║  Send photos for bonus XP!',
      '║  Join groups to earn XP too',
      SL.makeBorderBottom()
    ].join('\n');
    await sock.sendMessage(chat, { text: helpText });
  }
};
