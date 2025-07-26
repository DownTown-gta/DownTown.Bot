const { SlashCommandBuilder } = require('discord.js');
const { MessageFlags } = require('discord-api-types/v10');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Make the bot say something')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to say')
                .setRequired(true)
        ),
    async execute(interaction) {
        const requiredRoleId = process.env.ADMIN_ROLE; // Set the base role ID

        const member = interaction.member;
        const guild = interaction.guild;
        const requiredRole = guild.roles.cache.get(requiredRoleId);

        if (!requiredRole) {
            return await interaction.reply({
                content: '⚠️ The required role was not found in this server.',
                flags: MessageFlags.Ephemeral,
            });
        }

        const hasRequiredOrHigherRole = member.roles.cache.some(role =>
            role.position >= requiredRole.position
        );

        if (!hasRequiredOrHigherRole) {
            return await interaction.reply({
                content: `❌ You need the **${requiredRole.name}** role or higher to use this command.`,
                ephemeral: true,
            });
        }

        const message = interaction.options.getString('message');
        await interaction.reply({ content: '✅ Message sent!',  flags: MessageFlags.Ephemeral });
        await interaction.channel.send(message);
    },
};
