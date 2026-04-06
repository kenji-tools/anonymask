// content.js — 100% local, aucune connexion réseau

(async () => {
  const defaultSites = (typeof DEFAULT_SITES !== "undefined") ? DEFAULT_SITES : [];
  const currentHost  = window.location.hostname.replace(/^www\./, "").toLowerCase();

  // ── Charger prenoms.txt une seule fois ───────────────────────────────────
  async function buildPrenomsPattern() {
    try {
      const url  = chrome.runtime.getURL("prenoms.txt");
      const text = await fetch(url).then(r => r.text());
      const names = text
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l.length > 1)
        .map(n => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase());
      if (!names.length) return null;
      const escaped = names.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
      const source =
        "\\b(" + escaped.join("|") + ")" +
        "(-[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ][a-zàâäéèêëîïôùûüç]{1,15})?" +
        "[ \\t]+" +
        "(" +
          "[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ]{2,}(-[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ]{2,})*([ \\t]+[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ]{2,}(-[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ]{2,})*){0,2}" +
          "|" +
          "[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ][a-zàâäéèêëîïôùûüç]{1,25}(-[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ][a-zàâäéèêëîïôùûüç]{1,25})*" +
        ")\\b";
      return new RegExp(source, "g");
    } catch { return null; }
  }

  const prenomsPattern = await buildPrenomsPattern();

  // ── État courant — reconstruit à chaque changement de storage ────────────
  let activeRules = [];
  let isActive    = false;

  function rebuildFromConfig(config) {
    const rulesOverride = config.rules   || {};
    const globalEnabled = config.enabled !== false;
    const storedSites   = Array.isArray(config.sites) ? config.sites : [];
    const allSites      = [...new Set([...storedSites, ...defaultSites])];

    isActive = globalEnabled && allSites.some(site => {
      const s = site.replace(/^www\./, "").toLowerCase();
      return currentHost === s || currentHost.endsWith("." + s);
    });

    if (!isActive) {
      activeRules = [];
      console.log(`[AnonyMask] Inactif sur ${currentHost}`);
      return;
    }

    activeRules = ANONYMIZATION_RULES
      .filter(rule => {
        const enabled = rulesOverride[rule.id] !== undefined
          ? rulesOverride[rule.id]
          : rule.enabled;
        return enabled;
      })
      .map(rule => {
        if (rule.fromFile) return prenomsPattern ? { ...rule, pattern: prenomsPattern } : null;
        return rule;
      })
      .filter(Boolean);

    console.log(`[AnonyMask] ✅ Actif sur ${currentHost} — ${activeRules.length} règle(s)`);
  }

  // Chargement initial
  const initialConfig = await chrome.storage.local.get(["sites", "rules", "enabled"]);
  rebuildFromConfig(initialConfig);

  // Mise à jour en temps réel quand le popup modifie la config
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    // Fusionner les changements dans la config actuelle
    const updated = { ...initialConfig };
    for (const key of Object.keys(changes)) {
      updated[key] = changes[key].newValue;
    }
    rebuildFromConfig(updated);
  });

  // ── Anonymiser ────────────────────────────────────────────────────────────
  function anonymize(text) {
    if (text.length > 100_000) return text;
    let result = text;
    for (const rule of activeRules) {
      const re = new RegExp(rule.pattern.source, rule.pattern.flags);
      result = result.replace(re, rule.replacement);
    }
    return result;
  }

  // ── Keydown Ctrl+V ────────────────────────────────────────────────────────
  let pendingRestore = null;

  document.addEventListener("keydown", async (event) => {
    if (!isActive) return;
    const isCtrlV = (event.ctrlKey || event.metaKey) && event.key === "v";
    if (!isCtrlV) return;
    try {
      const original = await navigator.clipboard.readText();
      if (!original) return;
      const anonymized = anonymize(original);
      if (anonymized === original) return;
      await navigator.clipboard.writeText(anonymized);
      if (pendingRestore) clearTimeout(pendingRestore);
      pendingRestore = setTimeout(async () => {
        try { await navigator.clipboard.writeText(original); } catch {}
        pendingRestore = null;
      }, 800);
      const count = (anonymized.match(/\[[\wÀ-ÿ\s\/°]+anonymis[ée][^\]]*\]/g) || []).length;
      if (count > 0) setTimeout(() => showToast(count), 120);
    } catch (e) {
      console.warn("[AnonyMask] clipboard API indisponible :", e.message);
    }
  }, true);

  // ── Fallback paste ────────────────────────────────────────────────────────
  document.addEventListener("paste", (event) => {
    if (!isActive) return;
    const el = event.target;
    if (!el) return;
    if (el.tagName !== "INPUT" && el.tagName !== "TEXTAREA" && !el.isContentEditable) return;
    const cd = event.clipboardData || window.clipboardData;
    if (!cd) return;
    const text = cd.getData("text/plain") || cd.getData("text");
    if (!text) return;
    const anonymized = anonymize(text);
    if (anonymized === text) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    try { if (document.execCommand("insertText", false, anonymized)) return; } catch {}
    try {
      const s = el.selectionStart, e2 = el.selectionEnd;
      el.value = el.value.substring(0, s) + anonymized + el.value.substring(e2);
      el.selectionStart = el.selectionEnd = s + anonymized.length;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    } catch {}
    const sel = window.getSelection();
    if (sel?.rangeCount) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(anonymized));
      range.collapse(false);
    }
    const count = (anonymized.match(/\[[\wÀ-ÿ\s\/°]+anonymis[ée][^\]]*\]/g) || []).length;
    if (count > 0) showToast(count);
  }, true);

  // ── Toast ─────────────────────────────────────────────────────────────────
  let toastTimer;
  function showToast(count) {
    let t = document.getElementById("__anonymask_toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "__anonymask_toast";
      t.style.cssText = [
        "position:fixed","bottom:20px","right:20px","z-index:2147483647",
        "background:#1a1917","color:#f5f4f1",
        "border:1px solid rgba(255,255,255,0.12)",
        "border-radius:8px","padding:10px 14px",
        "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif",
        "font-size:12.5px","line-height:1.4",
        "box-shadow:0 4px 20px rgba(0,0,0,0.35)",
        "display:flex","align-items:center","gap:9px",
        "transition:opacity .25s ease,transform .25s ease",
        "opacity:0","transform:translateY(8px)",
        "pointer-events:none","max-width:280px"
      ].join(";");
      document.body.appendChild(t);
    }
    t.textContent = "";
    const icon = document.createElement("span");
    icon.textContent = "🛡";
    icon.style.fontSize = "15px";
    const msg = document.createElement("span");
    msg.textContent = `${count} donnée${count > 1 ? "s" : ""} anonymisée${count > 1 ? "s" : ""}`;
    t.appendChild(icon);
    t.appendChild(msg);
    requestAnimationFrame(() => { t.style.opacity = "1"; t.style.transform = "translateY(0)"; });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.style.opacity = "0"; t.style.transform = "translateY(8px)"; }, 3000);
  }

})();
