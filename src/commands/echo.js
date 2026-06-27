module.exports = {
  name: 'echo',
  description: 'Echo text back',
  async execute(message, args, sock) {
    const chat = message.key.remoteJid;
    if (args.length === 0) {
      await sock.sendMessage(chat, { text: '❌ Usage: .echo <text>' });
      return;
    }
    const text = args.join(' ');
    await sock.sendMessage(chat, { text });
  }
};
