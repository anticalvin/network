#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const [inputPath, outputPath = "tweet-review-queue.json"] = process.argv.slice(2);
if (!inputPath) {
  console.error("Usage: node tools/import-tweets.mjs <twitter-export.json> [review-output.json]");
  process.exit(1);
}

const raw = JSON.parse(await readFile(inputPath, "utf8"));
const rows = unwrapExport(raw);
const seenIds = new Set();
const seenBodies = new Set();
const review = [];

for (const source of rows) {
  const tweet = source.tweet || source;
  const id = String(tweet.id_str || tweet.id || hash(tweet.full_text || tweet.text || JSON.stringify(tweet)));
  const text = String(tweet.full_text || tweet.text || "").trim();
  const fingerprint = normalizedFingerprint(text);
  if (seenIds.has(id) || (fingerprint && seenBodies.has(fingerprint))) continue;
  seenIds.add(id);
  if (fingerprint) seenBodies.add(fingerprint);
  const media = [...(tweet.entities?.media || []), ...(tweet.extended_entities?.media || [])];
  const urls = tweet.entities?.urls || [];
  review.push({
    provider: "x",
    externalId: id,
    sourceTimestamp: parseDate(tweet.created_at),
    sourceType: tweet.retweeted_status ? "repost" : tweet.in_reply_to_status_id_str ? "reply" : tweet.quoted_status_id_str ? "quote" : "original",
    text,
    mediaUrls: [...new Set(media.map((item) => item.media_url_https || item.media_url).filter(Boolean))],
    outboundUrls: [...new Set(urls.map((item) => item.expanded_url || item.url).filter(Boolean))],
    missingMedia: Boolean(tweet.entities?.media?.length && !media.some((item) => item.media_url_https || item.media_url)),
    importStatus: "review",
    publish: false,
    editorialNotes: "",
    rawPayload: tweet
  });
}

await writeFile(outputPath, JSON.stringify({ version: 1, importedAt: new Date().toISOString(), source: inputPath, count: review.length, items: review }, null, 2));
console.log(`Wrote ${review.length} review items to ${outputPath}. Nothing was published.`);

function unwrapExport(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value.tweets)) return value.tweets;
  if (Array.isArray(value.data)) return value.data;
  throw new Error("Unsupported export. Expected an array, { tweets: [] }, or { data: [] }.");
}

function normalizedFingerprint(text) {
  return text.toLowerCase().replace(/https?:\/\/\S+/g, "").replace(/\s+/g, " ").trim();
}
function hash(value) { return createHash("sha256").update(value).digest("hex").slice(0, 24); }
function parseDate(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date.toISOString(); }
