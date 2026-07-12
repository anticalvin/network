import {
  Client,
  GatewayIntentBits,
  PermissionFlagsBits,
} from "discord.js";
import { loadDiscordConfig } from "./config.js";

const config = loadDiscordConfig();
const cooldowns = new Map();
const cooldownMs = 10_000;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", async () => {
  const guild = await client.guilds.fetch(config.guildId);
  const channel = await guild.channels.fetch(config.xpChannelId);

  if (!channel?.isTextBased()) {
    throw new Error("Configured XP channel is missing or is not text-based.");
  }

  const botMember = await guild.members.fetchMe();
  const permissions = channel.permissionsFor(botMember);
  const required = [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.ReadMessageHistory,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.EmbedLinks,
    PermissionFlagsBits.AttachFiles,
  ];

  if (!required.every((permission) => permissions?.has(permission))) {
    throw new Error("MIND cannot access #xp with all required permissions.");
  }

  console.info(`MIND connected to ${guild.name} and resolved #${channel.name}.`);
  await channel.send("MIND connected. XP channel linked to AWAKEN NETWORK.");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || message.channelId !== config.xpChannelId) return;

  const isStatus = message.content.trim().toLowerCase() === "!mind status";
  const isMentioned = message.mentions.has(client.user);
  if (!isStatus && !isMentioned) return;

  const lastReply = cooldowns.get(message.author.id) ?? 0;
  if (Date.now() - lastReply < cooldownMs) return;
  cooldowns.set(message.author.id, Date.now());

  await message.reply("MIND is online and connected to AWAKEN NETWORK.");
});

client.on("error", (error) => {
  console.error("MIND Discord client error:", error.message);
});

async function shutdown(signal) {
  console.info(`MIND received ${signal}; disconnecting.`);
  client.destroy();
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

client.login(config.token).catch((error) => {
  console.error("MIND failed to connect:", error.message);
  process.exitCode = 1;
});
