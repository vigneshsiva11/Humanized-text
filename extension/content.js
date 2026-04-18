chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type !== "REPLACE_SELECTED") {
    return;
  }

  const replacement = msg.text || "";
  if (!replacement) {
    sendResponse({ ok: false, reason: "No replacement text provided." });
    return;
  }

  const activeEl = document.activeElement;

  // Handle input and textarea selections.
  if (
    activeEl &&
    (activeEl.tagName === "TEXTAREA" ||
      (activeEl.tagName === "INPUT" &&
        ["text", "search", "email", "url", "tel"].includes(activeEl.type)))
  ) {
    const start = activeEl.selectionStart;
    const end = activeEl.selectionEnd;

    if (typeof start === "number" && typeof end === "number" && start !== end) {
      const before = activeEl.value.slice(0, start);
      const after = activeEl.value.slice(end);
      activeEl.value = `${before}${replacement}${after}`;
      const caret = start + replacement.length;
      activeEl.selectionStart = caret;
      activeEl.selectionEnd = caret;
      activeEl.dispatchEvent(new Event("input", { bubbles: true }));
      sendResponse({ ok: true });
      return;
    }
  }

  // Handle DOM/contenteditable text selections.
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(replacement));
    sel.removeAllRanges();
    sendResponse({ ok: true });
    return;
  }

  sendResponse({ ok: false, reason: "No selected text found on the page." });
});
