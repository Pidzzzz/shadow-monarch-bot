const fs = require('fs');
const path = require('path');

class CommandHandler {
  constructor(prefix = '.') {
    this.prefix = prefix;
    this.commands = new Map();
    this.loadCommands();
  }

  loadCommands() {
    const commandsDir = path.join(__dirname, '../commands');
    if (!fs.existsSync(commandsDir)) return;

    const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));
    files.forEach(file => {
      const cmd = require(path.join(commandsDir, file));
      this.commands.set(cmd.name, cmd);
    });
  }

  async execute(message, sock) {
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
    
    if (!text.startsWith(this.prefix)) return;

    const args = text.slice(this.prefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();
    const command = this.commands.get(commandName);

    if (!command) return;

    try {
      await command.execute(message, args, sock);
    } catch (err) {
      console.error(`Error executing ${commandName}:`, err);
    }
  }
}

module.exports = CommandHandler;
