// config.js — Configuration par défaut d'AnonyMask
// Modifiez ce fichier puis rechargez l'extension dans chrome://extensions/

// ─── Créateur ────────────────────────────────────────────────────────────────
// Également modifiable dans manifest.json → champ "author"
const CREATOR = "Kenji Ishikawa";

// ─── Sites activés par défaut ────────────────────────────────────────────────
// Ces sites seront pré-chargés à la première installation.
// Format : nom de domaine sans "www." ni "https://"
// Exemples :
//   "claude.ai"
//   "app.mondossier.fr"
//   "outil-interne.maboite.com"

const DEFAULT_SITES = [
  // ── OpenAI ────────────────────────────────
  "chatgpt.com",
  "chat.openai.com",

  // ── Anthropic ─────────────────────────────
  "claude.ai",

  // ── Google ────────────────────────────────
  "gemini.google.com",
  "aistudio.google.com",

  // ── Microsoft / Copilot ───────────────────
  "copilot.microsoft.com",
  "bing.com",

  // ── Meta ──────────────────────────────────
  "meta.ai",

  // ── Mistral ───────────────────────────────
  "chat.mistral.ai",

  // ── Perplexity ────────────────────────────
  "perplexity.ai",

  // ── xAI / Grok ────────────────────────────
  "grok.com",
  "x.com",

  // ── Cohere ────────────────────────────────
  "coral.cohere.com",

  // ── Poe (agrégateur) ──────────────────────
  "poe.com",

  // ── HuggingChat ───────────────────────────
  "huggingface.co",

  // ── DeepSeek ──────────────────────────────
  "chat.deepseek.com",

  // ── Le Chat (Mistral FR) ──────────────────
  "le.chat",

  // ── Notion AI, etc. ───────────────────────
  "notion.so",
];