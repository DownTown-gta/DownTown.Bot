const fs = require('fs');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// GitHub repo info
const GITHUB_OWNER = 'DownTown-gta';
const GITHUB_REPO = 'DownTown.rp';
const BRANCH = 'main';
const CHANNEL_ID = '1384909639274991698';
const SHA_STORE_FILE = './.lastSha.json';

function loadLastSha() {
  try {
    const data = fs.readFileSync(SHA_STORE_FILE, 'utf8');
    return JSON.parse(data)?.lastSha || '';
  } catch {
    return '';
  }
}

function saveLastSha(sha) {
  fs.writeFileSync(SHA_STORE_FILE, JSON.stringify({ lastSha: sha }, null, 2));
}

let lastKnownSha = loadLastSha();

async function getUserInfo(username) {
  try {
    const res = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        'User-Agent': 'DiscordBot'
      }
    });
    return await res.json();
  } catch {
    return { login: username, avatar_url: '', name: username };
  }
}

async function checkCommits(client) {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits?sha=${BRANCH}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        'User-Agent': 'DiscordBot'
      }
    });

    if (res.status === 403) {
      console.warn('❌ GitHub rate limit hit. Skipping this check.');
      return;
    }

    if (res.status === 404) {
      console.error('❌ Repo not found or token has no access.');
      return;
    }

    const commits = await res.json();

    if (!Array.isArray(commits) || !commits.length) {
      console.log('[GitHub Watcher] No commits found.');
      return;
    }

    const newCommits = [];
    for (let commit of commits) {
      if (commit.sha === lastKnownSha) break;
      newCommits.push(commit);
    }

    if (newCommits.length === 0) return;
    lastKnownSha = newCommits[0].sha;
    saveLastSha(lastKnownSha);

    const firstAuthor = newCommits[0].author || {};
    const userInfo = await getUserInfo(firstAuthor.login || 'unknown');

    const embed = new EmbedBuilder()
      .setAuthor({
        name: userInfo.name || userInfo.login || 'Unknown',
        iconURL: userInfo.avatar_url,
        url: `https://github.com/${userInfo.login}`
      })
      .setTitle(`[${GITHUB_OWNER}/${GITHUB_REPO}]`)
      .setURL(`https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`)
      .setDescription(`${newCommits.length} new commit(s) on \`${BRANCH}\``)
      .setColor(0x2f3136)
      .setFooter({ text: 'Updated by DownTown' })
      .setTimestamp();

    // ────────────────────────────────
    const categorizedCommits = { new: [], updated: [], other: [] };

    for (const commit of newCommits.reverse()) {
      const sha = commit.sha;
      const commitDetailsUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits/${sha}`;
      
      const commitDetailsRes = await fetch(commitDetailsUrl, {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          'User-Agent': 'DiscordBot'
        }
      });

      const commitDetails = await commitDetailsRes.json();
      let category = 'other';

      if (commitDetails?.files?.length) {
        const statuses = commitDetails.files.map(f => f.status);

        if (statuses.every(s => s === 'added')) category = 'new';
        else if (statuses.every(s => s === 'modified')) category = 'updated';
        else category = 'other';
      }

      const messageLine = commit.commit.message.split('\n')[0];
      const shortSha = sha.substring(0, 7);
      const author = commit.author ? `@${commit.author.login}` : '';
      const commitMsg = `\`${shortSha}\` ${messageLine} ${author}`;

      categorizedCommits[category].push(commitMsg);
    }

    for (const [type, messages] of Object.entries(categorizedCommits)) {
      if (messages.length > 0) {
        embed.addFields({ name: type, value: messages.join('\n') });
      }
    }

    const channel = await client.channels.fetch(CHANNEL_ID);
    channel.send({ embeds: [embed] });

    console.log(`[GitHub Watcher] Posted ${newCommits.length} new commit(s).`);

  } catch (err) {
    console.error('[GitHub Watcher] Error:', err.message);
  }
}

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log('✅ GitHub watcher started.');
    setInterval(() => checkCommits(client), 1000); // check every second
  }
};
