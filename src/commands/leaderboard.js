const SL = require('../lib/SLDesign');

module.exports = {
  name: 'leaderboard',
  description: 'Show top hunters',
  async execute(message, args, sock) {
    const DB = require('../lib/Database');
    const db = new DB();
    const chat = message.key.remoteJid;
    
    try {
      const topUsers = db.getTopHunters(10);
      let text = SL.makeLeaderboardHeader() + '\n';
      
      topUsers.forEach((user, idx) => {
        const rank = SL.getRank(user.level);
        text += SL.makeLeaderboardEntry(idx + 1, user.name || 'User', user.level, user.xp, rank) + '\n';
      });
      
      text += SL.makeBorderBottom();
      await sock.sendMessage(chat, { text });
    } catch (err) {
      console.error('Leaderboard error:', err);
      await sock.sendMessage(chat, { text: `❌ Error: ${err.message}` });
    } finally {
      db.close();
    }
  }
};
