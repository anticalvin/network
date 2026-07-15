window.AWAKEN_CONFIG = Object.freeze({
  siteUrl: "https://awakencult.com/",
  contentEndpoint: "",
  adminBaseUrl: "./admin.html",
  supabaseProjectId: "gnfxhelagmcferkqpngr",
  supabaseUrl: "https://gnfxhelagmcferkqpngr.supabase.co",
  supabasePublishableKey: globalThis.AWAKEN_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_ASOjRsDQnouUBx4pfDVCIw_aZ_lc9PZ",
  supabaseAnonKey: globalThis.AWAKEN_SUPABASE_ANON_KEY || localStorage.getItem("awaken.supabaseAnonKey") || "",
  features: {
    ads_runtime_enabled: true,
    intrusion_enabled: true,
    gallery_studio_enabled: true,
    upgraded_media_player_enabled: true
  },
  discord: {
    guildId: "946069318473502770",
    xpChannelId: "1525921490414080031",
    inviteUrl: "https://discord.gg/3hTnm3Pgy2"
  }
});
