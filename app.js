const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

let archive = { articles: [], writeups: [], certifications: [], achievements: [] };
let activeFilter = "all";
let writeupPage = 0;
let activeWriteupCollection = "digital-dragons-2026";
let activeJeopardyCategory = "all";
const writeupsPerPage = 4;
let activeWriteupId = "";
const markdownCache = new Map();
const documentRenders = new WeakMap();
const writeupCompetitions = {
  "digital-dragons-2026": "The Digital Dragons CTF 2026",
  "cyber-arena-2026": "Cyber Arena 2026"
};
let adminStatus = { configured: false, authenticated: false };
const localBackend = ["localhost", "127.0.0.1", "::1"].includes(location.hostname);
let backendOnline = localBackend;

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[character]));

const dateLabel = (date) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.valueOf()) ? "" : parsed.toLocaleDateString("en", { month: "short", year: "numeric" }).toUpperCase();
};

async function refreshHtbRank() {
  const card = $("#htbRankCard");
  if (!card) return;
  try {
    const response = await fetch(`data/htb-profile.json?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error("HTB rank snapshot is unavailable.");
    const profile = await response.json();
    const level = Number(profile.level);
    const grade = Number(profile.grade);
    const totalXp = Number(profile.totalExperiencePoints);
    const streak = Number(profile.streakWeeks);
    const updatedAt = Date.parse(profile.updatedAt);
    if (!profile.rank || !Number.isFinite(level) || !Number.isFinite(totalXp)) throw new Error("HTB rank snapshot is invalid.");

    const rankImage = new URL(profile.rankImage);
    const trustedRankImage = rankImage.protocol === "https:"
      && rankImage.hostname === "htb-experience-prod-public-storage.s3.amazonaws.com"
      && rankImage.pathname.startsWith("/assets/ranks/svg/");
    if (!trustedRankImage) throw new Error("HTB rank artwork source is invalid.");

    $("#htbRankTitle").textContent = profile.rank;
    $("#htbUsername").textContent = profile.username || "T0x1cG";
    const countryRank = Number(profile.countryRank);
    $("#htbCountryRank").textContent = Number.isInteger(countryRank) && countryRank > 0
      ? `#${new Intl.NumberFormat("en").format(countryRank)}`
      : "—";
    $("#htbRankLevel").textContent = String(level);
    $("#htbRankGrade").textContent = Number.isFinite(grade) ? String(grade).padStart(2, "0") : "--";
    $("#htbRankXp").textContent = `${new Intl.NumberFormat("en").format(totalXp)} XP`;
    $("#htbRankStreak").textContent = Number.isFinite(streak) ? String(streak) : "--";
    $("#htbRankImage").src = `data/htb-rank.svg?v=${encodeURIComponent(profile.updatedAt || profile.rank)}`;
    $("#htbRankImage").alt = `Hack The Box ${profile.rank} rank emblem`;
    const syncAge = Date.now() - updatedAt;
    const recentlySynced = Number.isFinite(updatedAt) && syncAge >= -300000 && syncAge <= 43200000;
    $("#htbRankSync").textContent = recentlySynced ? "AUTO-SYNCED" : "LAST VERIFIED";
    card.dataset.state = recentlySynced ? "live" : "stale";
  } catch (error) {
    $("#htbRankSync").textContent = "PUBLIC PROFILE";
    card.dataset.state = "stale";
    console.warn(error.message);
  }
}

async function request(path, options = {}) {
  const response = await fetch(path, { headers: { "Content-Type": "application/json", ...(options.headers || {}) }, ...options });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Request failed.");
  return payload;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("The selected image could not be read."));
    reader.readAsDataURL(file);
  });
}

const pageIds = ["home", "research", "writeups", "projects", "credentials", "competitions", "contact", "search"];
const pageNames = { home: "Home", research: "Sharing", writeups: "Writeups", projects: "Projects", credentials: "Certifications", competitions: "Competitions", contact: "Contact", search: "Search" };
const pageIcons = { research: "sharing", writeups: "writeup", projects: "projects", credentials: "certifications", competitions: "competitions", contact: "contact", search: "search" };
const icon = (name) => `<svg class="ui-icon" aria-hidden="true"><use href="assets/icons/ui.svg#${name}" /></svg>`;

function closeNavigation() {
  document.body.classList.remove("menu-open");
  $("#menuToggle").setAttribute("aria-expanded", "false");
  $("#menuToggle").setAttribute("aria-label", "Open navigation");
}

