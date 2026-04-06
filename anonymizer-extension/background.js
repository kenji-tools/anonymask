// background.js — Service worker MV3
// S'exécute à l'installation, initialise le storage sans attendre l'ouverture du popup

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason !== "install" && reason !== "update") return;

  const existing = await chrome.storage.local.get("sites");
  const hasSites = Array.isArray(existing.sites) && existing.sites.length > 0;

  // Ne pas écraser les sites si l'utilisateur en a déjà configurés
  if (hasSites) return;

  // Charger config.js n'est pas possible depuis le SW — les DEFAULT_SITES
  // sont dupliqués ici. Mets à jour les deux fichiers si tu changes la liste.
  const DEFAULT_SITES = [
    "chatgpt.com", "chat.openai.com",
    "claude.ai",
    "gemini.google.com", "aistudio.google.com",
    "copilot.microsoft.com", "bing.com",
    "meta.ai",
    "chat.mistral.ai",
    "perplexity.ai",
    "grok.com", "x.com",
    "coral.cohere.com",
    "poe.com",
    "huggingface.co",
    "chat.deepseek.com",
    "le.chat",
    "notion.so"
  ];

  await chrome.storage.local.set({ sites: DEFAULT_SITES, enabled: true });
  console.log("[AnonyMask] Storage initialisé avec", DEFAULT_SITES.length, "sites par défaut");
});
