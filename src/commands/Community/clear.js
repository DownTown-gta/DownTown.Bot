const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clear a specific number of messages from this channel.')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete (1-100)')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), // Only members with Manage Messages
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');

    if (amount < 1 || amount > 100) {
      return interaction.reply({
        content: '⚠️ Please enter a number between 1 and 100.',
        ephemeral: true
      });
    }

    try {
      await interaction.channel.bulkDelete(amount, true);
      await interaction.reply({
        content: `✅ Successfully deleted **${amount}** messages.`,
        ephemeral: true
      });
    } catch (error) {
      console.error('❌ Error clearing messages:', error);
      await interaction.reply({
        content: '❌ Failed to delete messages. Make sure I have the right permissions!',
        ephemeral: true
      });
    }
  }
};
