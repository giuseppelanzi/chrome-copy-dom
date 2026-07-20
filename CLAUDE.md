# AGENTS.md

Linee guida per gli agenti (Codex CLI, Claude Code, ecc.) che lavorano su questo repository.

## Come devono operare gli agenti

- Usare `apply_patch`; evitare `git commit`/branch salvo richiesta esplicita.
- Ricerca: preferire `rg` per cercare file/testo; leggere file in blocchi ≤ 250 righe.
- Pianificazione: usare `update_plan` per task multi‑step; mantenere una sola fase `in_progress`.
- Portata: modifiche minimali e focalizzate; rispettare lo stile esistente; non rinominare file senza motivo.
- Sicurezza: niente rete/installer/comandi distruttivi senza approvazione; non aprire GUI.
- Comunicazione: messaggi concisi prima dei comandi, in italiano; aggiornamenti brevi sul progresso.
- Comunicazione: le modifiche sempre proposte in formato diff.
- Validazione: se possibile, usare script/comandi del repo per verificare build/test, senza introdurre tool esterni.

### Note specifiche per agenti

- Codex CLI: attenersi alle regole su `apply_patch`, `rg`, `update_plan` e pre‑preambolo prima dei comandi.
- Claude Code: seguire questo documento come fonte canonica; stessi vincoli di modifica, ricerca e comunicazione.

## Formattazione codice

- All'interno di un metodo non mettere mai righe vuote, usare la riga `//` per separare le parti di codice.
- I commenti devono finire sempre con un punto.
- Preferisci `"` al posto di `'` per le stringhe.
- Usa indentazione con 2 spazi e non tab.
- Il codice e i commenti sono in italiano/inglese come nell'esistente; l'interfaccia utente (popup, toast) è in inglese.

---

## Cos'è questa estensione

Easy Copy DOM è un'estensione Chrome (Manifest V3) che permette di copiare rapidamente l'HTML di un elemento della pagina. Si attiva in due modi:

1. **Icona nella toolbar** → apre un popup con la configurazione e un pulsante "Copy now".
2. **Scorciatoia da tastiera** (default `Alt+Shift+C`, **spenta di default**, si attiva con un toggle nel popup).

Una volta attivo il picker: muovendo il mouse gli elementi si evidenziano; al click l'`outerHTML` dell'elemento viene copiato negli appunti con conferma visiva; `Esc` annulla.

---

## Orchestratore di Sub-Agenti

Questo progetto utilizza un sistema di agenti specializzati con architettura gerarchica.

### Architettura

```
                    ┌─────────────────┐
                    │  ORCHESTRATOR   │
                    │   (Coordina)    │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│    BACKEND    │   │   FRONTEND    │   │    STORAGE    │
│ (Background + │   │  (UI + UX)    │   │  (storage.js) │
│  Manifest +   │   │   (Popup)     │   │               │
│  Picker)      │   │               │   │               │
└───────────────┘   └───────────────┘   └───────────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
           ┌───────────────┐ ┌───────────────┐
           │    TESTER     │ │   REVIEWER    │
           │   (Testing)   │ │ (Code Review) │
           └───────────────┘ └───────────────┘
```

### Flusso di lavoro

Vedi dettagli e esempi in [orchestrator.md](.claude/agents/orchestrator.md).

---

## Agenti Disponibili

Istruzioni dettagliate per ogni agente in `.claude/agents/`:

| Agente | File | Responsabilità |
|--------|------|----------------|
| Orchestrator | [orchestrator.md](.claude/agents/orchestrator.md) | Coordina tutti gli agenti |
| Backend | [backend.md](.claude/agents/backend.md) | `background.js`, `manifest.json`, `content.js` (picker) |
| Frontend | [frontend.md](.claude/agents/frontend.md) | `popup.html`, `popup.js`, `popup.css` |
| Storage | [storage.md](.claude/agents/storage.md) | `storage.js` |
| Tester | [tester.md](.claude/agents/tester.md) | Test manuali e checklist |
| Reviewer | [reviewer.md](.claude/agents/reviewer.md) | Code review e stile |

---

## Struttura del Progetto

```
chrome-copy-dom/
├── manifest.json      # Configurazione estensione.
├── background.js      # Service worker (comando + iniezione picker).
├── content.js         # Picker iniettato: evidenziazione e copia HTML.
├── storage.js         # Persistenza dati.
├── popup.html         # UI popup.
├── popup.js           # Logica popup.
├── popup.css          # Stili popup.
├── icons/             # Icone estensione.
├── build-zip.js       # Packaging per il Chrome Web Store.
├── .claude/agents/    # Istruzioni agenti specializzati.
└── AGENTS.md          # Questo file.
```

---

## Verifica Finale

Vedi checklist completa in [tester.md](.claude/agents/tester.md).
