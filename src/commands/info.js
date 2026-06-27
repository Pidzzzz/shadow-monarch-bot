const SL = require('../lib/SLDesign');

module.exports = {
  name: 'info',
  description: 'Bot information',
  async execute(message, args, sock) {
    const chat = message.key.remoteJid;
    const infoText = [
      SL.makeBorder(),
      '║     ⚔️ SHADOW MONARCH ⚔️       ║',
      '║          BOT INFO                ║',
      SL.makeMidBorder(),
      `║ Name: ${process.env.BOT_NAME || 'Shadow Monarch'}`,
      '║ Version: 1.0.0',
      '║ Theme: Solo Leveling',
      `║ Mode: ${process.env.MODE || 'public'}`,
      `║ Prefix: ${process.env.PREFIX || '.'}`,
      SL.makeBorderBottom()
    ].join('\n');
    await sock.sendMessage(chat, { text: infoText });
  }
};