function activatePage(requestedId, updateHash = true) {
  const pageId = pageIds.includes(requestedId) ? requestedId : "home";
  $$("main > section").forEach((section) => {
    section.classList.toggle("page-active", section.id === pageId);
    section.hidden = section.id !== pageId;
  });
  $$(".rail nav a").forEach((link) => {
    const active = link.getAttribute("href") === "#" + pageId;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  document.body.dataset.page = pageId;
  $("#currentPage").textContent = pageNames[pageId];
  document.title = `${pageNames[pageId]} · T0x1cG — Security & Learning`;
  closeNavigation();
  if (updateHash && location.hash !== "#" + pageId) history.pushState({ pageId }, "", "#" + pageId);
  if (updateHash) window.scrollTo({ top: 0, behavior: "instant" });
}

function archiveEntries() {
  return [
    ...archive.writeups.map((item) => ({ ...item, kind: "writeup" })),
    ...archive.articles.map((item) => ({ ...item, kind: "article" }))
  ];
}

function entryCard(item) {
  return `<button type="button" class="research-card" data-open-kind="${escapeHtml(item.kind)}" data-open-id="${escapeHtml(item.id)}">
    <span class="card-top"><span class="topic">${icon(item.kind === "writeup" ? "writeup" : "sharing")}${escapeHtml(item.kind === "writeup" ? `${writeupCompetitions[writeupCollection(item)]} · ${item.category}` : "Sharing · Learning resource")}</span><span>${dateLabel(item.createdAt)}</span></span>
    <h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.summary)}</p>
    <span class="card-bottom"><span class="tags">${(item.tags || []).slice(0, 3).map((tag) => `<i class="tag">${escapeHtml(tag)}</i>`).join("")}</span><span class="read-arrow" aria-hidden="true">↗</span></span>
  </button>`;
}

function renderDiscovery() {
  const entries = archiveEntries();
  const byDate = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);
  const latest = [...entries.filter((item) => item.kind === "writeup").sort(byDate).slice(0, 4), ...entries.filter((item) => item.kind === "article").sort(byDate).slice(0, 2)].sort(byDate);
  $("#latestGrid").innerHTML = latest.map(entryCard).join("") || '<p class="loading-card">New writing is on its way.</p>';
  renderSearch();
}

function renderSearch() {
  const query = $("#siteSearch").value.trim().toLowerCase();
  const items = archiveEntries().filter((item) => !query || `${item.title} ${item.summary} ${item.label} ${item.category || ""} ${(item.tags || []).join(" ")}`.toLowerCase().includes(query));
  $("#searchSummary").textContent = query ? `${items.length} result${items.length === 1 ? "" : "s"} for “${$("#siteSearch").value.trim()}”` : "Browse all writeups and shared resources.";
  $("#searchGrid").innerHTML = items.map(entryCard).join("") || '<p class="loading-card">No matches yet. Try a topic like crypto, web, or learning.</p>';
}

function renderArticles() {
  const host = $("#articleGrid");
  const items = archive.articles.filter((item) => activeFilter === "all" || item.label === activeFilter);
  const articleCount = $("#articleCount");
  if (articleCount) articleCount.textContent = String(archive.articles.length).padStart(2, "0");
  if (!items.length) {
    host.innerHTML = '<div class="loading-card">No shared entries in this frequency yet.</div>';
    return;
  }
  host.innerHTML = items.map((item, index) => `
    <button class="research-card" type="button" data-article-id="${escapeHtml(item.id)}" data-index="${String(index + 1).padStart(2, "0")}">
      <span class="card-top"><span class="topic">${icon("sharing")}${escapeHtml(item.label)}</span><span>${dateLabel(item.createdAt)}</span></span>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.summary)}</p>
      <span class="card-bottom">
        <span class="tags">${(item.tags || []).slice(0, 2).map((tag) => `<i class="tag">${escapeHtml(tag)}</i>`).join("")}</span>
        <i class="read-arrow">↗</i>
      </span>
    </button>
  `).join("");
}

function writeupCollection(item) {
  return item.competition || (item.collection === "jeopardy" ? "cyber-arena-2026" : "");
}

function filteredWriteups() {
  return (archive.writeups || []).filter((item) => {
    if (writeupCollection(item) !== activeWriteupCollection) return false;
    return activeJeopardyCategory === "all"
      || item.category === activeJeopardyCategory;
  });
}

function renderWriteups() {
  const host = $("#writeupGrid");
  const items = filteredWriteups();
  $$('[data-writeup-collection]').forEach((button) => {
    const active = button.dataset.writeupCollection === activeWriteupCollection;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
    const count = archive.writeups.filter((item) => writeupCollection(item) === button.dataset.writeupCollection).length;
    $("b", button).textContent = String(count).padStart(2, "0");
  });
  const categoryBar = $("#jeopardyCategories");
  const categories = ["all", ...new Set(archive.writeups.filter((item) => writeupCollection(item) === activeWriteupCollection).map((item) => item.category))];
  categoryBar.innerHTML = '<span>FILTER CATEGORY</span>' + categories.map((category) => `<button type="button" data-jeopardy-category="${escapeHtml(category)}" class="${category === activeJeopardyCategory ? "active" : ""}" aria-pressed="${category === activeJeopardyCategory}">${escapeHtml(category === "all" ? "All" : category)}</button>`).join("");
  const totalPages = Math.max(1, Math.ceil(items.length / writeupsPerPage));
  writeupPage = Math.min(writeupPage, totalPages - 1);
  const visible = items.slice(writeupPage * writeupsPerPage, (writeupPage + 1) * writeupsPerPage);
  $("#writeupPageLabel").textContent = `PAGE ${String(writeupPage + 1).padStart(2, "0")} / ${String(totalPages).padStart(2, "0")}`;
  $("#writeupPrev").disabled = writeupPage === 0;
  $("#writeupNext").disabled = writeupPage >= totalPages - 1;
  if (!visible.length) {
    host.innerHTML = '<div class="loading-card">No writeups are published in this category yet.</div>';
    return;
  }
  host.innerHTML = visible.map((item, index) => `
    <button class="research-card writeup-card" type="button" data-writeup-id="${escapeHtml(item.id)}" data-index="${String((writeupPage * writeupsPerPage) + index + 1).padStart(2, "0")}">
      <span class="card-top"><span class="topic">${icon("writeup")}${escapeHtml(item.label || "CTF WRITEUP")}</span><span>${dateLabel(item.createdAt)}</span></span>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.summary)}</p>
      <span class="card-bottom">
        <span class="tags">${(item.tags || []).slice(0, 3).map((tag) => `<i class="tag">${escapeHtml(tag)}</i>`).join("")}</span>
        <i class="read-arrow">↗</i>
      </span>
    </button>
  `).join("");
}

function safeDocumentUrl(value) {
  if (!value || typeof value !== "string") return "";
  try {
    const url = new URL(value, document.baseURI);
    const pathAllowed = /^\/assets\/writeups\/[a-z0-9/_-]+\.md$/i.test(url.pathname);
    return url.origin === location.origin && !url.username && !url.password && pathAllowed ? url.href : "";
  } catch {
    return "";
  }
}

function safeLinkUrl(value, sourcePath) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const base = sourcePath ? new URL(sourcePath, document.baseURI) : new URL(document.baseURI);
    const url = new URL(value.trim(), base);
    return ["http:", "https:", "mailto:"].includes(url.protocol) && !url.username && !url.password ? url : null;
  } catch {
    return null;
  }
}

