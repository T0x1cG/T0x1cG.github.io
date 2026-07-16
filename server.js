"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = __dirname;
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(ROOT, "data");
const CONTENT_FILE = path.join(DATA_DIR, "content.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const PORT = Number(process.env.PORT || 3000);
const sessions = new Map();
const EMPTY = { articles: [], notes: [], certifications: [], achievements: [] };

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}
function writeJson(file, value) {
  const temp = file + ".tmp";
  fs.writeFileSync(temp, JSON.stringify(value, null, 2), "utf8");
  fs.renameSync(temp, file);
}
function ensureData() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(CONTENT_FILE)) writeJson(CONTENT_FILE, EMPTY);
}
function send(response, code, value, headers) {
  response.writeHead(code, Object.assign({ "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }, headers || {}));
  response.end(JSON.stringify(value));
}
function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (part) => {
      body += part;
      if (body.length > 1000000) reject(new Error("Request body is too large."));
    });
    request.on("end", () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch { reject(new Error("Request body must be valid JSON.")); }
    });
    request.on("error", reject);
  });
}
function safe(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max || 500) : "";
}
function cookie(request) {
  return (request.headers.cookie || "").split(";").reduce((out, part) => {
    const pieces = part.trim().split("=");
    const key = pieces.shift();
    if (key) out[key] = decodeURIComponent(pieces.join("="));
    return out;
  }, {});
}
function settings() { return readJson(SETTINGS_FILE, null); }
function hash(password, salt) { return crypto.scryptSync(password, salt, 64).toString("hex"); }
function hasAccess(request) {
  const token = cookie(request).t0x_session;
  const session = token && sessions.get(token);
  if (!session || session.expires < Date.now()) {
    if (token) sessions.delete(token);
    return false;
  }
  return true;
}
function login(response) {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, { expires: Date.now() + 43200000 });
  response.setHeader("Set-Cookie", "t0x_session=" + token + "; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200");
}
function logout(request, response) {
  const token = cookie(request).t0x_session;
  if (token) sessions.delete(token);
  response.setHeader("Set-Cookie", "t0x_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0");
}
function contentType(file) {
  return { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".svg": "image/svg+xml" }[path.extname(file)] || "application/octet-stream";
}
function staticFile(request, response, urlPath) {
  const requested = urlPath === "/" ? "/index.html" : decodeURIComponent(urlPath);
  const file = path.resolve(ROOT, "." + requested);
  if (!file.startsWith(ROOT) || file.includes(path.sep + "data" + path.sep)) {
    response.writeHead(403); response.end("Forbidden"); return;
  }
  fs.readFile(file, (error, body) => {
    if (error) { response.writeHead(error.code === "ENOENT" ? 404 : 500); response.end("Not found"); return; }
    response.writeHead(200, { "Content-Type": contentType(file), "X-Content-Type-Options": "nosniff" });
    request.method === "HEAD" ? response.end() : response.end(body);
  });
}

async function api(request, response, pathname) {
  if (request.method === "GET" && pathname === "/api/content") return send(response, 200, readJson(CONTENT_FILE, EMPTY));
  if (request.method === "GET" && pathname === "/api/admin/status") return send(response, 200, { configured: Boolean(settings()), authenticated: hasAccess(request) });
  if (request.method === "POST" && pathname === "/api/admin/setup") {
    if (settings()) return send(response, 409, { error: "The publishing desk is already configured." });
    const input = await readBody(request);
    if (typeof input.password !== "string" || input.password.length < 10) return send(response, 400, { error: "Choose a password with at least 10 characters." });
    const salt = crypto.randomBytes(16).toString("hex");
    writeJson(SETTINGS_FILE, { salt, passwordHash: hash(input.password, salt), createdAt: new Date().toISOString() });
    login(response);
    return send(response, 201, { ok: true });
  }
  if (request.method === "POST" && pathname === "/api/admin/login") {
    const current = settings();
    if (!current) return send(response, 400, { error: "Set up the publishing desk first." });
    const input = await readBody(request);
    const submitted = hash(safe(input.password, 1000), current.salt);
    if (!crypto.timingSafeEqual(Buffer.from(submitted), Buffer.from(current.passwordHash))) return send(response, 401, { error: "That password did not match." });
    login(response);
    return send(response, 200, { ok: true });
  }
  if (request.method === "POST" && pathname === "/api/admin/logout") {
    logout(request, response);
    return send(response, 200, { ok: true });
  }
  if (request.method === "POST" && pathname === "/api/content") {
    if (!hasAccess(request)) return send(response, 401, { error: "Administrator access required." });
    const input = await readBody(request);
    if (!["articles", "notes", "certifications", "achievements"].includes(input.type)) return send(response, 400, { error: "Select a valid entry type." });
    const title = safe(input.title, 120);
    const summary = safe(input.summary, 280);
    const label = safe(input.label, 60);
    if (!title || !summary || !label) return send(response, 400, { error: "Title, description and topic/issuer are required." });
    const archive = readJson(CONTENT_FILE, EMPTY);
    const entry = {
      id: crypto.randomUUID(), title, summary, label,
      tags: Array.isArray(input.tags) ? input.tags.map((tag) => safe(tag, 35)).filter(Boolean).slice(0, 8) : [],
      body: safe(input.body, 12000), url: safe(input.url, 300), createdAt: new Date().toISOString()
    };
    archive[input.type].unshift(entry);
    writeJson(CONTENT_FILE, archive);
    return send(response, 201, entry);
  }
  const target = pathname.match(/^\/api\/content\/(articles|notes|certifications|achievements)\/([a-zA-Z0-9-]+)$/);
  if (request.method === "DELETE" && target) {
    if (!hasAccess(request)) return send(response, 401, { error: "Administrator access required." });
    const archive = readJson(CONTENT_FILE, EMPTY);
    const before = archive[target[1]].length;
    archive[target[1]] = archive[target[1]].filter((entry) => entry.id !== target[2]);
    if (before === archive[target[1]].length) return send(response, 404, { error: "Entry not found." });
    writeJson(CONTENT_FILE, archive);
    return send(response, 200, { ok: true });
  }
  return send(response, 404, { error: "API endpoint not found." });
}

ensureData();
http.createServer(async (request, response) => {
  const url = new URL(request.url, "http://" + (request.headers.host || "localhost"));
  try {
    if (url.pathname.startsWith("/api/")) await api(request, response, url.pathname);
    else if (request.method === "GET" || request.method === "HEAD") staticFile(request, response, url.pathname);
    else { response.writeHead(405); response.end("Method not allowed"); }
  } catch (error) {
    console.error(error);
    send(response, 400, { error: error.message || "Unexpected server error." });
  }
}).listen(PORT, () => {
  console.log("T0x1cG portfolio is running at http://localhost:" + PORT);
  console.log("Open Publishing Desk from the top-right button to create its password.");
});
