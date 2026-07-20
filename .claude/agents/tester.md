# Tester Agent

> **Nota:** Questo agente segue le regole generali definite in [CLAUDE.md](../../CLAUDE.md).

Verifica il funzionamento del codice prodotto dagli altri agenti.

## Responsabilità

- Definire strategie di test.
- Creare checklist per test manuali.
- Implementare unit test dove utile.

---

## Checklist Test Manuale

### Funzionalità Core

- [ ] "Copy now" nel popup avvia il picker sul tab corrente e chiude il popup.
- [ ] Muovendo il mouse gli elementi si evidenziano con etichetta (tag + dimensioni).
- [ ] Al click viene copiato l'`outerHTML` dell'elemento evidenziato.
- [ ] Compare il toast di conferma ("Copied ...").
- [ ] `Esc` annulla il picker senza copiare.
- [ ] Incollando altrove si ottiene esattamente l'`outerHTML` dell'elemento scelto.

### Popup

- [ ] Popup si apre correttamente cliccando sull'icona.
- [ ] La scorciatoia corrente viene mostrata (o "Not set").
- [ ] Link "Change shortcut" apre `chrome://extensions/shortcuts`.
- [ ] Toggle "Enable keyboard shortcut" viene salvato automaticamente e persiste.

### Scorciatoia

- [ ] Con toggle **off**, premere `Alt+Shift+C` non fa nulla.
- [ ] Con toggle **on**, `Alt+Shift+C` avvia il picker.
- [ ] Premere di nuovo la scorciatoia mentre il picker è attivo lo annulla.

---

## Scenari Edge Case

- [ ] Link e bottoni non navigano/inviano al click del picker.
- [ ] Pagina http (contesto non sicuro): la copia funziona (fallback `execCommand`).
- [ ] Pagine riservate (`chrome://`, Chrome Web Store): errore gestito, nessun crash.
- [ ] Ricaricando la pagina e riattivando il picker non si creano listener duplicati.
- [ ] Scroll durante il picker: l'evidenziazione segue l'elemento.
- [ ] Elemento molto grande o molto piccolo: box ed etichetta restano leggibili.

---

## Come Testare

### Setup

1. Caricare estensione: `chrome://extensions` → Developer mode → Load unpacked (cartella root del progetto).
2. Aprire la console del service worker: click su "service worker" nella pagina estensione.

### Test Picker (popup)

1. Aprire una normale pagina web.
2. Cliccare l'icona → "Copy now".
3. Muovere il mouse, verificare l'evidenziazione.
4. Cliccare un elemento, verificare toast e contenuto incollato.

### Test Scorciatoia

1. Aprire il popup, abilitare il toggle.
2. Su una pagina web premere `Alt+Shift+C`.
3. Verificare l'avvio del picker; premere di nuovo per annullare.

### Test Persistenza Settings

1. Abilitare il toggle, chiudere il popup.
2. Riaprire il popup: il toggle deve essere ancora attivo.
