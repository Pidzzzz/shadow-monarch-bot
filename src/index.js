require('dotenv').config();

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');
const CommandHandler = require('./lib/CommandHandler');
const DB = require('./lib/Database');
const SL = require('./lib/SLDesign');
const StickerMaker = require('./lib/StickerMaker');

const PREFIX = process.env.PREFIX || '.';
const handler = new CommandHandler(PREFIX);
const db = new DB();

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');

  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: process.env.LOG_LEVEL || 'warn' }),
    browser: ['Ubuntu', 'Chrome', '20.0.04'],
    printQRInTerminal: true,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) console.log('Scan QR code above with WhatsApp');
    if (connection === 'open') console.log('✅ Shadow Monarch Bot connected!');
    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = reason !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        console.log('🔄 Reconnecting...');
        startBot();
      }
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    if (m.type !== 'notify') return;
    for (const msg of m.messages) {
      if (msg.key.fromMe) continue;
      if (!msg.message) continue;

      const sender = msg.key.participant || msg.key.remoteJid;
      const now = Date.now();
      const pushName = msg.pushName || 'User';
      db.updateUserName(sender, pushName);
      db.saveMessage(msg);

      const hasImage = !!msg.message.imageMessage;
      const hasVideo = !!msg.message.videoMessage;
      const hasSticker = !!msg.message.stickerMessage;
      const isText = !!msg.message.conversation;

      if (!hasImage && !hasSticker && !isText && !hasVideo) continue;

      let xpToAdd = 5;
      let isMedia = false;

      if (hasImage) { xpToAdd = 15; isMedia = true; }
      if (hasVideo) { xpToAdd = 10; isMedia = true; }

      const result = db.addXp(sender, xpToAdd, now);

      if (isMedia) {
        db.incrementMsg(sender);
        const user = db.getUser(sender);
        await sock.sendMessage(msg.key.remoteJid, {
          text: SL.makePhotoXpGain(pushName, xpToAdd, user.level, user.xp)
        });
      }

      if (result && result.leveledUp) {
        const user = db.getUser(sender);

        if (result.rankChanged) {
          await sock.sendMessage(msg.key.remoteJid, {
            text: SL.makeRankUpMessage(pushName, result.newRank)
          });
        }

        await sock.sendMessage(msg.key.remoteJid, {
          text: SL.makeLevelUpMessage(pushName, user.level - 1, user.level)
        });
      }

      await handler.execute(msg, sock);
    }
  });

  sock.ev.on('group-participants.update', async (update) => {
    const { id, participants, action } = update;
    if (action !== 'add') return;

    for (const jid of participants) {
      const user = db.getUser(jid);
      const name = user.name || 'Hunter';
      db.addXpManual(jid, 50, name);

      const updatedUser = db.getUser(jid);
      await sock.sendMessage(id, {
        text: SL.makeWelcomeMessage(name, updatedUser.level)
      });

      if (updatedUser.level > 1) {
        const rank = SL.getRank(updatedUser.level);
        await sock.sendMessage(id, {
          text: SL.makeLevelUpMessage(name, 1, updatedUser.level) 
        });
      }
    }
  });
}

startBot().catch(console.error);
