const Discord = require('discord.js-selfbot-v13');
const fs = require('node:fs');

module.exports = {
    name: "shardDisconnect",
    /**
     * @param {string} event
     * @param {number} id
     * @param {Discord.Client} client
    */
    run: async (event, id, client) => {
        if (!client.user?.id || !clients[client.user.id]) return;

        clients[client.user.id].destroy();
        delete clients[client.user.id];
    }
}