function formatInline(value, sourcePath) {
  const tokens = [];
  const preserve = (html) => {
    const marker = `\uE000${tokens.length}\uE001`;
    tokens.push(html);
    return marker;
  };
  let text = String(value || "");
  text = text.replace(/`([^`\n]+)`/g, (_, code) => preserve(`<code>${escapeHtml(code)}</code>`));
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, target) => {
    const url = safeLinkUrl(target, sourcePath);
    if (!url || url.origin !== location.origin) return preserve(`<span class="markdown-image-missing">Image omitted: ${escapeHtml(alt || target)}</span>`);
    return preserve(`<img src="${escapeHtml(url.href)}" alt="${escapeHtml(alt)}" loading="lazy" />`);
  });
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, target) => {
    const url = safeLinkUrl(target, sourcePath);
    if (!url) return escapeHtml(label);
    const external = url.origin !== location.origin;
    return preserve(`<a href="${escapeHtml(url.href)}"${external ? ' target="_blank" rel="noreferrer"' : ""}>${escapeHtml(label)}</a>`);
  });
  let html = escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/(^|[\s(])\*([^*\n]+)\*(?=$|[\s).,])/g, "$1<em>$2</em>")
    .replace(/~~([^~]+)~~/g, "<del>$1</del>");
  tokens.forEach((token, index) => {
    html = html.replace(`\uE000${index}\uE001`, () => token);
  });
  return html;
}

function markdownToHtml(markdown, sourcePath) {
  const lines = String(markdown || "").replace(/\r\n?/g, "\n").split("\n");
  const html = [];
  const headings = [];
  const slugCounts = new Map();
  const slugFor = (value) => {
    const base = String(value).toLowerCase().replace(/<[^>]+>/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
    const count = (slugCounts.get(base) || 0) + 1;
    slugCounts.set(base, count);
    return count === 1 ? base : `${base}-${count}`;
  };
  const tableCells = (line) => line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
  const startsBlock = (index) => {
    const line = lines[index] || "";
    const next = lines[index + 1] || "";
    return !line.trim() ||
      /^```/.test(line) ||
      /^#{1,6}\s+/.test(line) ||
      /^>\s?/.test(line) ||
      /^\s*(?:[-+*]|\d+\.)\s+/.test(line) ||
      /^\s*(?:---+|\*\*\*+|___+)\s*$/.test(line) ||
      (line.includes("|") && /^\s*\|?\s*:?-{3,}/.test(next));
  };

  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = line.match(/^```\s*([a-zA-Z0-9_+-]*)\s*$/);
    if (fence) {
      const code = [];
      index += 1;
      while (index < lines.length && !/^```\s*$/.test(lines[index])) {
        code.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      html.push(`<div class="code-frame"><div class="code-frame-top"><span>${escapeHtml(fence[1] || "TERMINAL")}</span><button type="button" data-copy-code>Copy</button></div><pre><code>${escapeHtml(code.join("\n"))}</code></pre></div>`);
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const title = heading[2].replace(/\s+#+\s*$/, "").trim();
      const id = slugFor(title);
      headings.push({ id, level, title: title.replace(/[*_`]/g, "") });
      html.push(`<h${level} id="${id}">${formatInline(title, sourcePath)}</h${level}>`);
      index += 1;
      continue;
    }

    if (line.includes("|") && /^\s*\|?\s*:?-{3,}/.test(lines[index + 1] || "")) {
      const headers = tableCells(line);
      index += 2;
      const rows = [];
      while (index < lines.length && lines[index].includes("|") && lines[index].trim()) {
        rows.push(tableCells(lines[index]));
        index += 1;
      }
      html.push(`<div class="table-wrap"><table><thead><tr>${headers.map((cell) => `<th>${formatInline(cell, sourcePath)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${headers.map((_, cellIndex) => `<td>${formatInline(row[cellIndex] || "", sourcePath)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
      continue;
    }

    if (/^\s*(?:---+|\*\*\*+|___+)\s*$/.test(line)) {
      html.push("<hr />");
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }
      html.push(`<blockquote>${quote.map((part) => formatInline(part, sourcePath)).join("<br />")}</blockquote>`);
      continue;
    }

    const listMatch = line.match(/^\s*([-+*]|\d+\.)\s+(.+)$/);
    if (listMatch) {
      const ordered = /\d+\./.test(listMatch[1]);
      const tag = ordered ? "ol" : "ul";
      const items = [];
      while (index < lines.length) {
        const match = lines[index].match(/^\s*([-+*]|\d+\.)\s+(.+)$/);
        if (!match || /\d+\./.test(match[1]) !== ordered) break;
        items.push(match[2]);
        index += 1;
      }
      html.push(`<${tag}>${items.map((item) => `<li>${formatInline(item, sourcePath)}</li>`).join("")}</${tag}>`);
      continue;
    }

    const paragraph = [];
    while (index < lines.length && !startsBlock(index)) {
      paragraph.push(lines[index]);
      index += 1;
    }
    if (!paragraph.length) {
      paragraph.push(line);
      index += 1;
    }
    html.push(`<p>${paragraph.map((part) => formatInline(part, sourcePath)).join("<br />")}</p>`);
  }

  return { html: html.join(""), headings };
}

async function readMarkdown(item) {
  const sourcePath = item.document || "";
  if (!sourcePath) {
    return { markdown: `# ${item.title}\n\n${item.body || item.summary || "No content published yet."}`, sourcePath: "" };
  }
  const url = safeDocumentUrl(sourcePath);
  if (!url) throw new Error("This document path is not allowed.");
  if (!markdownCache.has(url)) {
    markdownCache.set(url, fetch(url, { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error("The document could not be loaded.");
      return response.text();
    }));
  }
  return { markdown: await markdownCache.get(url), sourcePath };
}

function renderOutline(headings, hostSelector) {
  const host = $(hostSelector);
  const visible = headings.filter((heading) => heading.level <= 3);
  host.innerHTML = visible.length
    ? visible.map((heading) => `<button type="button" class="outline-level-${heading.level}" data-outline-target="${heading.id}">${escapeHtml(heading.title)}</button>`).join("")
    : '<span class="outline-empty">No headings</span>';
}

async function displayMarkdown(item, options) {
  const content = $(options.content);
  const scroll = $(options.scroll);
  const renderToken = {};
  documentRenders.set(content, renderToken);
  content.innerHTML = '<p class="knowledge-loading">Opening document…</p>';
  $(options.title).textContent = item.title;
  if (options.label) $(options.label).textContent = options.labelText || item.label || "NOTES";
  try {
    const { markdown, sourcePath } = await readMarkdown(item);
    if (documentRenders.get(content) !== renderToken) return;
    const rendered = markdownToHtml(markdown, sourcePath);
    content.innerHTML = rendered.html || '<p>No content published yet.</p>';
    renderOutline(rendered.headings, options.outline);
    scroll.scrollTop = 0;
  } catch (error) {
    if (documentRenders.get(content) !== renderToken) return;
    content.innerHTML = `<div class="document-error"><strong>Document unavailable</strong><p>${escapeHtml(error.message)}</p></div>`;
    $(options.outline).innerHTML = "";
  }
}


function renderWriteupTree(query = "") {
  const normalized = query.trim().toLowerCase();
  const items = (archive.writeups || []).filter((item) => !normalized || `${item.title} ${item.label} ${item.category || ""} ${(item.tags || []).join(" ")}`.toLowerCase().includes(normalized));
  const groups = Object.entries(writeupCompetitions).map(([competition, label]) => ({
      label,
      items: items.filter((item) => writeupCollection(item) === competition)
    })).filter((group) => group.items.length);
  $("#writeupTree").innerHTML = groups.length
    ? groups.map((group) => `<section class="writeup-tree-section"><p>${escapeHtml(group.label)}</p>${group.items.map((item) => `<button class="${item.id === activeWriteupId ? "active" : ""}" type="button" data-writeup-select="${escapeHtml(item.id)}"><i></i><span>${escapeHtml(item.title)}</span><small>${escapeHtml(item.category)}</small></button>`).join("")}</section>`).join("")
    : '<p class="knowledge-loading">No writeups matched your search.</p>';
}

async function selectWriteup(id) {
  const item = (archive.writeups || []).find((entry) => entry.id === id);
  if (!item) return;
  activeWriteupId = id;
  if (activeWriteupCollection !== writeupCollection(item)) {
    activeWriteupCollection = writeupCollection(item);
    activeJeopardyCategory = "all";
    writeupPage = 0;
    renderWriteups();
  }
  if ($("#documentDialog").open) {
    const url = new URL(location.href);
    url.searchParams.set("writeup", id);
    history.replaceState({ pageId: "writeups", writeup: id }, "", url);
  }
  renderWriteupTree($("#writeupSearch").value);
  await displayMarkdown(item, {
    content: "#writeupDocument",
    scroll: "#writeupScroll",
    outline: "#writeupOutline",
    title: "#writeupDocumentTitle"
  });
}

function openWriteupReader(id, updateUrl = true) {
  const item = (archive.writeups || []).find((entry) => entry.id === id);
  if (!item) return;
  if (!$("#documentDialog")) {
    openEntry(item);
    return;
  }
  if (updateUrl) {
    const url = new URL(location.href);
    url.searchParams.set("writeup", id);
    url.hash = "writeups";
    history.pushState({ pageId: "writeups", writeup: id }, "", url);
    activatePage("writeups", false);
  }
  const dialog = $("#documentDialog");
  if (!dialog.open) dialog.showModal();
  selectWriteup(id);
}

function renderCertifications() {
  const host = $("#certGrid");
  if (!archive.certifications.length) {
    host.innerHTML = '<div class="loading-card">Credentials will appear here.</div>';
    return;
  }
  host.innerHTML = archive.certifications.map((item) => `
    <article class="cert-card">
      <div class="cert-badge">${escapeHtml((item.label || "CERT").slice(0, 3).toUpperCase())}</div>
      <span class="cert-year">${dateLabel(item.createdAt).slice(-4)}</span>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.label || "Independent learning")}</p>
    </article>
  `).join("");
}

function renderCredentials() {
  const host = $("#certGrid");
  const credentials = [
    ...(archive.certifications || []).map((item) => ({ ...item, type: "certifications" })),
    ...(archive.achievements || []).map((item) => ({ ...item, type: "achievements" }))
  ]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  if (!credentials.length) {
    host.innerHTML = '<div class="loading-card">Credentials will appear here.</div>';
    return;
  }
  host.innerHTML = credentials.map((item) =>
    '<button class="cert-card ' + (item.type === "achievements" ? "achievement-card" : "") + '" type="button" data-credential-type="' + item.type + '" data-credential-id="' + escapeHtml(item.id) + '">' +
      '<span class="cert-image">' +
        (item.image ? '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" />' : '<i>' + escapeHtml((item.label || "CERT").slice(0, 3).toUpperCase()) + '</i>') +
        '<b>VIEW ORIGINAL ↗</b>' +
      '</span>' +
      '<span class="cert-copy">' +
        '<span class="cert-year">' + dateLabel(item.createdAt).slice(-4) + '</span>' +
        '<h3>' + escapeHtml(item.title) + '</h3>' +
        '<p>' + escapeHtml(item.label || "Independent learning") + '</p>' +
        '<small class="cert-detail">' + escapeHtml(item.summary || "") + '</small>' +
      '</span>' +
    '</button>'
  ).join("");
}

function credentialCards(items, type) {
  return items.map((item) =>
    '<button class="cert-card ' + (type === "achievements" ? "achievement-card" : "") + '" type="button" data-credential-type="' + type + '" data-credential-id="' + escapeHtml(item.id) + '">' +
      '<span class="cert-image">' +
        (item.image ? '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" />' : '<i>' + escapeHtml((item.label || "CERT").slice(0, 3).toUpperCase()) + '</i>') +
        '<b>VIEW ORIGINAL ↗</b>' +
      '</span>' +
      '<span class="cert-copy">' +
        '<span class="cert-year">' + dateLabel(item.createdAt).slice(-4) + '</span>' +
        '<h3>' + escapeHtml(item.title) + '</h3>' +
        '<p>' + escapeHtml(item.label || "Independent learning") + '</p>' +
        '<small class="cert-detail">' + escapeHtml(item.summary || "") + '</small>' +
      '</span>' +
    '</button>'
  ).join("");
}

function renderSeparatedCredentials() {
  const certificationHost = $("#certGrid");
  const competitionHost = $("#competitionGrid");
  const certifications = archive.certifications || [];
  const achievements = archive.achievements || [];
  certificationHost.innerHTML = certifications.length
    ? credentialCards(certifications, "certifications")
    : '<div class="loading-card">No certifications published yet.</div>';
  competitionHost.innerHTML = achievements.length
    ? credentialCards(achievements, "achievements")
    : '<div class="loading-card">No competition results published yet.</div>';
}

function allEntries() {
  return Object.entries(archive).flatMap(([type, entries]) => entries.map((entry) => ({ ...entry, type })))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function renderManageList() {
  const host = $("#manageList");
  if (!adminStatus.authenticated) return;
  host.innerHTML = allEntries().map((item) => `
    <div class="manage-item">
      <div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.type)} / ${escapeHtml(item.label || "unlabeled")}</small></div>
      <button class="delete-entry" type="button" data-delete-type="${item.type}" data-delete-id="${item.id}">Remove</button>
    </div>
  `).join("") || '<p class="form-message">Your archive is empty.</p>';
}

function openEntry(entry) {
  if (!entry) return;
  const externalUrl = safeLinkUrl(entry.url);
  const dialog = $("#articleDialog");
  $("#dialogType").textContent = `${entry.label || entry.type.toUpperCase()} / ${dateLabel(entry.createdAt)}`;
  $("#dialogContent").innerHTML = `
    <h2>${escapeHtml(entry.title)}</h2>
    <p class="article-meta">${(entry.tags || []).map(escapeHtml).join(" · ")}</p>
    <div class="article-body">${escapeHtml(entry.body || entry.summary).split(/\n\s*\n|\\n/).map((line) => `<p>${line || "&nbsp;"}</p>`).join("")}</div>
    ${externalUrl ? `<a class="article-external" href="${escapeHtml(externalUrl.href)}" target="_blank" rel="noopener noreferrer">Open referenced resource ↗</a>` : ""}
  `;
  dialog.showModal();
}

function openCredential(type, id) {
  const item = (archive[type] || []).find((entry) => entry.id === id);
  if (!item) return;
  const dialog = $("#articleDialog");
  $("#dialogType").textContent = (type === "achievements" ? "ACHIEVEMENT" : "CERTIFICATE") + " / " + dateLabel(item.createdAt);
  $("#dialogContent").innerHTML =
    '<div class="credential-preview">' +
      (item.image ? '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" />' : "") +
      '<h2>' + escapeHtml(item.title) + '</h2>' +
      '<p>' + escapeHtml(item.label + " · " + item.summary) + '</p>' +
    '</div>';
  dialog.showModal();
}

function syncAuthView() {
  const panel = $("#authPanel");
  const editor = $("#editorPanel");
  $("#logoutButton").hidden = !adminStatus.authenticated;
  if (!backendOnline) {
    editor.hidden = true;
    panel.hidden = false;
    $("#authTitle").textContent = "Read-only public archive";
    $("#authHelp").textContent = "This GitHub Pages version publishes your shared work but cannot run the private editor. Use your self-hosted backend to publish new entries.";
    $("#authSubmit").disabled = true;
    $("#authSubmit").innerHTML = "Backend required";
    $("#passwordInput").disabled = true;
    return;
  }
  $("#authSubmit").disabled = false;
  $("#passwordInput").disabled = false;
  if (adminStatus.authenticated) {
    panel.hidden = true;
    editor.hidden = false;
    renderManageList();
    return;
  }
  editor.hidden = true;
  panel.hidden = false;
  $("#authTitle").textContent = adminStatus.configured ? "Unlock the desk" : "Set up the desk";
  $("#authHelp").textContent = adminStatus.configured ? "Enter your administrator password to edit the archive." : "Choose a password of at least 12 characters. This is only needed once.";
  $("#authSubmit").innerHTML = adminStatus.configured ? 'Enter publishing desk <span>↗</span>' : 'Create secure desk <span>↗</span>';
  $("#passwordInput").autocomplete = adminStatus.configured ? "current-password" : "new-password";
}

async function refreshArchive() {
  let loadedFromBackend = false;
  if (localBackend && backendOnline) {
    try {
      archive = await request("/api/content");
      loadedFromBackend = true;
    } catch {
      backendOnline = false;
    }
  }
  if (!loadedFromBackend) {
    const archiveUrl = new URL("data/content.json", document.baseURI);
    archiveUrl.searchParams.set("v", String(Date.now()));
    archive = await request(archiveUrl.href, { cache: "no-store" });
  }
  archive.articles ||= [];
  archive.writeups ||= [];
  delete archive.notes;
  archive.certifications ||= [];
  archive.achievements ||= [];
  renderArticles();
  renderWriteups();
  renderSeparatedCredentials();
  renderDiscovery();
  renderManageList();
  const requestedWriteup = new URL(location.href).searchParams.get("writeup");
  if (requestedWriteup && archive.writeups.some((item) => item.id === requestedWriteup)) {
    activatePage("writeups", false);
    openWriteupReader(requestedWriteup, false);
  }
}

async function refreshStatus() {
  if (!localBackend) {
    backendOnline = false;
    adminStatus = { configured: true, authenticated: false };
    $("#openDesk").hidden = true;
    syncAuthView();
    return;
  }
  try {
    adminStatus = await request("/api/admin/status");
    backendOnline = true;
    $("#openDesk").hidden = false;
  } catch {
    backendOnline = false;
    adminStatus = { configured: true, authenticated: false };
    $("#openDesk").hidden = true;
  }
  syncAuthView();
}

function setupEvents() {
  $("#menuToggle").addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    $("#menuToggle").setAttribute("aria-expanded", String(open));
    $("#menuToggle").setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".rail, #menuToggle")) closeNavigation();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.body.classList.contains("menu-open")) {
      closeNavigation();
      $("#menuToggle").focus();
    }
    if (event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey && !event.target.closest("input, textarea, select, [contenteditable], dialog")) {
      event.preventDefault();
      $("#siteSearch").focus();
    }
  });
  $("#siteSearch").addEventListener("input", () => {
    activatePage("search");
    renderSearch();
  });
  ["#latestGrid", "#searchGrid"].forEach((selector) => $(selector).addEventListener("click", (event) => {
    const button = event.target.closest("[data-open-id]");
    if (!button) return;
    if (button.dataset.openKind === "writeup") openWriteupReader(button.dataset.openId);
    else if (button.dataset.openKind === "article") openEntry(archive.articles.find((item) => item.id === button.dataset.openId));
  }));
  $$('a[href^="#"]').forEach((link) => link.addEventListener("click", (event) => {
    const target = link.getAttribute("href").slice(1);
    if (!pageIds.includes(target)) return;
    event.preventDefault();
    activatePage(target);
  }));
  window.addEventListener("popstate", () => {
    activatePage(location.hash.slice(1), false);
    const id = new URL(location.href).searchParams.get("writeup");
    if (id && archive.writeups.some((item) => item.id === id)) openWriteupReader(id, false);
    else if ($("#documentDialog").open) $("#documentDialog").close();
  });
  $$(".filter").forEach((button) => button.addEventListener("click", () => {
    $$(".filter").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.dataset.filter;
    renderArticles();
  }));
  $("#articleGrid").addEventListener("click", (event) => {
    const button = event.target.closest("[data-article-id]");
    if (!button) return;
    openEntry(archive.articles.find((item) => item.id === button.dataset.articleId));
  });
  $("#writeupGrid").addEventListener("click", (event) => {
    const button = event.target.closest("[data-writeup-id]");
    if (!button) return;
    openWriteupReader(button.dataset.writeupId);
  });
  $$('[data-writeup-collection]').forEach((button) => button.addEventListener("click", () => {
    activeWriteupCollection = button.dataset.writeupCollection;
    activeJeopardyCategory = "all";
    writeupPage = 0;
    renderWriteups();
  }));
  $("#jeopardyCategories").addEventListener("click", (event) => {
    const button = event.target.closest("[data-jeopardy-category]");
    if (!button) return;
    activeJeopardyCategory = button.dataset.jeopardyCategory;
    writeupPage = 0;
    renderWriteups();
  });
  $("#writeupPrev").addEventListener("click", () => {
    if (writeupPage === 0) return;
    writeupPage -= 1;
    renderWriteups();
  });
  $("#writeupNext").addEventListener("click", () => {
    const totalPages = Math.max(1, Math.ceil(filteredWriteups().length / writeupsPerPage));
    if (writeupPage >= totalPages - 1) return;
    writeupPage += 1;
    renderWriteups();
  });
  const writeupTree = $("#writeupTree");
  if (writeupTree) {
    writeupTree.addEventListener("click", (event) => {
      const button = event.target.closest("[data-writeup-select]");
      if (!button) return;
      selectWriteup(button.dataset.writeupSelect);
    });
  }
  const writeupSearch = $("#writeupSearch");
  if (writeupSearch) writeupSearch.addEventListener("input", (event) => renderWriteupTree(event.currentTarget.value));
  ["#writeupOutline"].forEach((selector) => {
    const outline = $(selector);
    if (!outline) return;
    outline.addEventListener("click", (event) => {
      const button = event.target.closest("[data-outline-target]");
      if (!button) return;
      const content = $("#writeupDocument");
      const target = content.querySelector(`#${button.dataset.outlineTarget}`);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  ["#writeupDocument"].forEach((selector) => {
    const documentHost = $(selector);
    if (!documentHost) return;
    documentHost.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-copy-code]");
      if (button) {
        const code = button.closest(".code-frame").querySelector("code").textContent;
        try {
          await navigator.clipboard.writeText(code);
          button.textContent = "Copied";
          window.setTimeout(() => { button.textContent = "Copy"; }, 1200);
        } catch {
          button.textContent = "Select";
        }
        return;
      }
      const link = event.target.closest("a");
      if (!link) return;
      const url = new URL(link.href, document.baseURI);
      if (url.origin !== location.origin || !url.pathname.toLowerCase().endsWith(".md")) return;
      const documentPath = url.pathname.replace(/^\/+/, "");
      const item = archive.writeups.find((entry) => entry.document === documentPath);
      if (item) {
        event.preventDefault();
        selectWriteup(item.id);
      }
    });
  });
  ["#certGrid", "#competitionGrid"].forEach((selector) => {
    $(selector).addEventListener("click", (event) => {
      const button = event.target.closest("[data-credential-id]");
      if (!button) return;
      openCredential(button.dataset.credentialType, button.dataset.credentialId);
    });
  });
  $$("[data-close-dialog]").forEach((button) => button.addEventListener("click", () => button.closest("dialog").close()));
  const documentDialog = $("#documentDialog");
  if (documentDialog) {
    documentDialog.addEventListener("close", () => {
      const url = new URL(location.href);
      if (!url.searchParams.has("writeup")) return;
      url.searchParams.delete("writeup");
      history.replaceState({ pageId: "writeups" }, "", url);
    });
  }
  $("#openDesk").addEventListener("click", async () => {
    await refreshStatus();
    if (!backendOnline) return;
    $("#deskDialog").showModal();
  });
  $("#authForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = $("#authMessage");
    message.textContent = "";
    try {
      const endpoint = adminStatus.configured ? "/api/admin/login" : "/api/admin/setup";
      await request(endpoint, { method: "POST", body: JSON.stringify({ password: $("#passwordInput").value }) });
      $("#passwordInput").value = "";
      message.className = "form-message success";
      message.textContent = "Access granted.";
      await refreshStatus();
    } catch (error) {
      message.className = "form-message error";
      message.textContent = error.message;
    }
  });
  $("#logoutButton").addEventListener("click", async () => {
    await request("/api/admin/logout", { method: "POST", body: "{}" });
    await refreshStatus();
  });
  const entryType = $("#entryType");
  const entryWriteupCollection = $("#entryWriteupCollection");
  const entryJeopardyCategory = $("#entryJeopardyCategory");
  const syncWriteupFields = () => {
    const isWriteup = entryType.value === "writeups";
    $("#writeupMetaFields").hidden = !isWriteup;
    entryWriteupCollection.disabled = !isWriteup;
    entryJeopardyCategory.disabled = !isWriteup || entryWriteupCollection.value !== "jeopardy";
  };
  entryType.addEventListener("change", syncWriteupFields);
  entryWriteupCollection.addEventListener("change", syncWriteupFields);
  syncWriteupFields();
  $("#entryForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = $("#entryMessage");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const imageFile = form.get("imageFile");
    delete payload.imageFile;
    if (imageFile && imageFile.size) {
      if (imageFile.size > 1200000) {
        message.className = "form-message error";
        message.textContent = "Please choose an image smaller than 1.2 MB.";
        return;
      }
      payload.image = await fileToDataUrl(imageFile);
    }
    payload.tags = payload.tags.split(",").map((tag) => tag.trim()).filter(Boolean);
    message.className = "form-message";
    message.textContent = "Publishing…";
    try {
      const created = await request("/api/content", { method: "POST", body: JSON.stringify(payload) });
      event.currentTarget.reset();
      syncWriteupFields();
      message.className = created.deployment && created.deployment.published ? "form-message success" : "form-message";
      message.textContent = created.deployment ? created.deployment.message : "Published to the archive.";
      await refreshArchive();
    } catch (error) {
      message.className = "form-message error";
      message.textContent = error.message;
    }
  });
  $("#manageList").addEventListener("click", async (event) => {
    const button = event.target.closest("[data-delete-id]");
    if (!button || !confirm("Remove this entry from your public archive?")) return;
    try {
      await request(`/api/content/${button.dataset.deleteType}/${button.dataset.deleteId}`, { method: "DELETE" });
      await refreshArchive();
    } catch (error) {
      alert(error.message);
    }
  });
  $$("main section[id]").forEach((section) => {
    new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      if (!section.classList.contains("page-active")) return;
      $$(".rail nav a").forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${section.id}`));
    }, { rootMargin: "-40% 0px -55% 0px" }).observe(section);
  });
}

async function initialize() {
  Object.entries(pageIcons).forEach(([page, name]) => {
    const heading = $(`#${page} h2`);
    if (heading) heading.insertAdjacentHTML("afterbegin", icon(name));
  });
  $("#year").textContent = new Date().getFullYear();
  activatePage(location.hash.slice(1) || "home", false);
  setupEvents();
  try {
    await refreshStatus();
    await Promise.all([refreshArchive(), refreshHtbRank()]);
  } catch (error) {
    const localHelp = localBackend
      ? 'Could not connect to the private archive. Start the server with <code>node server.js</code>.'
      : 'Could not load the public sharing archive. Refresh the page or clear the browser cache.';
    $("#articleGrid").innerHTML = '<div class="loading-card">' + localHelp + '</div>';
    $("#writeupGrid").innerHTML = '<div class="loading-card">' + localHelp + '</div>';
    $("#latestGrid").innerHTML = '<div class="loading-card">Could not load the archive. Please refresh to try again.</div>';
    console.error(error);
  }
}
if (document.documentElement.dataset.frameState === "allowed") initialize();
