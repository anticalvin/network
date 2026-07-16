import test from "node:test";
import assert from "node:assert/strict";
import { classifyNetworkUrl, createNetworkNavigator, openExternalSecurely, resolveNetworkInput } from "../src/system/network-navigation.js";

const baseUrl = "https://anticalvin.github.io/network/index.html?skipBoot=1";

test("same-origin AWAKEN pages stay inside the shell", () => {
  const result = classifyNetworkUrl("./releases/xp/", { baseUrl });
  assert.equal(result.kind, "same-origin");
  assert.equal(result.embeddable, true);
  assert.equal(result.url, "https://anticalvin.github.io/network/releases/xp/");
});

test("approved AWAKEN subdomains are classified separately", () => {
  const result = classifyNetworkUrl("https://vzn.awakencult.com/tool", { baseUrl });
  assert.equal(result.kind, "awaken");
  assert.equal(result.embeddable, true);
});

test("Spotify and SoundCloud destinations become official embeds", () => {
  const spotify = classifyNetworkUrl("https://open.spotify.com/album/61bZigX7xvLsQEo3CxmMJ5", { baseUrl });
  const soundcloud = classifyNetworkUrl("https://soundcloud.com/awakencult", { baseUrl });
  assert.equal(spotify.kind, "media-embed");
  assert.equal(spotify.embedUrl, "https://open.spotify.com/embed/album/61bZigX7xvLsQEo3CxmMJ5");
  assert.equal(soundcloud.kind, "media-embed");
  assert.match(soundcloud.embedUrl, /^https:\/\/w\.soundcloud\.com\/player\/\?url=/);
  assert.equal(classifyNetworkUrl("https://evilsoundcloud.com/awakencult", { baseUrl }).kind, "external");
});

test("generic external websites require the controlled warning", () => {
  const result = classifyNetworkUrl("https://discord.com/channels/1/2", { baseUrl });
  assert.equal(result.kind, "external");
  assert.equal(result.embeddable, false);
  assert.equal(result.requiresExternalConfirmation, true);
});

test("invalid and javascript URLs are rejected", () => {
  assert.equal(classifyNetworkUrl("not a url %", { baseUrl }).kind, "invalid");
  assert.equal(classifyNetworkUrl("javascript:alert(1)", { baseUrl }).kind, "unsafe");
});

test("downloads and blob data bypass AWAKEN Internet", () => {
  const download = classifyNetworkUrl("https://awakencult.com/archive.zip", { baseUrl });
  const blob = classifyNetworkUrl("blob:https://awakencult.com/123", { baseUrl });
  assert.equal(download.kind, "download");
  assert.equal(download.bypass, true);
  assert.equal(blob.kind, "bypass");
  assert.equal(blob.bypass, true);
});

test("navigation reuse focuses one stable AWAKEN Internet identity", () => {
  const focused = [];
  const navigated = [];
  let created = 0;
  const navigator = createNetworkNavigator({
    baseUrl,
    createWindow(_title, options) {
      created += 1;
      assert.equal(options.appId, "awaken-internet");
      return { content: {}, win: { addEventListener() {} } };
    },
    focusExistingWindow(appId) { focused.push(appId); return true; },
    renderBrowser(_content, context) {
      navigated.push(context.initial.url);
      return { isConnected: () => true, navigate(destination) { navigated.push(destination.url); }, destroy() {} };
    }
  });

  const first = navigator.open("https://discord.com", { title: "Discord" });
  const second = navigator.open("https://soundcloud.com/awakencult", { title: "SoundCloud" });
  assert.equal(first.reused, false);
  assert.equal(second.reused, true);
  assert.equal(created, 1);
  assert.deepEqual(focused, ["awaken-internet"]);
  assert.equal(navigated.length, 2);
});

test("native fallback always carries noopener and noreferrer", () => {
  const calls = [];
  const opened = { opener: "parent" };
  const success = openExternalSecurely("https://example.com/path", (...args) => { calls.push(args); return opened; });
  assert.equal(success, true);
  assert.deepEqual(calls[0], ["https://example.com/path", "_blank", "noopener,noreferrer"]);
  assert.equal(opened.opener, null);
  assert.equal(openExternalSecurely("javascript:alert(1)", () => { throw new Error("must not open"); }), false);
});

test("address bar accepts hostnames and turns plain language into web search", () => {
  assert.equal(resolveNetworkInput("awakencult.com/archive"), "https://awakencult.com/archive");
  assert.equal(resolveNetworkInput("AWAKEN Johannesburg archive"), "https://www.google.com/search?q=AWAKEN%20Johannesburg%20archive");
});
