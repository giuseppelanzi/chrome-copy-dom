// Costanti.
const SETTINGS_KEY = "settings";
const DEFAULT_SETTINGS = {
  shortcutEnabled: false
};
//
async function saveToDB(key, value) {
  return chrome.storage.local.set({ [key]: value });
}
//
async function loadFromDB(key) {
  return new Promise(resolve => {
    chrome.storage.local.get([key], result => {
      resolve(result[key]);
    });
  });
}
//
function getDefaultSettings() {
  return { ...DEFAULT_SETTINGS };
}
//
async function saveSettings(settings) {
  return chrome.storage.local.set({ [SETTINGS_KEY]: settings });
}
//
async function loadSettings() {
  return new Promise(resolve => {
    chrome.storage.local.get([SETTINGS_KEY], result => {
      resolve(result[SETTINGS_KEY] || getDefaultSettings());
    });
  });
}
//
export { saveToDB, loadFromDB, saveSettings, loadSettings, getDefaultSettings };
