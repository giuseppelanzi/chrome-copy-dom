(function () {
  "use strict";
  //
  // Se il picker è già attivo, un secondo avvio lo annulla (toggle).
  if (window.__copyDomPicker) {
    window.__copyDomPicker.teardown();
    return;
  }
  //
  const HIGHLIGHT_BORDER = "#1a73e8";
  const HIGHLIGHT_FILL = "rgba(26, 115, 232, 0.2)";
  const SUCCESS_BORDER = "#188038";
  const SUCCESS_FILL = "rgba(24, 128, 56, 0.2)";
  let currentElement = null;
  //
  // Host in Shadow DOM per isolare completamente gli stili dalla pagina.
  const host = document.createElement("div");
  host.style.cssText = "all: initial; position: fixed; inset: 0; pointer-events: none; z-index: 2147483647;";
  const shadow = host.attachShadow({ mode: "open" });
  document.documentElement.appendChild(host);
  //
  // Markup interno dell'overlay: box di evidenziazione, etichetta e toast.
  shadow.innerHTML = `
    <style>
      .box {
        position: fixed;
        pointer-events: none;
        border: 2px solid ${HIGHLIGHT_BORDER};
        background: ${HIGHLIGHT_FILL};
        box-sizing: border-box;
        border-radius: 2px;
        display: none;
      }
      .label {
        position: fixed;
        pointer-events: none;
        font: 12px/1.4 "Segoe UI", Roboto, system-ui, sans-serif;
        color: #fff;
        background: #1a73e8;
        padding: 2px 6px;
        border-radius: 3px;
        white-space: nowrap;
        display: none;
      }
      .toast {
        position: fixed;
        left: 50%;
        bottom: 28px;
        transform: translateX(-50%);
        font: 13px/1.4 "Segoe UI", Roboto, system-ui, sans-serif;
        color: #fff;
        background: #188038;
        padding: 10px 16px;
        border-radius: 6px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        display: none;
      }
    </style>
    <div class="box"></div>
    <div class="label"></div>
    <div class="toast"></div>
  `;
  //
  const box = shadow.querySelector(".box");
  const label = shadow.querySelector(".label");
  const toast = shadow.querySelector(".toast");
  //
  // Cursore a mirino sull'intera pagina.
  const previousCursor = document.documentElement.style.cursor;
  document.documentElement.style.cursor = "crosshair";
  //
  /**
   * Posiziona box ed etichetta sopra l'elemento indicato.
   * @param {Element} el
   */
  const positionHighlight = function (el) {
    const rect = el.getBoundingClientRect();
    box.style.display = "block";
    box.style.left = `${rect.left}px`;
    box.style.top = `${rect.top}px`;
    box.style.width = `${rect.width}px`;
    box.style.height = `${rect.height}px`;
    //
    // Etichetta con tag, eventuale id e dimensioni.
    const tag = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : "";
    label.textContent = `${tag}${id} · ${Math.round(rect.width)}×${Math.round(rect.height)}`;
    label.style.display = "block";
    //
    // Metto l'etichetta sopra l'elemento, o appena sotto il bordo se manca spazio.
    const top = rect.top - 22 < 0 ? rect.top + 4 : rect.top - 22;
    label.style.left = `${Math.max(0, rect.left)}px`;
    label.style.top = `${top}px`;
  }
  //
  /**
   * Aggiorna l'elemento evidenziato al muoversi del mouse.
   * @param {MouseEvent} e
   */
  const onMouseMove = function (e) {
    const el = e.target;
    if (!el || el.nodeType !== 1 || el === host)
      return;
    //
    currentElement = el;
    positionHighlight(el);
  }
  //
  /**
   * Copia l'HTML dell'elemento evidenziato al click.
   * @param {MouseEvent} e
   */
  const onClick = function (e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    //
    const el = currentElement || (e.target && e.target.nodeType === 1 ? e.target : null);
    if (!el)
      return;
    //
    copyElement(el);
  }
  //
  /**
   * Annulla il picker premendo Esc.
   * @param {KeyboardEvent} e
   */
  const onKeyDown = function (e) {
    if (e.key !== "Escape")
      return;
    //
    e.preventDefault();
    e.stopPropagation();
    teardown();
  }
  //
  /**
   * Riposiziona l'evidenziazione durante lo scroll.
   */
  const onScroll = function () {
    if (currentElement)
      positionHighlight(currentElement);
  }
  //
  /**
   * Copia l'outerHTML dell'elemento e mostra il feedback.
   * @param {Element} el
   */
  const copyElement = async function (el) {
    const html = el.outerHTML || "";
    const ok = await copyText(html);
    //
    // Congelo l'interazione: il box resta fermo sull'elemento copiato.
    removeInteractionListeners();
    if (ok) {
      const tag = el.tagName.toLowerCase();
      box.style.borderColor = SUCCESS_BORDER;
      box.style.background = SUCCESS_FILL;
      label.style.display = "none";
      showToast(`Copied ${tag} · ${html.length} chars`, true);
    }
    else
      showToast("Copy failed", false);
    //
    setTimeout(teardown, ok ? 750 : 1400);
  }
  //
  /**
   * Copia del testo negli appunti, con fallback per contesti non sicuri.
   * @param {string} text
   * @returns {Promise<boolean>}
   */
  const copyText = async function (text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    }
    catch (ex) {
      return copyTextFallback(text);
    }
  }
  //
  /**
   * Fallback di copia tramite textarea temporanea ed execCommand.
   * @param {string} text
   * @returns {boolean}
   */
  const copyTextFallback = function (text) {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.cssText = "position: fixed; top: -9999px; left: -9999px; opacity: 0;";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    }
    catch (ex) {
      return false;
    }
  }
  //
  /**
   * Mostra un toast di conferma o errore.
   * @param {string} text
   * @param {boolean} success
   */
  const showToast = function (text, success) {
    toast.textContent = text;
    toast.style.background = success ? "#188038" : "#d93025";
    toast.style.display = "block";
  }
  //
  /**
   * Rimuove i listener di interazione e ripristina il cursore.
   */
  const removeInteractionListeners = function () {
    document.removeEventListener("mousemove", onMouseMove, true);
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("keydown", onKeyDown, true);
    window.removeEventListener("scroll", onScroll, true);
    document.documentElement.style.cursor = previousCursor;
  }
  //
  /**
   * Smonta completamente il picker.
   */
  const teardown = function () {
    removeInteractionListeners();
    if (host.parentNode)
      host.parentNode.removeChild(host);
    if (window.__copyDomPicker)
      delete window.__copyDomPicker;
  }
  //
  // Attivo i listener in fase di cattura per anticipare gli handler della pagina.
  document.addEventListener("mousemove", onMouseMove, true);
  document.addEventListener("click", onClick, true);
  document.addEventListener("keydown", onKeyDown, true);
  window.addEventListener("scroll", onScroll, true);
  //
  // Espongo l'istanza per il guard anti doppio avvio.
  window.__copyDomPicker = { teardown };
})();
