const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

let archive = { articles: [], notes: [], certifications: [], achievements: [] };
let activeFilter = "all";
let adminStatus = { configured: false, authenticated: false };
let backendOnline = true;

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[character]));

const dateLabel = (date) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.valueOf()) ? "" : parsed.toLocaleDateString("en", { month: "short", year: "numeric" }).toUpperCase();
};

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

function enableInspectionDeterrence() {
  document.addEventListener("contextmenu", (event) => event.preventDefault());
  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    const developerShortcut =
      key === "f12" ||
      (event.ctrlKey && event.shiftKey && ["i", "j", "c"].includes(key)) ||
      (event.ctrlKey && key === "u");
    if (developerShortcut) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
}

const pageIds = ["home", "research", "notes", "credentials", "competitions", "contact"];

function activatePage(requestedId, updateHash = true) {
  const pageId = pageIds.includes(requestedId) ? requestedId : "home";
  $$("main > section").forEach((section) => section.classList.toggle("page-active", section.id === pageId));
  $$(".rail nav a").forEach((link) => {
    const active = link.getAttribute("href") === "#" + pageId;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  document.body.dataset.page = pageId;
  if (updateHash && location.hash !== "#" + pageId) history.pushState({ pageId }, "", "#" + pageId);
}

function renderArticles() {
  const host = $("#articleGrid");
  const items = archive.articles.filter((item) => activeFilter === "all" || item.label === activeFilter);
  const articleCount = $("#articleCount");
  if (articleCount) articleCount.textContent = String(archive.articles.length).padStart(2, "0");
  if (!items.length) {
    host.innerHTML = '<div class="loading-card">No research entries in this frequency yet.</div>';
    return;
  }
  host.innerHTML = items.map((item, index) => `
    <button class="research-card" type="button" data-article-id="${escapeHtml(item.id)}" data-index="${String(index + 1).padStart(2, "0")}">
      <span class="card-top"><span class="topic">${escapeHtml(item.label)}</span><span>${dateLabel(item.createdAt)}</span></span>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.summary)}</p>
      <span class="card-bottom">
        <span class="tags">${(item.tags || []).slice(0, 2).map((tag) => `<i class="tag">${escapeHtml(tag)}</i>`).join("")}</span>
        <i class="read-arrow">↗</i>
      </span>
    </button>
  `).join("");
}

function renderNotes() {
  const host = $("#notesGrid");
  if (!archive.notes.length) {
    host.innerHTML = '<div class="loading-card">No notes published yet.</div>';
    return;
  }
  host.innerHTML = archive.notes.map((item) => `
    <article class="note-card">
      <div class="note-meta"><span>${escapeHtml(item.label || "FIELD NOTE")}</span><span>·</span><span>${dateLabel(item.createdAt)}</span></div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.summary)}</p>
      <button class="text-link note-open" type="button" data-note-id="${escapeHtml(item.id)}">Open note <span>→</span></button>
    </article>
  `).join("");
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
  const dialog = $("#articleDialog");
  $("#dialogType").textContent = `${entry.label || entry.type.toUpperCase()} / ${dateLabel(entry.createdAt)}`;
  $("#dialogContent").innerHTML = `
    <h2>${escapeHtml(entry.title)}</h2>
    <p class="article-meta">${(entry.tags || []).map(escapeHtml).join(" · ")}</p>
    <div class="article-body">${escapeHtml(entry.body || entry.summary).split("\\n").map((line) => `<p>${line || "&nbsp;"}</p>`).join("")}</div>
    ${entry.url ? `<a class="article-external" href="${escapeHtml(entry.url)}" target="_blank" rel="noreferrer">Open referenced resource ↗</a>` : ""}
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
    $("#authHelp").textContent = "This GitHub Pages version publishes your research but cannot run the private editor. Use your self-hosted backend to publish new entries.";
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
  try {
    archive = await request("/api/content");
  } catch {
    backendOnline = false;
    archive = await request("data/content.json");
  }
  archive.achievements ||= [];
  renderArticles();
  renderNotes();
  renderSeparatedCredentials();
  renderManageList();
}

async function refreshStatus() {
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
  $$('a[href^="#"]').forEach((link) => link.addEventListener("click", (event) => {
    const target = link.getAttribute("href").slice(1);
    if (!pageIds.includes(target)) return;
    event.preventDefault();
    activatePage(target);
  }));
  window.addEventListener("popstate", () => activatePage(location.hash.slice(1), false));
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
  $("#notesGrid").addEventListener("click", (event) => {
    const button = event.target.closest("[data-note-id]");
    if (!button) return;
    openEntry(archive.notes.find((item) => item.id === button.dataset.noteId));
  });
  ["#certGrid", "#competitionGrid"].forEach((selector) => {
    $(selector).addEventListener("click", (event) => {
      const button = event.target.closest("[data-credential-id]");
      if (!button) return;
      openCredential(button.dataset.credentialType, button.dataset.credentialId);
    });
  });
  $$("[data-close-dialog]").forEach((button) => button.addEventListener("click", () => button.closest("dialog").close()));
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
  $("#year").textContent = new Date().getFullYear();
  enableInspectionDeterrence();
  activatePage(location.hash.slice(1) || "home", false);
  setupEvents();
  try {
    await Promise.all([refreshArchive(), refreshStatus()]);
  } catch (error) {
    $("#articleGrid").innerHTML = '<div class="loading-card">Could not connect to the local archive. Start the server with <code>node server.js</code>.</div>';
    console.error(error);
  }
}
initialize();
