module.exports = {
  name: 'ping',
  description: 'Check bot status',
  async execute(message, args, sock) {
    const chat = message.key.remoteJid;
    await sock.sendMessage(chat, { text: 'Pong! 🏓 Bot is online.' });
  }
};
