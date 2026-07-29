#!/usr/bin/env node
const url = process.argv[2];
const timeoutMs = Number(process.argv[3] || 8000);

if (!url) {
  console.error("usage: probe-url.mjs <url> [timeout_ms]");
  process.exit(2);
}

const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), timeoutMs);

try {
  const response = await fetch(url, {
    method: "GET",
    redirect: "manual",
    signal: controller.signal,
  });
  const text = await response.text().catch(() => "");
  const result = {
    url,
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    contentType: response.headers.get("content-type") || "",
    location: response.headers.get("location") || "",
    bodyExcerpt: text.replace(/\s+/g, " ").slice(0, 240),
  };
  console.log(JSON.stringify(result, null, 2));
  process.exit(response.status >= 200 && response.status < 500 ? 0 : 1);
} catch (error) {
  console.log(
    JSON.stringify(
      {
        url,
        ok: false,
        error: error?.name || "Error",
        message: error?.message || String(error),
      },
      null,
      2,
    ),
  );
  process.exit(1);
} finally {
  clearTimeout(timer);
}
