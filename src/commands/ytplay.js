module.exports = {
  name: 'ytplay',
  description: 'Download YouTube video/audio',
  async execute(message, args, sock) {
    const Downloader = require('../lib/Downloader');
    const chat = message.key.remoteJid;
    
    if (args.length === 0) {
      await sock.sendMessage(chat, { text: '❌ Usage: .ytplay <URL>' });
      return;
    }

    const url = args[0];
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      await sock.sendMessage(chat, { text: '❌ Invalid YouTube URL' });
      return;
    }

    try {
      await sock.sendMessage(chat, { text: '⏳ Downloading YouTube...' });
      const result = await Downloader.downloadYouTube(url);

      if (!result.success) {
        await sock.sendMessage(chat, { text: `❌ ${result.error}` });
        return;
      }

      const caption = `
🎬 **YouTube Video**
📺 ${result.title}
⏱️ ${result.duration}s
      `.trim();

      await sock.sendMessage(chat, {
        video: { url: result.url },
        caption: caption,
        mimetype: 'video/mp4'
      });
    } catch (err) {
      console.error('YouTube error:', err);
      await sock.sendMessage(chat, { text: `❌ Error: ${err.message}` });
    }
  }
};
