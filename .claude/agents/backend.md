# Backend Agent

> **Nota:** Questo agente segue le regole generali definite in [CLAUDE.md](../../CLAUDE.md).

Gestisce il service worker, la configurazione dell'estensione e il picker iniettato.

## File Gestiti

- `background.js` - Service worker (comando + iniezione picker).
- `content.js` - Picker iniettato nella pagina.
- `manifest.json` - Configurazione estensione.

---

## Background (background.js)

### Responsabilità

- Service worker e lifecycle (MV3, modulo ES).
- Gestione listeners (`onCommand`, `onMessage`).
- Iniezione del picker nel tab attivo via `chrome.scripting.executeScript`.
- Rispetto del toggle `shortcutEnabled` prima di reagire allo shortcut.

### Funzioni Principali

```javascript
startListeners()   // Registra i listener del service worker.
onCommand()        // Handler comando da tastiera (gated da shortcutEnabled).
onMessage()        // Handler messaggi dal popup ({ action: "activate-picker" }).
getActiveTab()     // Ritorna il tab attivo nella finestra corrente.
activatePicker()   // Inietta content.js se la pagina lo consente.
isRestrictedUrl()  // Filtra pagine chrome://, web store, ecc.
```

### Regole

- Non modificare direttamente lo storage, usare le funzioni di `storage.js`.
- Mantenere il pattern async/await esistente.
- Lo shortcut è **spento di default**: `onCommand` deve uscire se `shortcutEnabled` è falso.
- Non iniettare su URL riservati (`chrome://`, `chrome-extension://`, web store, ecc.).
- Il service worker può essere terminato da Chrome: leggere sempre le settings da storage.

---

## Picker (content.js)

### Responsabilità

- Evidenziare l'elemento sotto il cursore (overlay in Shadow DOM).
- Copiare l'`outerHTML` dell'elemento al click, con conferma visiva (toast).
- Annullare con `Esc` o con un secondo avvio del picker.

### Punti Chiave

- Isolare gli stili con un host in **Shadow DOM** (`z-index` massimo, `pointer-events: none`).
- Guard anti doppio avvio tramite `window.__copyDomPicker`.
- Listener in fase di **cattura** per anticipare gli handler della pagina; su click fare `preventDefault` + `stopImmediatePropagation`.
- Copia con `navigator.clipboard.writeText` e **fallback** a `textarea` + `document.execCommand("copy")` per contesti non sicuri (http).
- `teardown()` deve rimuovere tutti i listener, l'host e il cursore `crosshair`.

---

## Manifest (manifest.json)

### Responsabilità

- Configurazione estensione (nome, versione, descrizione).
- Permessi (`storage`, `activeTab`, `scripting`).
- Definizione del comando `activate-picker` e shortcut di default.
- Configurazione popup (`action.default_popup`).

### Struttura Attuale

```json
{
  "manifest_version": 3,
  "name": "Copy DOM",
  "version": "1.0.0",
  "permissions": ["storage", "activeTab", "scripting"],
  "action": { "default_popup": "popup.html" },
  "background": { "service_worker": "background.js", "type": "module" },
  "commands": {
    "activate-picker": { "suggested_key": { "default": "Alt+Shift+C" }, "description": "..." }
  }
}
```

### Regole

- Manifest V3 obbligatorio.
- Permessi minimi: `activeTab` + `scripting` (no `host_permissions`, no content script dichiarato).
- Lo shortcut deve funzionare su Windows e Mac (`Alt` è un modificatore valido su entrambi).
