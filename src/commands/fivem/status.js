const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const axios = require('axios');
require('dotenv').config();
const { MessageFlags } = require('discord-api-types/v10');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Shows the FiveM server status and player list')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), // Admins only

    async execute(interaction, client) {
        // Acknowledge the user privately
        await interaction.reply({
            content: '✅ You ran `/status`.',
            flags: MessageFlags.Ephemeral
        });

        let players = [];
        let isOnline = false;

        try {
            const response = await axios.get(process.env.FIVEM_ENDPOINT, { timeout: 5000 });
            players = response.data;
            isOnline = true;
        } catch (error) {
            isOnline = false;
        }

        const playerCount = players.length;
        const maxPlayers = 32;

        const embed = new EmbedBuilder()
            .setTitle('Crystal Roleplay - City Status')
            .setAuthor({
                name: "CRYSTAL ROLEPLAY",
                iconURL: "https://r2.fivemanage.com/BlnxrKfJGmkvrHn8FlEdF/crystalroleply_bg.png",
            })
            .setColor('Blue')
            .setThumbnail('https://r2.fivemanage.com/BlnxrKfJGmkvrHn8FlEdF/discord_logo.png')
            .addFields(
                { name: 'Server Name', value: '```Crystal Roleplay```', inline: false },
                { name: 'How to join the server?', value: 'You can join the server using our IP \n```connect coming.soon```\n', inline: false },
                { name: 'Server Status', value: isOnline ? ':green_circle: Online' : ':red_circle: Offline', inline: true },
                { name: 'Online Players', value: `${playerCount}/${maxPlayers}`, inline: true },
                { name: 'Restart Times:', value: '6:00 PM', inline: true },
                // {
                //     name: 'Citizens:',
                //     value: players.length > 0
                //         ? players.map(p => `[${p.id}] ${p.name}`).join('\n')
                //         : 'No players online',
                //     inline: false
                // }
            )
            .setImage('https://r2.fivemanage.com/vLElaPWes32saYaxRJcvU/status-footer.png')
            .setFooter({
                text: `Crystal Roleplay • Today at ${new Date().toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                })}`
            });

        // Send the embed publicly to the same channel
        const message = await interaction.channel.send({ embeds: [embed] });

        // Optional: Store the message and state if needed
        client.statusMessage = message;
        client.players = players;
        client.isServerOnline = isOnline;
    },
};
