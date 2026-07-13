export const brandAssets = Object.freeze({
  logoWhite: "https://i.ibb.co/LzPfd9Cc/awaken-logo.webp",
  eyeBlack: "https://i.ibb.co/gFPrR060/awaken-eye-black.webp",
  smileyWhite: "https://i.ibb.co/V025RzRK/white-smiley777.png",
  wallpaperDefault: "https://i.ibb.co/F4cCLp3t/a3a6a063-4a72-4b8a-b693-b774e7acbf81.webp",
  fallbackWallpaperColor: "#da4a44"
});

export function normalizeBrandAsset(key, fallback = "") {
  const value = brandAssets[key] || fallback;
  try {
    const url = new URL(value, globalThis.location?.href || "https://awakencult.com/");
    return ["http:", "https:"].includes(url.protocol) ? url.href : fallback;
  } catch {
    return fallback;
  }
}
