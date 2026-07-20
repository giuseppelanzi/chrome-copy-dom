# Storage Agent

> **Nota:** Questo agente segue le regole generali definite in [CLAUDE.md](../../CLAUDE.md).

Gestisce la persistenza dei dati.

## File Gestiti

- `storage.js`

---

## Responsabilità

- Interfaccia con `chrome.storage.local`.
- Funzioni CRUD per i dati persistenti.
- Gestione delle impostazioni utente.

---

## API Disponibili

### Funzioni

```javascript
// Salva un valore con chiave.
saveToDB(key, value)

// Carica un valore per chiave.
loadFromDB(key)

// Salva oggetto impostazioni.
saveSettings(settings)

// Carica impostazioni (con default se assenti).
loadSettings()

// Ritorna impostazioni di default.
getDefaultSettings()
```

### Struttura Dati Settings

```javascript
{
  shortcutEnabled: false   // Abilita la scorciatoia da tastiera (default: false).
}
```

---

## Pattern di Utilizzo

### Da Background (modulo ES)

```javascript
import { loadSettings } from "./storage.js";

// Leggo le settings prima di reagire allo shortcut.
const settings = await loadSettings();
if (!settings.shortcutEnabled)
  return;
```

### Da Popup (script classico, niente import)

```javascript
// Carica settings.
const result = await chrome.storage.local.get(["settings"]);
const settings = result.settings || { shortcutEnabled: false };

// Salva settings.
await chrome.storage.local.set({ settings });
```

---

## Regole

- Usare sempre `chrome.storage.local` (non `sync`).
- Validare i dati prima di salvare.
- Fornire valori di default per ogni campo.
- Non salvare dati sensibili.
