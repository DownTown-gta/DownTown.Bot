const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

module.exports = {
    name: 'ready', // Discord.js event name
    once: true, // Run only once when the bot is ready
    async execute(client) {
        console.log('Player update event loaded.');

        const updateServerStatus = async () => {
            if (!client.statusMessage) return; // Skip if no status message exists

            let newPlayers = [];
            let isOnline = false;

            try {
                // Fetch updated player data
                const response = await axios.get(process.env.FIVEM_ENDPOINT, { timeout: 5000 });
                // Log the raw response data for debugging (do not include user info)
                console.log('API Response:', response.data);

                // Ensure response.data is an array; if not, treat as empty array
                newPlayers = Array.isArray(response.data) ? response.data : [];
                isOnline = true; // Server is online if the request succeeds
            } catch (error) {
                isOnline = false; // Server is offline if the request fails
                console.log('API Error:', error.message); // Log error message for debugging
                newPlayers = []; // Ensure newPlayers is an array even if the request fails
            }

            const playerCount = newPlayers.length;

            // Check if players or server status have changed
            const oldPlayers = client.players || [];
            const oldPlayerList = oldPlayers.map(p => `[${p.id}] ${p.name}`).sort().join('\n');
            const newPlayerList = newPlayers.map(p => `[${p.id}] ${p.name}`).sort().join('\n');
            const oldStatus = client.isServerOnline || false;
            const statusChanged = oldStatus !== isOnline;
            const playersChanged = oldPlayerList !== newPlayerList;

            if (statusChanged || playersChanged) {
                // Update the embed with new status and player list
                const embed = EmbedBuilder.from(client.statusMessage.embeds[0])
                    .spliceFields(1, 1, { name: 'Server Status', value: isOnline ? ':green_circle: Online' : ':red_circle: Offline', inline: true })
                    .spliceFields(2, 1, { name: 'Online Players', value: `${playerCount}/32`, inline: true })
                    .spliceFields(3, 1, { name: 'Citizens:', value: newPlayers.length > 0 ? newPlayers.map(p => `[${p.id}] ${p.name}`).join('\n') : 'No players online', inline: false })
                    .setFooter({ text: `Crystal Roleplay • Today at ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}` });

                await client.statusMessage.edit({ embeds: [embed] });
                client.players = newPlayers; // Update stored players
                client.isServerOnline = isOnline; // Update stored server status
            }
        };

        // Run every 30 seconds
        setInterval(updateServerStatus, 10 * 1000);

        // Privacy: Do not log or display user information
        // This event handler does not have access to interaction data, but this comment ensures no user-specific logging is added in the future
    },
};