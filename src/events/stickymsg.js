// src/events/messageCreate.js

const { stickyMessages } = require('../commands/admins/sticky');

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;

    const sticky = stickyMessages.get(message.channel.id);
    if (!sticky) return;

    try {
      const lastMessage = await message.channel.messages.fetch(sticky.messageId);
      await lastMessage.delete().catch(() => {});
    } catch {}

    const newSticky = await message.channel.send(sticky.content);
    stickyMessages.set(message.channel.id, {
      content: sticky.content,
      messageId: newSticky.id
    });
  }
};
