const requiredKeys = [
  "DISCORD_BOT_TOKEN",
  "DISCORD_APPLICATION_ID",
  "DISCORD_PUBLIC_KEY",
  "DISCORD_GUILD_ID",
  "DISCORD_XP_CHANNEL_ID",
];

export function loadDiscordConfig(env = process.env) {
  const missing = requiredKeys.filter((key) => !env[key]?.trim());

  if (missing.length > 0) {
    throw new Error(`Missing Discord configuration: ${missing.join(", ")}`);
  }

  return {
    token: env.DISCORD_BOT_TOKEN.trim(),
    applicationId: env.DISCORD_APPLICATION_ID.trim(),
    publicKey: env.DISCORD_PUBLIC_KEY.trim(),
    guildId: env.DISCORD_GUILD_ID.trim(),
    xpChannelId: env.DISCORD_XP_CHANNEL_ID.trim(),
  };
}
