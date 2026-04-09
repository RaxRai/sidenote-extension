const STORAGE_KEY = "notes";

const editor = document.getElementById("editor");
const btnBold = document.getElementById("btn-bold");
const btnItalic = document.getElementById("btn-italic");
const btnUnderline = document.getElementById("btn-underline");
const btnList = document.getElementById("btn-list");
const btnExportMd = document.getElementById("btn-export-md");
const btnExportTxt = document.getElementById("btn-export-txt");

let saveTimer = null;

document.execCommand("styleWithCSS", false, true);

function setEditorContent(raw) {
  if (!raw) {
    editor.innerHTML = "";
    return;
  }
  if (raw.includes("<")) {
    editor.innerHTML = raw;
  } else {
    editor.textContent = raw;
  }
}

function loadNotes() {
  chrome.storage.local.get({ [STORAGE_KEY]: "" }, (result) => {
    setEditorContent(result[STORAGE_KEY] ?? "");
    updateToolbar();
  });
}

function saveNotes(html) {
  chrome.storage.local.set({ [STORAGE_KEY]: html });
}

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveNotes(editor.innerHTML), 250);
}

function selectionIsInsideEditor() {
  const sel = document.getSelection();
  if (!sel?.anchorNode) return false;
  return editor.contains(sel.anchorNode);
}

function updateToolbar() {
  if (!document.body.contains(editor)) return;

  if (document.activeElement !== editor && !selectionIsInsideEditor()) {
    for (const b of [btnBold, btnItalic, btnUnderline, btnList]) {
      b.classList.remove("is-active");
      b.setAttribute("aria-pressed", "false");
    }
    return;
  }

  try {
    const bold = document.queryCommandState("bold");
    const italic = document.queryCommandState("italic");
    const underline = document.queryCommandState("underline");
    const list = document.queryCommandState("insertUnorderedList");

    btnBold.classList.toggle("is-active", bold);
    btnBold.setAttribute("aria-pressed", String(bold));

    btnItalic.classList.toggle("is-active", italic);
    btnItalic.setAttribute("aria-pressed", String(italic));

    btnUnderline.classList.toggle("is-active", underline);
    btnUnderline.setAttribute("aria-pressed", String(underline));

    btnList.classList.toggle("is-active", list);
    btnList.setAttribute("aria-pressed", String(list));
  } catch {
    /* queryCommandState can throw in odd cases */
  }
}

function run(command, value = null) {
  editor.focus();
  document.execCommand(command, false, value);
  scheduleSave();
  requestAnimationFrame(updateToolbar);
}

function hookToolbarButton(id, command, value) {
  const el = document.getElementById(id);
  el.addEventListener("mousedown", (e) => e.preventDefault());
  el.addEventListener("click", () => run(command, value));
}

hookToolbarButton("btn-bold", "bold");
hookToolbarButton("btn-italic", "italic");
hookToolbarButton("btn-underline", "underline");
hookToolbarButton("btn-list", "insertUnorderedList");

function datedExportName(ext) {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `sidenote-${y}-${m}-${day}.${ext}`;
}

