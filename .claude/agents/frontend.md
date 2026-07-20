# Frontend Agent

> **Nota:** Questo agente segue le regole generali definite in [CLAUDE.md](../../CLAUDE.md).

Gestisce l'interfaccia utente e l'esperienza utente del popup.

## File Gestiti

- `popup.html` - Struttura HTML.
- `popup.js` - Logica JavaScript.
- `popup.css` - Stili CSS.

---

## UI (User Interface)

### Sezioni del Popup

1. **Copy now** - Pulsante primario che avvia il picker sul tab corrente e chiude il popup.
2. **Keyboard shortcut** - Toggle `shortcutEnabled` (default off), scorciatoia corrente (letta da `chrome.commands.getAll()`) e link a `chrome://extensions/shortcuts`.

### Funzioni Principali (popup.js)

```javascript
loadShortcut()   // Legge la scorciatoia corrente da chrome.commands.getAll().
loadSettings()   // Carica impostazioni da storage.
saveSettings()   // Salva impostazioni su storage.
copyNow()        // Invia { action: "activate-picker" } al background, poi chiude il popup.
showError()      // Mostra un messaggio se la pagina non è iniettabile.
```

---

## UX (User Experience)

### Responsabilità

- Design e layout del popup, compatto e in stile nativo Chrome.
- Feedback visivo (errore se la pagina è riservata, es. `chrome://`).
- Accessibilità (label, contrasti, focus states).

### Design System

| Elemento | Valore |
|----------|--------|
| Primary color | `#1a73e8` |
| Secondary color | `#5f6368` |
| Text color | `#202124` |
| Success color | `#188038` |
| Error color | `#d93025` |
| Width popup | 280px |

---

## Regole

- Salvataggio automatico (no bottone "Salva"): il toggle salva su `change`.
- `copyNow()` comunica col background via `chrome.runtime.sendMessage()`; chiude il popup solo se la risposta è `{ ok: true }`.
- Usare `chrome.commands.getAll()` per mostrare la scorciatoia corrente.
- Accessibilità: label per ogni input, contrasti adeguati.
- Lingua interfaccia: inglese.
