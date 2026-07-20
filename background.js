import { loadSettings } from "./storage.js";
//
// Prefissi di URL su cui Chrome non consente di iniettare lo script.
const RESTRICTED_PREFIXES = [
  "chrome://",
  "chrome-extension://",
  "edge://",
  "about:",
  "view-source:",
  "https://chrome.google.com/webstore",
  "https://chromewebstore.google.com"
];
//
/**
 * Registra i listener del service worker.
 */
const startListeners = function () {
  chrome.commands.onCommand.addListener((command) => { onCommand(command); });
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    onMessage(message).then(sendResponse);
    return true;
  });
}
//
/**
 * Handler dei comandi da tastiera.
 * @param {string} command - Nome del comando ricevuto (vedi manifest.json).
 */
const onCommand = async function (command) {
  if (command !== "activate-picker")
    return;
  //
  // Lo shortcut è spento di default: rispetto il toggle delle impostazioni.
  const settings = await loadSettings();
  if (!settings.shortcutEnabled)
    return;
  //
  const tab = await getActiveTab();
  if (tab)
    await activatePicker(tab);
}
//
/**
 * Handler dei messaggi dal popup.
 * @param {*} message - Messaggio ricevuto.
 * @returns {Promise<{ok: boolean}>}
 */
const onMessage = async function (message) {
  if (!message || message.action !== "activate-picker")
    return { ok: false };
  //
  const tab = await getActiveTab();
  if (!tab)
    return { ok: false };
  //
  const ok = await activatePicker(tab);
  return { ok };
}
//
/**
 * Ritorna il tab attivo nella finestra corrente.
 * @returns {Promise<*>}
 */
const getActiveTab = async function () {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0] || null;
}
//
/**
 * Inietta il picker nel tab indicato, se la pagina lo consente.
 * @param {*} tab - Tab su cui iniettare content.js.
 * @returns {Promise<boolean>} True se l'iniezione è riuscita.
 */
const activatePicker = async function (tab) {
  if (!tab.id || isRestrictedUrl(tab.url)) {
    console.warn("Copy DOM: cannot inject the picker on this page.");
    return false;
  }
  //
  try {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
    return true;
  }
  catch (ex) {
    console.warn(`Copy DOM: injection failed: ${ex}`);
    return false;
  }
}
//
/**
 * Verifica se un URL è tra quelli su cui non possiamo iniettare.
 * @param {string} url - URL del tab.
 * @returns {boolean}
 */
const isRestrictedUrl = function (url) {
  if (!url)
    return true;
  //
  return RESTRICTED_PREFIXES.some((prefix) => { return url.startsWith(prefix); });
}
//
startListeners();
