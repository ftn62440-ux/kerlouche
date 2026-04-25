require('dotenv').config();
const fs = require('node:fs');
const crypto = require('node:crypto');
const http = require('node:http');
const buyers = require('./src/Manager/buyers.json');
const { Selfbot } = require('./src/structures/Client');
const { loadCommands, loadEvents } = require('./src/structures/Handlers');
const { Client, GatewayIntentBits, Partials, ActivityType, DefaultWebSocketManagerOptions } = require('discord.js');

global.clients = {};
global.decrypt = text => decrypt(text, 'megalovania');
global.encrypt = text => encrypt(text, 'megalovania');
global.loadSelfbot = token => loadSelfbot(token);
global.loadEvents = (client, dir) => loadEvents(client, dir);
global.loadCommands = (client, dir) => loadCommands(client, dir);

const bot = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildModeration, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.GuildScheduledEvents, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    partials: [Partials.Channel, Partials.GuildMember, Partials.GuildScheduledEvent, Partials.Message, Partials.Reaction, Partials.ThreadMember, Partials.User],
    restTimeOffset: 0,
    failIfNotExists: false,
    presence: {
        activities: [{
            name: ` 707 `,
            type: ActivityType.Streaming,
            url: "https://www.twitch.tv/oubaelmssi"
        }],
        status: "online",
    },
    allowedMentions: {
        parse: ["roles", "users", "everyone"],
        repliedUser: false
    }
});

const { identifyProperties } = DefaultWebSocketManagerOptions;

Object.defineProperty(identifyProperties, 'browser', {
    value: "Discord Android",
    writable: true,
    enumerable: true,
    configurable: true
});

bot.codes = require('./codes.json');
bot.config = require('./config.json');

bot.login(process.env.MANAGER_TOKEN).catch(() => false);
bot.decrypt = text => decrypt(text, 'megalovania');
bot.encrypt = text => encrypt(text, 'megalovania');
bot.load = token => loadSelfbot(token);

bot.ms = temps => {
    const match = temps.match(/(\d+)([smhdwy])/);
    if (!match) return null;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        case 'w': return value * 7 * 24 * 60 * 60 * 1000;
        case 'y': return value * 365 * 24 * 60 * 60 * 1000;
        default: return null;
    }
}

bot.save = () => fs.writeFileSync('./config.json', JSON.stringify(bot.config, null, 4));
bot.saveCode = () => fs.writeFileSync('./codes.json', JSON.stringify(bot.codes, null, 4));

loadEvents(bot, "./src/Manager/events");
loadCommands(bot, "./src/Manager/commands");

const tokens = process.env.TOKENS ? process.env.TOKENS.split(',').map(t => t.trim()).filter(Boolean) : [];

for (const token of tokens){
    const userId = Buffer.from(token.split('.')[0], 'base64').toString();
    
    if (!buyers[userId]){
        buyers[userId] = { expiration: Date.now() + 1000 * 60 * 60 * 24 * 30, enable: true };
        fs.writeFileSync('./src/Manager/buyers.json', JSON.stringify(buyers, null, 4));
    }
    if (buyers[userId].expiration <= Date.now() || !buyers[userId].enable) continue;

    loadSelfbot(token);
};

function loadSelfbot(token) {
    const userId = Buffer.from(token.split('.')[0], 'base64').toString();
    if (clients[userId]) return;
    if (!buyers[userId]){
        buyers[userId] = { expiration: Date.now() + 1000 * 60 * 60 * 24 * 30, enable: true };
        fs.writeFileSync('./src/Manager/buyers.json', JSON.stringify(buyers, null, 4));
    }
    
    const client = new Selfbot({ token });
    client.connect();

    loadCommands(client, "./src/Selfbot/commands");
    loadEvents(client, "./src/Selfbot/events");
}


function decrypt(encryptedData, password) {
    const key = crypto.pbkdf2Sync(password, 'selUnique', 100000, 32, 'sha256');
    const iv = crypto.pbkdf2Sync(password, 'selUnique', 100000, 16, 'sha256');

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

function encrypt(text, password) {
    const key = crypto.pbkdf2Sync(password, 'selUnique', 100000, 32, 'sha256');
    const iv = crypto.pbkdf2Sync(password, 'selUnique', 100000, 16, 'sha256');

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

async function errorHandler(error) {
    const errors = [0, 400, 10062, 10008, 50035, 40032, 50013]
    if (errors.includes(error.code)) return;

    console.log(error)
};

process.on("unhandledRejection", errorHandler);
process.on("uncaughtException", errorHandler);

// === Serveur HTTP pour Render (keep-alive) ===
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html>
<head>
    <title>UHQ Selfbot</title>
    <style>
        body { font-family: Arial, sans-serif; background: #1a1a2e; color: #eee; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .container { text-align: center; }
        h1 { color: #00e5ff; }
        .status { background: #16213e; padding: 20px; border-radius: 10px; margin-top: 20px; }
        .online { color: #00ff88; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 UHQ Selfbot</h1>
        <div class="status">
            <p>Status: <span class="online">● Online</span></p>
            <p>Manager: ${bot.user ? bot.user.tag : 'Connecting...'}</p>
            <p>Selfbots actifs: ${Object.keys(global.clients).length}</p>
            <p>Port: ${PORT}</p>
        </div>
</body>
</html>`);
});

server.listen(PORT, () => {
    console.log(`[HTTP] Serveur en ligne sur le port ${PORT}`);
});
