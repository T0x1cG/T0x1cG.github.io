"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const childProcess = require("child_process");

const ROOT = __dirname;
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(ROOT, "data");
const CONTENT_FILE = path.join(DATA_DIR, "content.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const PORT = Number(process.env.PORT || 3000);
const HOST = "127.0.0.1";
const sessions = new Map();
const loginAttempts = new Map();
const EMPTY = { articles: [], notes: [], certifications: [], achievements: [] };
const SECURITY_HEADERS = {
  "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "Cross-Origin-Opener-Policy": "same-origin"
};

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
  response.writeHead(code, Object.assign({ "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }, SECURITY_HEADERS, headers || {}));
  response.end(JSON.stringify(value));
}
function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (part) => {
      body += part;
      if (body.length > 2500000) reject(new Error("Request body is too large."));
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
function safeImage(value) {
  const image = safe(value, 1800000);
  if (/^data:image\/(?:jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(image)) return image;
  if (/^assets\/[a-zA-Z0-9_./-]+\.(?:jpg|jpeg|png|webp)$/i.test(image) && !image.includes("..")) return image;
  return "";
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
function login(request, response) {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, { expires: Date.now() + 43200000 });
  const secure = request.socket.encrypted || request.headers["x-forwarded-proto"] === "https";
  response.setHeader("Set-Cookie", "t0x_session=" + token + "; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200" + (secure ? "; Secure" : ""));
}
function logout(request, response) {
  const token = cookie(request).t0x_session;
  if (token) sessions.delete(token);
  response.setHeader("Set-Cookie", "t0x_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0");
}
function contentType(file) {
  return { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" }[path.extname(file).toLowerCase()] || "application/octet-stream";
}
function sameOrigin(request) {
  const origin = request.headers.origin;
  if (!origin) return true;
  try { return new URL(origin).host === request.headers.host; } catch { return false; }
}
function localApiRequest(request) {
  const remote = request.socket.remoteAddress || "";
  const loopback = remote === "127.0.0.1" || remote === "::1" || remote === "::ffff:127.0.0.1";
  if (!loopback) return false;
  try {
    const hostname = new URL("http://" + request.headers.host).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
  } catch {
    return false;
  }
}
function loginKey(request) {
  return request.socket.remoteAddress || "local";
}
function loginAllowed(request) {
  const key = loginKey(request);
  const record = loginAttempts.get(key);
  if (!record || record.resetAt < Date.now()) {
    loginAttempts.delete(key);
    return true;
  }
  return record.count < 6;
}
function recordFailedLogin(request) {
  const key = loginKey(request);
  const current = loginAttempts.get(key);
  if (!current || current.resetAt < Date.now()) {
    loginAttempts.set(key, { count: 1, resetAt: Date.now() + 900000 });
    return;
  }
  current.count += 1;
}
function staticFile(request, response, urlPath) {
  const requested = urlPath === "/" ? "/index.html" : decodeURIComponent(urlPath);
  const file = path.resolve(ROOT, "." + requested);
  const relative = path.relative(ROOT, file);
  const publicFiles = new Set(["index.html", "styles.css", "credentials.css", "single-page.css", "app.js"]);
  const publicAsset = relative.startsWith("assets" + path.sep) && !relative.includes("..");
  if (relative.startsWith("..") || path.isAbsolute(relative) || (!publicFiles.has(relative) && !publicAsset)) {
    response.writeHead(404, SECURITY_HEADERS); response.end("Not found"); return;
  }
  fs.readFile(file, (error, body) => {
    if (error) { response.writeHead(error.code === "ENOENT" ? 404 : 500, SECURITY_HEADERS); response.end("Not found"); return; }
    response.writeHead(200, Object.assign({ "Content-Type": contentType(file) }, SECURITY_HEADERS));
    request.method === "HEAD" ? response.end() : response.end(body);
  });
}

function runGit(argumentsList) {
  return new Promise((resolve, reject) => {
    childProcess.execFile("git", argumentsList, { cwd: ROOT, timeout: 60000 }, (error, stdout, stderr) => {
      if (error) {
        const reason = safe(stderr || stdout || error.message, 500);
        reject(new Error(reason || "Git command failed."));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

async function publishArchive(action, title) {
  if (!fs.existsSync(path.join(ROOT, ".git"))) {
    return { published: false, message: "Saved locally. This folder is not connected to Git." };
  }
  try {
    const message = action + ": " + safe(title, 70);
    await runGit(["add", "--", "data/content.json"]);
    await runGit(["commit", "--only", "-m", message, "--", "data/content.json"]);
    await runGit(["push", "origin", "main"]);
    return { published: true, message: "Published to GitHub Pages. The live site will update shortly." };
  } catch (error) {
    return { published: false, message: "Saved locally, but GitHub publish failed: " + safe(error.message, 240) };
  }
}

async function api(request, response, pathname) {
  if (!localApiRequest(request)) return send(response, 404, { error: "Not found." });
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method) && !sameOrigin(request)) {
    return send(response, 403, { error: "Cross-origin request blocked." });
  }
  if (request.method === "GET" && pathname === "/api/content") return send(response, 200, readJson(CONTENT_FILE, EMPTY));
  if (request.method === "GET" && pathname === "/api/admin/status") return send(response, 200, { configured: Boolean(settings()), authenticated: hasAccess(request) });
  if (request.method === "POST" && pathname === "/api/admin/setup") {
    if (settings()) return send(response, 409, { error: "The publishing desk is already configured." });
    const input = await readBody(request);
    if (typeof input.password !== "string" || input.password.length < 12) return send(response, 400, { error: "Choose a password with at least 12 characters." });
    const salt = crypto.randomBytes(16).toString("hex");
    writeJson(SETTINGS_FILE, { salt, passwordHash: hash(input.password, salt), createdAt: new Date().toISOString() });
    login(request, response);
    return send(response, 201, { ok: true });
  }
  if (request.method === "POST" && pathname === "/api/admin/login") {
    if (!loginAllowed(request)) return send(response, 429, { error: "Too many login attempts. Try again in 15 minutes." });
    const current = settings();
    if (!current) return send(response, 400, { error: "Set up the publishing desk first." });
    const input = await readBody(request);
    const submitted = hash(safe(input.password, 1000), current.salt);
    if (!crypto.timingSafeEqual(Buffer.from(submitted), Buffer.from(current.passwordHash))) {
      recordFailedLogin(request);
      return send(response, 401, { error: "That password did not match." });
    }
    loginAttempts.delete(loginKey(request));
    login(request, response);
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
      body: safe(input.body, 12000), url: safe(input.url, 300), image: safeImage(input.image), createdAt: new Date().toISOString()
    };
    archive[input.type].unshift(entry);
    writeJson(CONTENT_FILE, archive);
    const deployment = await publishArchive("Publish", title);
    return send(response, 201, Object.assign({}, entry, { deployment }));
  }
  const target = pathname.match(/^\/api\/content\/(articles|notes|certifications|achievements)\/([a-zA-Z0-9-]+)$/);
  if (request.method === "DELETE" && target) {
    if (!hasAccess(request)) return send(response, 401, { error: "Administrator access required." });
    const archive = readJson(CONTENT_FILE, EMPTY);
    const before = archive[target[1]].length;
    const removed = archive[target[1]].find((entry) => entry.id === target[2]);
    archive[target[1]] = archive[target[1]].filter((entry) => entry.id !== target[2]);
    if (before === archive[target[1]].length) return send(response, 404, { error: "Entry not found." });
    writeJson(CONTENT_FILE, archive);
    const deployment = await publishArchive("Remove", removed ? removed.title : "archive entry");
    return send(response, 200, { ok: true, deployment });
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
}).listen(PORT, HOST, () => {
  console.log("T0x1cG portfolio is running at http://" + HOST + ":" + PORT);
  console.log("Open Publishing Desk from the top-right button to create its password.");
});
