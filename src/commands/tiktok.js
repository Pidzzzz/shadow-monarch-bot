module.exports = {
  name: 'tiktok',
  description: 'Download TikTok video',
  async execute(message, args, sock) {
    const Downloader = require('../lib/Downloader');
    const chat = message.key.remoteJid;
    
    if (args.length === 0) {
      await sock.sendMessage(chat, { text: '❌ Usage: .tiktok <URL>' });
      return;
    }

    const url = args[0];
    if (!url.includes('tiktok.com')) {
      await sock.sendMessage(chat, { text: '❌ Invalid TikTok URL' });
      return;
    }

    try {
      await sock.sendMessage(chat, { text: '⏳ Downloading TikTok...' });
      const result = await Downloader.downloadTikTok(url);

      if (!result.success) {
        await sock.sendMessage(chat, { text: `❌ ${result.error}` });
        return;
      }

      const caption = `
🎵 **TikTok Video**
📹 ${result.title}
      `.trim();

      await sock.sendMessage(chat, {
        video: { url: result.video },
        caption: caption,
        mimetype: 'video/mp4'
      });
    } catch (err) {
      console.error('TikTok error:', err);
      await sock.sendMessage(chat, { text: `❌ Error: ${err.message}` });
    }
  }
};