function downloadBlob(text, mime, ext) {
  const blob = new Blob([text], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = datedExportName(ext);
  a.click();
  URL.revokeObjectURL(a.href);
}

btnExportMd.addEventListener("mousedown", (e) => e.preventDefault());
btnExportMd.addEventListener("click", () => {
  downloadBlob(htmlToMarkdown(editor.innerHTML), "text/markdown;charset=utf-8", "md");
});

btnExportTxt.addEventListener("mousedown", (e) => e.preventDefault());
btnExportTxt.addEventListener("click", () => {
  const plain = editor.innerText.replace(/\n+$/, "") + "\n";
  downloadBlob(plain, "text/plain;charset=utf-8", "txt");
});

function escapeMdText(s) {
  return s.replace(/\\/g, "\\\\").replace(/\*/g, "\\*").replace(/`/g, "\\`");
}

function htmlToMarkdown(html) {
  const root = document.createElement("div");
  root.innerHTML = html.trim() ? html : "";
  return walk(root).replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

function walk(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeMdText(node.textContent);
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const tag = node.tagName.toLowerCase();
  const inner = [...node.childNodes].map(walk).join("");

  switch (tag) {
    case "strong":
    case "b":
      return `**${inner}**`;
    case "em":
    case "i":
      return `*${inner}*`;
    case "u":
      return `<u>${inner}</u>`;
    case "br":
      return "\n";
    case "div":
    case "p":
      return inner + "\n\n";
    case "ul":
      return (
        [...node.children]
          .map((li) => {
            if (li.tagName.toLowerCase() !== "li") return walk(li);
            const body = walk(li).replace(/\n+$/g, "");
            return `- ${body}\n`;
          })
          .join("") + "\n"
      );
    case "ol":
      return (
        [...node.children]
          .map((li, i) => {
            if (li.tagName.toLowerCase() !== "li") return walk(li);
            const body = walk(li).replace(/\n+$/g, "");
            return `${i + 1}. ${body}\n`;
          })
          .join("") + "\n"
      );
    case "li":
      return inner;
    case "span":
    case "font":
      return inner;
    default:
      return inner;
  }
}

document.addEventListener("selectionchange", () => {
  if (document.activeElement === editor || selectionIsInsideEditor()) {
    updateToolbar();
  }
});

// The "line" we're editing: a div under #editor, or the <li> we're in.
function lineForCaret(range) {
  let el = range.startContainer;
  if (el.nodeType === Node.TEXT_NODE) el = el.parentElement;
  if (!el) return null;

  while (el && el !== editor) {
    if (el.tagName.toLowerCase() === "li") return el;
    if (el.parentElement === editor) return el;
    el = el.parentElement;
  }
  return null;
}

// Text from start of that line up to the caret. Skips the dash shortcut if we're already in a list.
function textOnLineBeforeCaret(range) {
  const line = lineForCaret(range);
  if (!line || !editor.contains(line)) return null;
  if (line.closest("ul")) return null;

  const slice = range.cloneRange();
  slice.setStart(line, 0);
  slice.setEnd(range.startContainer, range.startOffset);
  return slice.toString();
}

// Empty line after deleting "-" can collapse into the line above; a <br> keeps it separate.
function normalizeEmptyLine(line) {
  if (!line.isConnected) return false;
  if (line.textContent !== "") return true;
  while (line.firstChild) line.removeChild(line.firstChild);
  line.appendChild(document.createElement("br"));
  return true;
}

function moveCaretToStartOf(line) {
  const sel = window.getSelection();
  const r = document.createRange();
  if (line.childNodes.length === 0) {
    line.appendChild(document.createElement("br"));
  }
  r.setStart(line, 0);
  r.collapse(true);
  sel.removeAllRanges();
  sel.addRange(r);
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, "&quot;");
}

function clipboardUrl(raw) {
  const t = raw.trim();
  if (!t || /[\r\n]/.test(t)) return null;
  let u;
  try {
    u = new URL(t);
  } catch {
    return null;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return null;
  return u;
}

// "-"+space or "-"+tab at line start → bullet list (shift-tab still just inserts spaces)
function dashThenSpaceOrTab(e) {
  if (e.isComposing) return false;
  if (e.key !== " " && e.key !== "Tab") return false;
  if (e.key === "Tab" && e.shiftKey) return false;

  const sel = window.getSelection();
  if (!sel.rangeCount || !sel.isCollapsed) return false;

  const range = sel.getRangeAt(0);
  if (!editor.contains(range.startContainer)) return false;

  const line = lineForCaret(range);
  if (!line || !editor.contains(line)) return false;

  const before = textOnLineBeforeCaret(range);
  if (before == null || before.trim() !== "-") return false;

  if (range.startContainer.nodeType !== Node.TEXT_NODE) return false;
  const end = range.startOffset;
  if (end < 1) return false;
  const start = end - 1;
  if (range.startContainer.textContent[start] !== "-") return false;

  e.preventDefault();

  const killDash = range.cloneRange();
  killDash.setStart(range.startContainer, start);
  killDash.setEnd(range.startContainer, end);
  killDash.deleteContents();

  if (!normalizeEmptyLine(line)) return true;

  editor.focus();
  moveCaretToStartOf(line);
  document.execCommand("insertUnorderedList", false);
  scheduleSave();
  requestAnimationFrame(updateToolbar);
  return true;
}

editor.addEventListener("input", scheduleSave);

editor.addEventListener("paste", (e) => {
  const data = e.clipboardData;
  const raw = data?.getData("text/uri-list") || data?.getData("text/plain") || "";
  const url = clipboardUrl(raw);
  if (!url) return;

  e.preventDefault();
  editor.focus();

  const host = url.hostname.replace(/^www\./i, "");
  const href = url.toString();
  const chip = `<a class="link-chip" href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer">🔗 ${escapeHtml(host)}</a>`;
  document.execCommand("insertHTML", false, chip);
  scheduleSave();
});

editor.addEventListener("click", (e) => {
  const link = e.target.closest?.("a");
  if (!link || !editor.contains(link)) return;
  e.preventDefault();
  window.open(link.href, "_blank", "noopener,noreferrer");
});

editor.addEventListener("focus", updateToolbar);
editor.addEventListener("blur", () => {
  requestAnimationFrame(updateToolbar);
});

editor.addEventListener("keydown", (e) => {
  if (dashThenSpaceOrTab(e)) return;

  if (e.key === "Tab") {
    e.preventDefault();
    editor.focus();
    document.execCommand("insertText", false, "  ");
    scheduleSave();
    requestAnimationFrame(updateToolbar);
  }
});

loadNotes();
