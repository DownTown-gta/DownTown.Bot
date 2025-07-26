const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    EmbedBuilder
} = require('discord.js');
const { MessageFlags } = require('discord-api-types/v10');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-setup')
        .setDescription('Setup the ticket panel')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🎟️ Support Tickets')
            .setDescription('Select the type of ticket you want to open.')
            .setColor('Blue')
            .addFields(
                { name: "How It Works", value: "Choose a ticket type from the menu below to create a ticket.", inline: false },
                { name: "Note", value: "Please only open tickets for legitimate issues.", inline: false }
            )
            .setThumbnail('https://r2.fivemanage.com/BlnxrKfJGmkvrHn8FlEdF/discord_logo.png')
            .setImage('https://r2.fivemanage.com/BlnxrKfJGmkvrHn8FlEdF/crystalrp-ticket.png');

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('ticket-select')
                .setPlaceholder('Choose your ticket type...')
                .addOptions([
                    {
                        label: 'Support',
                        value: 'support',
                        emoji: '🛠️'
                    },
                    {
                        label: 'Enquiry',
                        value: 'enquiry',
                        emoji: '❓'
                    }
                ])
        );

        await interaction.deferReply({ flags: MessageFlags.Ephemeral }); // Acknowledge command silently
        await interaction.channel.send({ embeds: [embed], components: [row] });
        await interaction.editReply({ content: '✅ Ticket panel sent.',  flags: MessageFlags.Ephemeral });
    }
};
