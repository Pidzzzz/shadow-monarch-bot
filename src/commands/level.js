const SL = require('../lib/SLDesign');

module.exports = {
  name: 'level',
  description: 'Show your level/profile',
  async execute(message, args, sock) {
    const DB = require('../lib/Database');
    const db = new DB();
    const chat = message.key.remoteJid;
    const sender = message.key.participant || message.key.remoteJid;
    
    try {
      const user = db.getUser(sender);
      const card = SL.makeProfileCard(sender, user.name || 'User', user.level, user.xp);
      await sock.sendMessage(chat, { text: card });
    } catch (err) {
      console.error('Level command error:', err);
      await sock.sendMessage(chat, { text: `❌ Error: ${err.message}` });
    } finally {
      db.close();
    }
  }
};
