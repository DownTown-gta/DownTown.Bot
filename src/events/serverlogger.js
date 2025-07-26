const { Events, AuditLogEvent } = require('discord.js');
require('dotenv').config();

module.exports = (client) => {
  // 📌 Role Added / Removed
  client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    const logChannel = client.channels.cache.get(process.env.ROLE_LOG_CHANNEL_ID);
    if (!logChannel) return;
  
    const oldRoles = oldMember.roles.cache;
    const newRoles = newMember.roles.cache;
  
    const addedRoles = newRoles.filter(role => !oldRoles.has(role.id));
    const removedRoles = oldRoles.filter(role => !newRoles.has(role.id));
  
    if (addedRoles.size === 0 && removedRoles.size === 0) return;
  
    try {
      const fetchedLogs = await newMember.guild.fetchAuditLogs({
        limit: 6,
        type: AuditLogEvent.MemberRoleUpdate,
      });
  
      // Find all entries that match the member and are recent
      const relevantEntries = fetchedLogs.entries.filter(
        entry =>
          entry.target.id === newMember.id &&
          Date.now() - entry.createdTimestamp < 7000
      );
  
      // We now look through each change and match it to added/removed roles
      addedRoles.forEach(role => {
        const matchingLog = [...relevantEntries.values()].find(entry =>
          entry.changes.some(change =>
            change.key === "$add" &&
            Array.isArray(change.new) &&
            change.new.find(r => r.id === role.id)
          )
        );
  
        const executor = matchingLog?.executor?.tag || "Unknown";
        logChannel.send(`📌 **Role Added**: \`${role.name}\` added to **${newMember.user.tag}** by **${executor}**`);
      });
  
      removedRoles.forEach(role => {
        const matchingLog = [...relevantEntries.values()].find(entry =>
          entry.changes.some(change =>
            change.key === "$remove" &&
            Array.isArray(change.new) &&
            change.new.find(r => r.id === role.id)
          )
        );
  
        const executor = matchingLog?.executor?.tag || "Unknown";
        logChannel.send(`❌ **Role Removed**: \`${role.name}\` removed from **${newMember.user.tag}** by **${executor}**`);
      });
  
    } catch (error) {
      console.error("Failed to fetch audit logs for role update:", error);
    }
  });
  
  // 📁 Channel Created
  client.on(Events.ChannelCreate, async (channel) => {
    const logChannel = client.channels.cache.get(process.env.CHANNEL_LOG_CHANNEL_ID);
    if (!logChannel || !channel.guild) return;

    try {
      const fetchedLogs = await channel.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.ChannelCreate });
      const channelLog = fetchedLogs.entries.first();
      const executor = channelLog?.executor?.tag || "Unknown";

      logChannel.send(`📁 **Channel Created**: \`${channel.name}\` by **${executor}**`);
    } catch (error) {
      console.error("Failed to fetch channel creation log:", error);
    }
  });

  // 🗑️ Channel Deleted
  client.on(Events.ChannelDelete, async (channel) => {
    const logChannel = client.channels.cache.get(process.env.CHANNEL_LOG_CHANNEL_ID);
    if (!logChannel || !channel.guild) return;

    try {
      const fetchedLogs = await channel.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.ChannelDelete });
      const channelLog = fetchedLogs.entries.first();
      const executor = channelLog?.executor?.tag || "Unknown";

      logChannel.send(`🗑️ **Channel Deleted**: \`${channel.name}\` by **${executor}**`);
    } catch (error) {
      console.error("Failed to fetch channel deletion log:", error);
    }
  });

  // 🔊 Voice Connect / Disconnect / Move
  client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    const logChannel = client.channels.cache.get(process.env.VOICE_LOG_CHANNEL_ID);
    if (!logChannel) return;

    const userTag = newState.member.user.tag;

    if (!oldState.channel && newState.channel) {
      logChannel.send(`🔊 **Voice Join**: **${userTag}** joined \`${newState.channel.name}\``);
    } else if (oldState.channel && !newState.channel) {
      logChannel.send(`📴 **Voice Leave**: **${userTag}** left \`${oldState.channel.name}\``);
    } else if (oldState.channelId !== newState.channelId) {
      logChannel.send(`🔀 **Voice Move**: **${userTag}** moved from \`${oldState.channel.name}\` to \`${newState.channel.name}\``);
    }
  });
};
