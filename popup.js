// Elementi DOM.
const copyNowBtn = document.getElementById("copy-now");
const shortcutToggle = document.getElementById("shortcut-enabled");
const shortcutKey = document.getElementById("shortcut-key");
const changeShortcutBtn = document.getElementById("change-shortcut");
const errorBox = document.getElementById("error");
//
// Carica lo shortcut corrente da Chrome.
async function loadShortcut() {
  const commands = await chrome.commands.getAll();
  const picker = commands.find(cmd => cmd.name === "activate-picker");
  shortcutKey.textContent = picker && picker.shortcut ? picker.shortcut : "Not set";
}
//
// Carica impostazioni.
async function loadSettings() {
  const result = await chrome.storage.local.get(["settings"]);
  const settings = result.settings || { shortcutEnabled: false };
  shortcutToggle.checked = !!settings.shortcutEnabled;
}
//
// Salva impostazioni.
async function saveSettings() {
  const settings = { shortcutEnabled: shortcutToggle.checked };
  await chrome.storage.local.set({ settings });
}
//
// Mostra un messaggio di errore nel popup.
function showError(text) {
  errorBox.textContent = text;
  errorBox.hidden = false;
}
//
// Attiva il picker sul tab corrente tramite il background, poi chiude il popup.
async function copyNow() {
  errorBox.hidden = true;
  const response = await chrome.runtime.sendMessage({ action: "activate-picker" });
  if (response && response.ok) {
    window.close();
    return;
  }
  //
  showError("Can't start the picker on this page. Try a normal web page.");
}
//
// Event listeners.
copyNowBtn.addEventListener("click", copyNow);
//
changeShortcutBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
});
//
shortcutToggle.addEventListener("change", saveSettings);
//
// Init.
loadShortcut();
loadSettings();
