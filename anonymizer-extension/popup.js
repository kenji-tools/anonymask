// popup.js — Logique du popup (storage.local uniquement, aucune donnée externe)

let state = {
  sites:   [],
  rules:   {},
  enabled: true
};

async function init() {
  const saved = await chrome.storage.local.get(["sites", "rules", "enabled"]);

  // Si la liste de sites est vide (premier lancement OU storage vidé),
  // on charge toujours les DEFAULT_SITES — sans dépendre d'un flag "installed"
  const hasSites = Array.isArray(saved.sites) && saved.sites.length > 0;
  if (!hasSites && typeof DEFAULT_SITES !== "undefined" && DEFAULT_SITES.length) {
    state.sites = [...DEFAULT_SITES];
    await chrome.storage.local.set({ sites: state.sites });
  } else {
    state.sites = saved.sites || [];
  }

  state.rules   = saved.rules   || {};
  state.enabled = saved.enabled !== false;
  renderAll();
  updateStatus();
  setupHint();
}

async function save() {
  await chrome.storage.local.set({
    sites:   state.sites,
    rules:   state.rules,
    enabled: state.enabled
  });
}

function renderAll() {
  document.getElementById("globalToggle").checked = state.enabled;
  renderChips();
  renderRules();
}

function renderChips() {
  const el = document.getElementById("siteChips");
  if (!state.sites.length) {
    el.innerHTML = `<span class="empty-chips">Aucun site — ajoutez-en un ci-dessous</span>`;
    return;
  }
  el.innerHTML = state.sites.map(site => `
    <div class="chip">
      <span>${esc(site)}</span>
      <button class="chip-rm" data-site="${esc(site)}" title="Supprimer" aria-label="Supprimer ${esc(site)}">×</button>
    </div>
  `).join("");
  el.querySelectorAll(".chip-rm").forEach(b =>
    b.addEventListener("click", () => removeSite(b.dataset.site))
  );
}

function renderRules() {
  const el = document.getElementById("ruleList");
  el.innerHTML = ANONYMIZATION_RULES.map(rule => {
    const on = isRuleEnabled(rule);
    return `
      <div class="rule-row ${on ? "" : "disabled"}" data-ruleid="${rule.id}">
        <div class="rule-text">
          <div class="rule-label">${esc(rule.label)}</div>
          <div class="rule-desc">${esc(rule.description)}</div>
        </div>
        ${!rule.enabled ? `<span class="rule-warn">⚠ Faux positifs</span>` : ""}
        <label class="toggle" title="${on ? "Désactiver" : "Activer"} cette règle">
          <input type="checkbox" class="rule-chk" data-rule="${rule.id}" ${on ? "checked" : ""}>
          <div class="toggle-track"></div>
        </label>
      </div>
    `;
  }).join("");
  el.querySelectorAll(".rule-chk").forEach(chk => {
    chk.addEventListener("change", () => {
      state.rules[chk.dataset.rule] = chk.checked;
      save();
      renderRules();
    });
  });
}

async function updateStatus() {
  const pill = document.getElementById("statusPill");
  const text = document.getElementById("statusText");
  if (!state.enabled) {
    pill.className = "status-pill inactive";
    text.textContent = "Désactivé";
    return;
  }
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) return;
    const host = new URL(tab.url).hostname.replace(/^www\./, "");
    const active = state.sites.some(s => {
      const c = s.replace(/^www\./, "").toLowerCase();
      return host.toLowerCase() === c || host.toLowerCase().endsWith("." + c);
    });
    pill.className = "status-pill " + (active ? "active" : "inactive");
    text.textContent = active ? `Actif · ${esc(host)}` : `Inactif sur ce site`;
  } catch {
    pill.className = "status-pill";
    text.textContent = "Inconnu";
  }
}

async function setupHint() {
  const hint = document.getElementById("currentHint");
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) return;
    const host = new URL(tab.url).hostname.replace(/^www\./, "");
    if (!host || host === "newtab") return;
    const already = state.sites.some(s => s.replace(/^www\./, "") === host);
    if (already) {
      hint.innerHTML = `✓ <strong>${esc(host)}</strong> est déjà dans la liste`;
    } else {
      hint.innerHTML = `Site actuel : <a id="addCurrent">${esc(host)}</a>`;
      document.getElementById("addCurrent")?.addEventListener("click", () => addSite(host));
    }
  } catch {}
}

function addSite(raw) {
  const clean = String(raw).trim().toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./, "")
    .replace(/[^a-z0-9.\-]/g, "");
  if (!clean || clean.length > 253) return;
  if (state.sites.includes(clean)) return;
  state.sites.push(clean);
  save();
  renderChips();
  updateStatus();
  setupHint();
  document.getElementById("siteInput").value = "";
}

function removeSite(domain) {
  state.sites = state.sites.filter(s => s !== domain);
  save();
  renderChips();
  updateStatus();
  setupHint();
}

function isRuleEnabled(rule) {
  return state.rules[rule.id] !== undefined ? state.rules[rule.id] : rule.enabled;
}

document.getElementById("globalToggle").addEventListener("change", e => {
  state.enabled = e.target.checked;
  save();
  updateStatus();
});

document.getElementById("btnAdd").addEventListener("click", () =>
  addSite(document.getElementById("siteInput").value)
);

document.getElementById("siteInput").addEventListener("keydown", e => {
  if (e.key === "Enter") addSite(e.target.value);
});

function esc(s) {
  const d = document.createElement("div");
  d.appendChild(document.createTextNode(String(s)));
  return d.innerHTML;
}

init();
