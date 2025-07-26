const { Events } = require('discord.js');
require('dotenv').config();
const { MessageFlags } = require('discord-api-types/v10');
const STAFF_ROLE_ID = process.env.STAFF_ROLE_ID;

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton()) return;
    if (!['check-staff', 'ping-staff'].includes(interaction.customId)) return;

    const guild = interaction.guild;
    const staffRole = guild.roles.cache.get(STAFF_ROLE_ID);

    if (!staffRole) {
      return interaction.reply({
        content: '❌ Staff role not found.',
        flags: MessageFlags.Ephemeral
      });
    }

    const onlineStaff = staffRole.members.filter(
      member =>
        member.presence &&
        ['online', 'idle', 'dnd'].includes(member.presence.status)
    );

    if (interaction.customId === 'check-staff') {
      const response =
        onlineStaff.size > 0
          ? `✅ There are **${onlineStaff.size}** staff online:\n${onlineStaff.map(m => `• ${m.user.tag}`).join('\n')}`
          : '❌ No staff are currently available.';

      return interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
    }

    if (interaction.customId === 'ping-staff') {
      if (onlineStaff.size === 0) {
        return interaction.reply({
          content: '❌ No available staff to ping.',
          flags: MessageFlags.Ephemeral
        });
      }

      const pingList = onlineStaff.map(m => `<@${m.id}>`).join(', ');
      return interaction.reply({
        content: `📢 You have pinged the following available staff:\n${pingList}`,
        flags: MessageFlags.Ephemeral,
        allowedMentions: { users: onlineStaff.map(m => m.id) }
      });
    }
  }
};
