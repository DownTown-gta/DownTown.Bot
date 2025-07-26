const {
    ChannelType,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    AttachmentBuilder
} = require('discord.js');
const fs = require('fs');
require('dotenv').config();
const { MessageFlags } = require('discord-api-types/v10');
const categoryId = process.env.TICKET_CATEGORY_ID;
const adminRoleId = process.env.ADMIN_ROLE_ID;
const transcriptChannelId = process.env.TRANSCRIPT_CHANNEL_ID;

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        // 🎫 Ticket creation
        if (interaction.isStringSelectMenu() && interaction.customId === 'ticket-select') {
            const type = interaction.values[0];
            const ticketName = `ticket-${interaction.user.username}-${type}`;

            const existing = interaction.guild.channels.cache.find(c =>
                c.name.includes(interaction.user.username) && c.parentId === categoryId
            );
            if (existing) return await interaction.reply({
                content: 'You already have a ticket open!',
                flags: MessageFlags.Ephemeral
            });

            const channel = await interaction.guild.channels.create({
                name: ticketName,
                type: ChannelType.GuildText,
                parent: categoryId,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                    },
                    {
                        id: adminRoleId,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
                    }
                ]
            });

            await channel.send({
                content: `<@${interaction.user.id}> <@&${adminRoleId}>`,
                embeds: [
                    {
                        title: `🎟️ ${type.charAt(0).toUpperCase() + type.slice(1)} Ticket`,
                        description: `Please describe your issue or enquiry below. Our team will respond shortly.`,
                        color: 0x00cfff
                    }
                ],
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('close-ticket')
                            .setLabel('Close Ticket')
                            .setStyle(ButtonStyle.Danger)
                    )
                ]
            });

            await interaction.reply({ content: `✅ Your ticket has been created: ${channel}`,   flags: MessageFlags.Ephemeral});
        }

        // ❌ Ticket close + transcript
        if (interaction.isButton() && interaction.customId === 'close-ticket') {
            const channel = interaction.channel;
            await interaction.reply({ content: '⏳ Closing ticket in 5 seconds and sending transcript...', flags: MessageFlags.Ephemeral });

            setTimeout(async () => {
                try {
                    // Fetch last 100 messages
                    const messages = await channel.messages.fetch({ limit: 100 });
                    const content = messages
                        .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
                        .map(m => `${m.author.tag}: ${m.cleanContent || '[Embed/Attachment]'}`)
                        .join('\n');

                    const fileName = `transcript-${channel.name}.txt`;
                    const folderPath = './tickets';
                    const filePath = `${folderPath}/${fileName}`;
                    
                    // Ensure the 'tickets' folder exists
                    if (!fs.existsSync(folderPath)) {
                        fs.mkdirSync(folderPath, { recursive: true });
                    }
                    
                    fs.writeFileSync(filePath, content);
                    

                    const attachment = new AttachmentBuilder(filePath);
                    const logChannel = await channel.guild.channels.fetch(transcriptChannelId);
                    await logChannel.send({ content: `📝 Transcript for ${channel.name}`, files: [attachment] });

                    fs.unlinkSync(filePath); // delete after sending
                    await channel.delete();
                } catch (err) {
                    console.error('❌ Failed to close ticket or send transcript:', err);
                }
            }, 5000);
        }
    }
};
