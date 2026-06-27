module.exports = {
  name: 'sticker',
  description: 'Convert image/video to sticker',
  async execute(message, args, sock) {
    const StickerMaker = require('../lib/StickerMaker');
    const chat = message.key.remoteJid;
    
    try {
      const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg || !quotedMsg.imageMessage) {
        await sock.sendMessage(chat, { text: '❌ Reply to image dengan `.sticker`' });
        return;
      }

      await sock.sendMessage(chat, { text: '⏳ Processing sticker...' });

      const mediaKey = quotedMsg.imageMessage.mediaKey;
      const imageBuffer = await sock.downloadMediaMessage(quotedMsg);
      const stickerBuffer = await StickerMaker.imageToSticker(imageBuffer, {
        width: 512,
        height: 512
      });

      await sock.sendMessage(chat, {
        sticker: stickerBuffer
      });
    } catch (err) {
      console.error('Sticker command error:', err);
      await sock.sendMessage(chat, { text: `❌ Error: ${err.message}` });
    }
  }
};
