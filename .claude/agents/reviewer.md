# Reviewer Agent

> **Nota:** Questo agente segue le regole generali definite in [CLAUDE.md](../../CLAUDE.md).

Verifica la qualità del codice prodotto dagli altri agenti.

## Responsabilità

- Verificare aderenza allo stile di codice.
- Controllare sicurezza (no injection, validazione input).
- Verificare compatibilità cross-browser.
- Suggerire refactoring quando necessario.

---

## Checklist Review

### Stile Codice

Vedi regole di formattazione in [CLAUDE.md](../../CLAUDE.md#formattazione-codice).

- [ ] Funzioni async dove appropriato.

### Qualità

- [ ] Error handling presente (try/catch), specialmente su clipboard e iniezione.
- [ ] Nessun `console.log` in produzione (solo `console.warn`/`error`).
- [ ] Variabili con nomi significativi.
- [ ] Funzioni piccole e focalizzate.
- [ ] No codice duplicato.

### Sicurezza

- [ ] No injection vulnerabilities.
- [ ] Il picker isola i propri stili (Shadow DOM) e non altera il DOM della pagina.
- [ ] `teardown()` pulisce sempre listener, host e cursore.
- [ ] Permessi minimi nel manifest (`activeTab` + `scripting`, no `host_permissions`).

### Compatibilità

- [ ] Manifest V3 compliant.
- [ ] Chrome 88+ compatibile.
- [ ] Shortcut funziona su Windows e Mac.
- [ ] Copia funzionante sia in contesti sicuri (clipboard API) sia http (fallback).

---

## Pattern da Verificare

### Corretto

```javascript
// Separatore tra blocchi logici.
const copyText = async function (text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  }
  catch (ex) {
    return copyTextFallback(text);
  }
}
```

### Errato

```javascript
// NO: righe vuote dentro metodo.
const copyText = async function (text) {
  try {
    await navigator.clipboard.writeText(text); // NO: apici singoli e nessun fallback.

    return true;
  } catch (ex) {
    console.log("fail"); // NO: console.log, no punto nel commento.
    return false;
  }
}
```

---

## Quando Suggerire Refactoring

- Funzione > 50 righe.
- Nesting > 3 livelli.
- Codice duplicato in 2+ punti.
- Nomi poco chiari.
- Mancanza di error handling.
