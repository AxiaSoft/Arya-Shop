// ═══════════════════════════════════════════════════════════════
// ADMIN PRODUCTS - ULTIMATE EDITOR v10.3
// ویژگی‌ها: Fixed Delete Button (با الهام از admin panel.js)
// ═══════════════════════════════════════════════════════════════

// ========== CONSTANTS & CONFIG ==========
const AUTO_SAVE_DELAY = 300000; // 5 دقیقه
const MAX_HISTORY = 50;

// ========== GLOBAL EDITOR STATE ==========
window.__articleEditor = window.__articleEditor || {
  history: [],
  historyIndex: -1,
  autoSaveTimer: null,
  lastSavedContent: '',
  isDirty: false,
  selectedImage: null,
  previewMode: false,
  activeTool: null,
  seo: {
    title: '',
    description: '',
    keywords: '',
    slug: '',
    canonical: '',
    robots: 'index,follow',
    og_title: '',
    og_description: '',
    og_slug: '',
    twitter_title: '',
    twitter_description: '',
    redirect_old_url: '',
    schema_json: ''
  }
};

// ========== UTILITIES ==========
function safeNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str).replace(/[&<>"']/g, (s) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[s]));
}

function escapeJs(str) {
  return (str || '').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

// ========== HISTORY MANAGEMENT ==========
function saveToHistory(editor) {
  if (!editor) return;

  const content = editor.innerHTML;
  const editorState = window.__articleEditor;

  if (editorState.history[editorState.historyIndex] === content) return;

  if (editorState.historyIndex < editorState.history.length - 1) {
    editorState.history = editorState.history.slice(0, editorState.historyIndex + 1);
  }

  editorState.history.push(content);
  editorState.historyIndex++;

  if (editorState.history.length > MAX_HISTORY) {
    editorState.history.shift();
    editorState.historyIndex--;
  }

  editorState.isDirty = true;
  updateDirtyState(true);
}

function undo() {
  const editor = document.getElementById('article-editor-content');
  const editorState = window.__articleEditor;
  if (!editor || editorState.historyIndex <= 0) return;

  editorState.historyIndex--;
  editor.innerHTML = editorState.history[editorState.historyIndex];
  editorState.isDirty = editor.innerHTML !== editorState.lastSavedContent;
  updateDirtyState(editorState.isDirty);
  updateActiveTool();
}

function redo() {
  const editor = document.getElementById('article-editor-content');
  const editorState = window.__articleEditor;
  if (!editor || editorState.historyIndex >= editorState.history.length - 1) return;

  editorState.historyIndex++;
  editor.innerHTML = editorState.history[editorState.historyIndex];
  editorState.isDirty = editor.innerHTML !== editorState.lastSavedContent;
  updateDirtyState(editorState.isDirty);
  updateActiveTool();
}

function updateDirtyState(isDirty) {
  const indicator = document.getElementById('article-dirty-indicator');
  if (!indicator) return;

  if (isDirty) {
    indicator.innerHTML = '● ویرایش نشده';
    indicator.className = 'text-amber-400 text-xs mr-2';
  } else {
    indicator.innerHTML = '✓ ذخیره شده';
    indicator.className = 'text-emerald-400 text-xs mr-2';
  }
}

// ========== ACTIVE TOOL MANAGEMENT ==========
function updateActiveTool() {
  const editor = document.getElementById('article-editor-content');
  const editorState = window.__articleEditor;
  if (!editor) return;

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) {
    editorState.activeTool = null;
    updateToolbarButtons();
    return;
  }

  const range = sel.getRangeAt(0);
  let container = range.commonAncestorContainer;
  if (container.nodeType === 3) container = container.parentElement;

  let activeTool = null;
  
  if (document.queryCommandState('bold')) activeTool = 'bold';
  else if (document.queryCommandState('italic')) activeTool = 'italic';
  else if (document.queryCommandState('underline')) activeTool = 'underline';
  
  if (container) {
    if (container.closest('blockquote')) activeTool = 'blockquote';
  }
  
  if (document.queryCommandState('justifyLeft')) activeTool = 'align-left';
  else if (document.queryCommandState('justifyCenter')) activeTool = 'align-center';
  else if (document.queryCommandState('justifyRight')) activeTool = 'align-right';
  else if (document.queryCommandState('justifyFull')) activeTool = 'align-justify';

  editorState.activeTool = activeTool;
  updateToolbarButtons();
}

function updateToolbarButtons() {
  const editorState = window.__articleEditor;
  document.querySelectorAll('.tool-btn').forEach(btn => {
    const cmd = btn.getAttribute('data-cmd');
    if (!cmd) return;
    
    if (editorState.activeTool === cmd) {
      btn.classList.add('active-tool');
    } else {
      btn.classList.remove('active-tool');
    }
  });
}

// ========== AUTO-SAVE ==========
function scheduleAutoSave() {
  const editor = document.getElementById('article-editor-content');
  const editorState = window.__articleEditor;
  if (!editor) return;

  if (editorState.autoSaveTimer) clearTimeout(editorState.autoSaveTimer);

  editorState.autoSaveTimer = setTimeout(() => {
    const content = editor.innerHTML;
    if (content !== editorState.lastSavedContent) {
      state.productDraft.article = content;
      editorState.lastSavedContent = content;
      editorState.isDirty = false;
      updateDirtyState(false);
      toast('✅ مقاله به طور خودکار ذخیره شد', 'success', 2000);
    }
  }, AUTO_SAVE_DELAY);
}

// ========== PREVIEW MODE ==========
function togglePreview() {
  const editorState = window.__articleEditor;
  editorState.previewMode = !editorState.previewMode;
  render();
}

// ========== TEXT SIZE SLIDER ==========
function changeTextSize(direction) {
  const editor = document.getElementById('article-editor-content');
  if (!editor) return;

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);
  let container = range.commonAncestorContainer;
  if (container.nodeType === 3) container = container.parentElement;

  let targetElement = container;
  if (container.nodeType === 1 && container !== editor) {
    targetElement = container;
  } else {
    const span = document.createElement('span');
    range.surroundContents(span);
    targetElement = span;
  }

  const currentSize = parseFloat(window.getComputedStyle(targetElement).fontSize) || 16;
  const newSize = direction === 'increase' ? currentSize + 2 : Math.max(12, currentSize - 2);
  
  targetElement.style.fontSize = newSize + 'px';
  
  saveToHistory(editor);
  updateEditorState();
}

function setTextSize(size) {
  const editor = document.getElementById('article-editor-content');
  if (!editor) return;

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);
  let container = range.commonAncestorContainer;
  if (container.nodeType === 3) container = container.parentElement;

  let targetElement = container;
  if (container.nodeType === 1 && container !== editor) {
    targetElement = container;
  } else {
    const span = document.createElement('span');
    range.surroundContents(span);
    targetElement = span;
  }

  targetElement.style.fontSize = size + 'px';
  
  saveToHistory(editor);
  updateEditorState();
}

// ========== SEPARATOR ==========
function insertSeparator() {
  const html = `<hr class="custom-separator" style="border: none; height: 2px; background: #4f46e5; margin: 20px 0; border-radius: 2px;">`;
  insertHtmlAtCaret(html);
}

// ========== TABLE MODAL ==========
function openTableModal() {
  state.confirmModal = {
    type: 'insertTable',
    title: 'درج جدول',
    icon: '📊',
    message: `
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-white/70 mb-1">تعداد سطرها</label>
            <input id="table-rows" type="number" min="1" max="10" value="3" class="input-style w-full">
          </div>
          <div>
            <label class="block text-xs text-white/70 mb-1">تعداد ستون‌ها</label>
            <input id="table-cols" type="number" min="1" max="8" value="3" class="input-style w-full">
          </div>
        </div>
        <div>
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" id="table-header" checked>
            <span>ردیف عنوان داشته باشد</span>
          </label>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-white/70 mb-1">عرض جدول</label>
            <select id="table-width" class="input-style w-full">
              <option value="100%">۱۰۰٪</option>
              <option value="90%">۹۰٪</option>
              <option value="80%">۸۰٪</option>
              <option value="70%">۷۰٪</option>
              <option value="60%">۶۰٪</option>
              <option value="50%">۵۰٪</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-white/70 mb-1">حاشیه</label>
            <select id="table-border" class="input-style w-full">
              <option value="1">دارد</option>
              <option value="0">ندارد</option>
            </select>
          </div>
        </div>
      </div>
    `,
    confirmText: 'درج جدول',
    confirmClass: 'btn-primary',
    onConfirm: () => {
      const rows = Math.min(10, Math.max(1, Number(document.getElementById('table-rows')?.value) || 3));
      const cols = Math.min(8, Math.max(1, Number(document.getElementById('table-cols')?.value) || 3));
      const hasHeader = document.getElementById('table-header')?.checked;
      const width = document.getElementById('table-width')?.value || '100%';
      const border = document.getElementById('table-border')?.value === '1';

      insertTable(rows, cols, hasHeader, width, border);
      state.confirmModal = null;
      render();
    }
  };
  render();
}

function insertTable(rows, cols, hasHeader, width, border) {
  const editor = document.getElementById('article-editor-content');
  if (!editor) return;

  let html = `<div class="table-wrapper" style="overflow-x:auto; margin:16px 0;">`;
  html += `<table style="width:${width}; border-collapse:collapse; ${border ? 'border:1px solid rgba(255,255,255,0.2);' : ''}">`;

  for (let r = 0; r < rows; r++) {
    html += '<tr>';
    for (let c = 0; c < cols; c++) {
      const isHeader = hasHeader && r === 0;
      const tag = isHeader ? 'th' : 'td';
      const style = isHeader ? 'background:rgba(255,255,255,0.1); font-weight:bold;' : '';
      html += `<${tag} style="padding:10px; ${border ? 'border:1px solid rgba(255,255,255,0.2);' : ''} ${style}">${isHeader ? `عنوان ${c+1}` : `متن ${c+1}`}</${tag}>`;
    }
    html += '</tr>';
  }

  html += '</table></div><p></p>';

  insertHtmlAtCaret(html);
  
  setTimeout(() => {
    editor.innerHTML = editor.innerHTML;
  }, 10);
  
  saveToHistory(editor);
  scheduleAutoSave();
}

// ========== INSERT HTML AT CARET ==========
function insertHtmlAtCaret(html) {
  const editor = document.getElementById("article-editor-content"); 
  if (!editor) return;
  
  editor.focus();

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) { 
    editor.insertAdjacentHTML('beforeend', html); 
    saveToHistory(editor);
    return;
  }
  
  const range = sel.getRangeAt(0);
  if (!editor.contains(range.commonAncestorContainer)) { 
    editor.insertAdjacentHTML('beforeend', html); 
    saveToHistory(editor);
    return;
  }
  
  const frag = range.createContextualFragment(html);
  range.deleteContents(); 
  range.insertNode(frag); 
  sel.collapseToEnd();
  
  saveToHistory(editor);
}

// ========== LINK MODAL ==========
function openLinkModal() {
  const sel = window.getSelection();
  const selectedText = sel.toString();

  if (!selectedText || selectedText.trim().length === 0) {
    toast('ابتدا متن مورد نظر برای لینک را انتخاب کنید', 'warning');
    return;
  }

  // ذخیره موقعیت فعلی
  const range = sel.getRangeAt(0);
  const savedRange = range.cloneRange();

  state.confirmModal = {
    type: 'insertLink',
    title: 'درج لینک',
    icon: '🔗',
    message: `
      <div class="space-y-4">
        <div class="glass rounded-xl p-3 mb-2">
          <p class="text-xs text-white/60 mb-1">متن انتخاب شده:</p>
          <p class="text-sm text-white bg-white/5 p-2 rounded-lg">${escapeHtml(selectedText)}</p>
        </div>
        <div>
          <label class="block text-xs text-white/70 mb-1">آدرس لینک *</label>
          <input id="link-url" class="input-style w-full" placeholder="https://example.com" dir="ltr" value="https://">
        </div>
        <div>
          <label class="block text-xs text-white/70 mb-1">عنوان لینک (اختیاری)</label>
          <input id="link-title" class="input-style w-full" placeholder="عنوان برای سئو">
        </div>
        <div class="flex gap-3">
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" id="link-target" checked>
            <span>در تب جدید باز شود</span>
          </label>
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" id="link-nofollow">
            <span>nofollow</span>
          </label>
        </div>
      </div>
    `,
    confirmText: 'درج لینک',
    confirmClass: 'btn-primary',
    onConfirm: () => {
      const url = document.getElementById('link-url')?.value;
      const title = document.getElementById('link-title')?.value;
      const target = document.getElementById('link-target')?.checked ? '_blank' : '_self';
      const nofollow = document.getElementById('link-nofollow')?.checked;

      if (!url) {
        toast('آدرس لینک الزامی است', 'warning');
        return;
      }

      // بازیابی انتخاب
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedRange);

      // اعمال لینک
      document.execCommand('createLink', false, url);
      
      // تنظیم ویژگی‌های اضافی
      setTimeout(() => {
        const editor = document.getElementById('article-editor-content');
        const links = editor.querySelectorAll('a');
        links.forEach(a => {
          if (a.href === url || a.href === url + '/' || a.href.endsWith(url)) {
            if (title) a.title = title;
            a.target = target;
            a.setAttribute('rel', nofollow ? 'nofollow noopener' : 'noopener');
          }
        });
        saveToHistory(editor);
      }, 50);

      state.confirmModal = null;
      render();
    },
    onCancel: () => {
      state.confirmModal = null;
      render();
    }
  };
  render();
}

// ========== APPLY TEXT FORMAT ==========
function applyTextFormat(cmd, value) {
  const editor = document.getElementById("article-editor-content"); 
  if (!editor) return; 

  editor.focus();
  saveToHistory(editor);

  if (cmd === 'createLink') {
    openLinkModal();
    return;
  }

  if (cmd === 'bold' || cmd === 'italic' || cmd === 'underline') {
    document.execCommand(cmd, false, null);
  }
  else if (cmd === 'blockquote') {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      
      let container = range.commonAncestorContainer;
      if (container.nodeType === 3) container = container.parentElement;
      
      if (container && container.closest('blockquote')) {
        toast('نمی‌توانید داخل نقل قول، نقل قول دیگری ایجاد کنید', 'warning');
        return;
      }
      
      const blockquote = document.createElement('blockquote');
      blockquote.className = 'custom-blockquote';
      
      if (range.collapsed) {
        blockquote.innerHTML = '<p><br></p>';
        range.insertNode(blockquote);
      } else {
        const contents = range.extractContents();
        blockquote.appendChild(contents);
        range.insertNode(blockquote);
      }
      
      const newRange = document.createRange();
      newRange.setStart(blockquote, 0);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
    }
  }
  else if (cmd === 'align-left') {
    document.execCommand('justifyLeft', false, null);
  }
  else if (cmd === 'align-center') {
    document.execCommand('justifyCenter', false, null);
  }
  else if (cmd === 'align-right') {
    document.execCommand('justifyRight', false, null);
  }
  else if (cmd === 'align-justify') {
    document.execCommand('justifyFull', false, null);
  }
  else if (cmd === 'separator') {
    insertSeparator();
  }
  else if (cmd === 'undo') {
    undo();
    return;
  }
  else if (cmd === 'redo') {
    redo();
    return;
  }
  else if (cmd === 'dir-rtl') {
    editor.setAttribute('dir', 'rtl');
  }
  else if (cmd === 'dir-ltr') {
    editor.setAttribute('dir', 'ltr');
  }
  else if (cmd === 'table') {
    openTableModal();
    return;
  }

  updateEditorState();
  updateActiveTool();
  scheduleAutoSave();
}

// ========== VIDEO HELPERS ==========
function openVideoPlayer(videoIndex) { 
  state.videoPlayer = { index: videoIndex, file: state.productDraft.videos[videoIndex] }; 
  render(); 
}

function closeVideoPlayer() { 
  const video = document.querySelector('video');
  if (video) {
    video.pause();
    video.currentTime = 0;
    video.src = '';
    video.load();
  }
  state.videoPlayer = null; 
  render(); 
}

function renderVideoPlayerModal() {
  if (!state.videoPlayer) return '';
  
  const file = state.videoPlayer.file;
  let url = '';
  
  if (file && file instanceof File) {
    url = URL.createObjectURL(file);
  } else {
    url = file || '';
  }
  
  return `
    <div class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 video-player-overlay" onclick="if(event.target===this) closeVideoPlayer()">
      <div class="glass-strong rounded-3xl p-4 max-w-2xl w-full animate-scale">
        <div class="flex justify-between items-center mb-3">
          <h3 class="text-lg font-bold">🎥 پخش ویدیو</h3>
          <button onclick="closeVideoPlayer()" class="text-white/70 hover:text-white text-xl" type="button"><i class="ri-close-line text-xl"></i></button>
        </div>
        <div class="w-full">
          <video controls class="w-full rounded-xl">
            <source src="${url}" type="${file && file.type ? file.type : 'video/mp4'}">
            مرورگر شما از پخش این ویدیو پشتیبانی نمی‌کند.
          </video>
        </div>
      </div>
    </div>
  `;
}

// ========== ICON LOADER + FALLBACK ==========
(function initToolbarIcons() {
  function ensureRemixCss() {
    const href = "https://cdn.jsdelivr.net/npm/remixicon@4.3.0/fonts/remixicon.css";
    const exists = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .some(l => l.href && l.href.indexOf('remixicon') !== -1);
    if (!exists) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      return link;
    }
    return null;
  }

  const ICON_FALLBACK = {
    'ri-bold': 'B','ri-italic': '𝑖','ri-underline': 'U̲',
    'ri-double-quotes-l': '❝','ri-link': '🔗','ri-align-left': '⬅️','ri-align-center': '↔️','ri-align-right': '➡️',
    'ri-align-justify': '≡','ri-arrow-go-back-line': '↶','ri-arrow-go-forward-line': '↷',
    'ri-separator': '─','ri-table-line': '📊', 'ri-eye-line': '👁️',
    'ri-arrow-right-line': '→', 'ri-arrow-left-line': '←', 'ri-font-size': 'Aa',
    'ri-box-3-line': '📦', 'ri-search-line': '🔍', 'ri-video-line': '🎥'
  };

  function remixIconsAvailable() {
    try {
      const el = document.createElement('i');
      el.className = 'ri-bold';
      el.style.position = 'absolute';
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
      document.body.appendChild(el);
      const cs = window.getComputedStyle(el);
      const fontFamily = cs.getPropertyValue('font-family') || '';
      document.body.removeChild(el);
      return /remix/i.test(fontFamily);
    } catch (e) {
      return false;
    }
  }

  function applyIconFallback(root = document) {
    try {
      const icons = root.querySelectorAll('i[class*="ri-"]');
      icons.forEach(i => {
        if (i.getAttribute('data-fallback-applied') === '1') return;
        const cs = window.getComputedStyle(i);
        const fontFamily = cs.getPropertyValue('font-family') || '';
        const isRemix = /remix/i.test(fontFamily);
        if (!isRemix) {
          const cls = Array.from(i.classList).find(c => c.startsWith('ri-'));
          const fallback = ICON_FALLBACK[cls];
          if (fallback) {
            i.innerHTML = `<span aria-hidden="true" class="icon-fallback">${fallback}</span>`;
            i.setAttribute('data-fallback-applied', '1');
          }
        }
      });
    } catch (e) {}
  }

  try {
    const observer = new MutationObserver((mutations) => {
      if (observer._timeout) clearTimeout(observer._timeout);
      observer._timeout = setTimeout(() => { applyIconFallback(document); }, 80);
    });

    const injectedLink = ensureRemixCss();

    if (injectedLink) {
      let loaded = false;
      injectedLink.addEventListener('load', () => {
        loaded = true;
        setTimeout(() => {
          if (!remixIconsAvailable()) applyIconFallback(document);
          if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
          }
        }, 120);
      });
      setTimeout(() => {
        if (!loaded) {
          if (!remixIconsAvailable()) applyIconFallback(document);
          if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
          }
        }
      }, 1000);
    } else {
      setTimeout(() => {
        if (!remixIconsAvailable()) applyIconFallback(document);
        if (document.body) {
          observer.observe(document.body, { childList: true, subtree: true });
        }
      }, 80);
    }
  } catch (e) {}

  window.__applyIconFallback = function(root) { applyIconFallback(root || document); };
})();

// ---------- State init / Draft ----------
function initProductDraft() {
  if (!state.productDraft) {
    state.productDraft = {
      title: '', category: '', price: 0, stock: 0, description: '',
      mainImage: '', gallery: [], original_price: 0, article: '', videos: [], _synced: null,
      seo_title: '', seo_description: '', seo_keywords: '', slug: '',
      seo_canonical: '', seo_robots: 'index,follow',
      og_title: '', og_description: '', og_slug: '',
      twitter_title: '', twitter_description: '',
      redirect_old_url: '', schema_json: ''
    };
  } else {
    if (typeof state.productDraft.article === 'undefined') state.productDraft.article = "";
    if (!Array.isArray(state.productDraft.videos)) state.productDraft.videos = [];
  }
  if (typeof state.productFilterCategory === 'undefined') state.productFilterCategory = 'all';
}

function syncDraftFromEditing() {
  const p = state.editProduct;
  if (!p) return;
  const d = state.productDraft;
  if (d._synced === 'locked') return;
  d.title = p.title || '';
  d.category = p.category || '';
  d.price = safeNumber(p.price);
  d.stock = safeNumber(p.stock);
  d.description = p.description || '';
  d.mainImage = p.main_image || p.image || '';
  d.gallery = Array.isArray(p.images) ? [...p.images] : [];
  d.original_price = safeNumber(p.original_price);
  d.article = p.article || '';
  d.videos = Array.isArray(p.videos) ? [...p.videos] : [];
  d.seo_title = p.seo_title || '';
  d.seo_description = p.seo_description || '';
  d.seo_keywords = p.seo_keywords || '';
  d.slug = p.slug || '';
  d.seo_canonical = p.seo_canonical || '';
  d.seo_robots = p.seo_robots || 'index,follow';
  d.og_title = p.og_title || '';
  d.og_description = p.og_description || '';
  d.og_slug = p.og_slug || '';
  d.twitter_title = p.twitter_title || '';
  d.twitter_description = p.twitter_description || '';
  d.redirect_old_url = p.redirect_old_url || '';
  d.schema_json = p.schema_json || '';
  d._synced = 'locked';
}

// ---------- File readers ----------
function readImageFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

// ---------- Modal partial render (رفع رفرش) ----------
function renderProductModalOnly() {
  const modal = document.querySelector(".modal-overlay");
  if (!modal) return;
  
  // فقط محتوای مودال رو آپدیت کن، نه کل مودال
  const modalContent = modal.querySelector('.glass-strong');
  if (modalContent) {
    const newContent = renderProductModal().match(/<div class="glass-strong[^>]*>[\s\S]*<\/div>/)?.[0] || '';
    if (newContent) {
      modalContent.outerHTML = newContent;
    }
  }
}

// ---------- Image helpers (رفع رفرش) ----------
async function handleMainImageFiles(files) {
  const file = files[0];
  if (!file) return;
  const dataUrl = await readImageFile(file);
  state.productDraft.mainImage = dataUrl;
  toast('تصویر اصلی تنظیم شد', 'success');
  renderProductModalOnly(); // فقط مودال رفرش میشه، نه کل صفحه
}

async function handleGalleryFiles(files) {
  const allowed = Math.max(0, 10 - state.productDraft.gallery.length);
  const list = [...files].slice(0, allowed);
  for (const f of list) {
    const dataUrl = await readImageFile(f);
    state.productDraft.gallery.push(dataUrl);
  }
  if (list.length) toast(`${list.length} تصویر اضافه شد`, 'success');
  renderProductModalOnly(); // فقط مودال رفرش میشه
}

function removeGalleryItem(i) { 
  state.productDraft.gallery.splice(i, 1); 
  renderProductModalOnly(); // فقط مودال رفرش میشه
}

function moveGalleryItem(i, dir) {
  const g = state.productDraft.gallery; 
  const ni = i + dir;
  if (ni < 0 || ni >= g.length) return;
  const [item] = g.splice(i, 1); 
  g.splice(ni, 0, item); 
  renderProductModalOnly(); // فقط مودال رفرش میشه
}

// ---------- Video helpers (رفع رفرش) ----------
function moveVideoItem(i, dir) {
  const v = state.productDraft.videos || []; 
  const ni = i + dir;
  if (ni < 0 || ni >= v.length) return;
  const [item] = v.splice(i, 1); 
  v.splice(ni, 0, item); 
  renderProductModalOnly(); // فقط مودال رفرش میشه
}

// ---------- Product filter ----------
function setProductFilterCategory(val) { state.productFilterCategory = val; render(); }

// ---------- Admin list (with category filter) ----------
function renderAdminProductsEditor() {
  initProductDraft(); if (state.editProduct) syncDraftFromEditing();
  const categoriesOptions = [
    `<option value="all"${state.productFilterCategory === 'all' ? ' selected' : ''}>همه</option>`,
    `<option value="uncategorized"${state.productFilterCategory === 'uncategorized' ? ' selected' : ''}>بدون دسته</option>`,
    ...state.categories.map(cat => `<option value="${cat.id}"${state.productFilterCategory === String(cat.id) ? ' selected' : ''}>${escapeHtml(cat.title)}</option>`)
  ].join('');
  const filteredProducts = (state.products || []).filter(p => {
    const cat = p.category || '';
    if (state.productFilterCategory === 'all') return true;
    if (state.productFilterCategory === 'uncategorized') return !cat;
    return String(cat) === String(state.productFilterCategory);
  });

  return `
    <div class="animate-fade">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl lg:text-3xl font-black">محصولات (${filteredProducts.length})</h1>
          <p class="text-sm text-white/60 mt-1">مدیریت محصولات و مقالات</p>
        </div>

        <div class="flex items-center gap-3">
          <label class="text-sm text-white/70">فیلتر دسته:</label>
          <select onchange="setProductFilterCategory(this.value)" class="input-style">${categoriesOptions}</select>

          <button onclick="
            state.editProduct = {}; 
            state.productDraft = { 
              title:'', category:'', price:0, stock:0, description:'',
              mainImage:'', gallery:[], original_price:0, article:'', videos: [], _synced: null,
              seo_title:'', seo_description:'', seo_keywords:'', slug:'',
              seo_canonical:'', seo_robots:'index,follow',
              og_title:'', og_description:'', og_slug:'',
              twitter_title:'', twitter_description:'',
              redirect_old_url:'', schema_json:''
            }; 
            render();
          " class="btn-primary px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold" type="button">
            <i class="ri-add-line text-base"></i><span>افزودن محصول</span>
          </button>
        </div>
      </div>

      ${filteredProducts.length > 0 ? `
        <div class="grid gap-4">
          ${filteredProducts.map((product, i) => {
            const imgSrc = product.image || product.main_image || '';
            const hasImage = !!imgSrc;
            const price = Number(product.price || 0);
            const original = Number(product.original_price || 0);
            const hasDiscount = original > price && price > 0;
            const discountPercent = hasDiscount ? Math.round(((original - price) / original) * 100) : 0;
            return `
              <div class="glass rounded-2xl p-5 flex items-center gap-4 animate-fade" style="animation-delay:${i * 0.05}s">
                <div class="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                  ${ hasImage ? `<img src="${imgSrc}" alt="${escapeHtml(product.title)}" class="w-full h-full object-cover">` : `<span class="text-3xl">📦</span>` }
                </div>

                <div class="flex-1 min-w-0">
                  <h3 class="font-bold truncate">${escapeHtml(product.title)}</h3>
                  <p class="text-white/60 text-sm">${state.categories.find(c => c.id === product.category)?.title || 'بدون دسته'}</p>
                  ${product.slug ? `<p class="text-white/40 text-xs mt-1">/${product.slug}</p>` : ''}
                </div>

                <div class="text-left hidden sm:block">
                  ${ hasDiscount ? `
                      <div class="flex items-center gap-2">
                        <span class="text-emerald-400 font-bold">${utils.formatPrice(price)}</span>
                        <span class="price-original text-xs">${utils.formatPrice(original)}</span>
                      </div>
                      <div class="mt-1"><span class="badge badge-discount text-[10px]">${discountPercent}% تخفیف</span></div>
                    ` : `<p class="text-emerald-400 font-bold">${utils.formatPrice(price)}</p>` }
                  <p class="text-xs text-white/60 mt-1">موجودی: ${product.stock || 0}</p>
                </div>

                <div class="flex gap-2">
                  <button onclick="
                    state.editProduct = state.products.find(p => p.id === '${product.id}');
                    state.productDraft = { 
                      title:'', category:'', price:0, stock:0, description:'',
                      mainImage:'', gallery:[], original_price:0, article:'', videos: [], _synced: null,
                      seo_title:'', seo_description:'', seo_keywords:'', slug:'',
                      seo_canonical:'', seo_robots:'index,follow',
                      og_title:'', og_description:'', og_slug:'',
                      twitter_title:'', twitter_description:'',
                      redirect_old_url:'', schema_json:''
                    };
                    render();
                  " class="p-3 glass rounded-xl hover:bg-white/10 transition-all" type="button"><i class="ri-edit-line text-base"></i></button>

                  <button onclick="confirmDeleteProduct('${product.id}', '${escapeJs(product.title)}')" class="p-3 glass rounded-xl hover:bg-rose-500/20 text-rose-400 transition-all" type="button"><i class="ri-delete-bin-line text-base"></i></button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : `
        <div class="glass rounded-3xl p-16 text-center">
          <div class="mb-6 animate-float flex items-center justify-center">
            <span class="text-7xl">📦</span>
          </div>
          <h3 class="text-2xl font-bold mb-4">محصولی ثبت نشده است</h3>
          <p class="text-white/60 mb-6">اولین محصول خود را اضافه کنید</p>
          <button onclick="
            state.editProduct = {}; 
            state.productDraft = { 
              title:'', category:'', price:0, stock:0, description:'',
              mainImage:'', gallery:[], original_price:0, article:'', videos: [], _synced: null,
              seo_title:'', seo_description:'', seo_keywords:'', slug:'',
              seo_canonical:'', seo_robots:'index,follow',
              og_title:'', og_description:'', og_slug:'',
              twitter_title:'', twitter_description:'',
              redirect_old_url:'', schema_json:''
            }; 
            render();
          " class="btn-primary px-8 py-4 rounded-xl font-bold" type="button">افزودن محصول</button>
        </div>
      `}
    </div>
  `;
}

// ---------- Product Modal (با placeholder برای قیمت) ----------
function renderProductModal() {
  const isEdit = state.editProduct && state.editProduct.id;
  const product = state.editProduct || {};
  initProductDraft(); if (state.editProduct) syncDraftFromEditing();
  const d = state.productDraft;
  const price = d.price || product.price || '';
  const original = d.original_price || product.original_price || '';
  const hasDiscount = original > price && price > 0;
  const discountPercent = hasDiscount ? Math.round(((original - price) / original) * 100) : 0;

  return `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay">
      <div class="glass-strong rounded-3xl p-6 lg:p-8 max-w-lg w-full max-h-[90%] overflow-y-auto animate-scale">
        <h2 class="text-xl font-black mb-6">${isEdit ? '✏️ ویرایش محصول' : '➕ محصول جدید'}</h2>
        <form onsubmit="event.preventDefault(); submitProductForm(this);">
          <div class="space-y-5">
            <div>
              <label class="block text-sm text-white/70 mb-2">عنوان محصول *</label>
              <input type="text" name="title" required value="${escapeHtml(d.title)}" class="w-full input-style" placeholder="عنوان محصول را وارد کنید" oninput="state.productDraft.title = this.value">
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-white/70 mb-2">قیمت *</label>
                <input type="number" name="price" required value="${price}" class="w-full input-style" dir="ltr" placeholder="قیمت را وارد کنید"
                  onfocus="if(this.value == 0) this.value=''"
                  onblur="if(this.value === '') { this.value = ''; state.productDraft.price = ''; }"
                  oninput="state.productDraft.price = Number(this.value)">
              </div>

              <div>
                <label class="block text-sm text-white/70 mb-2">قیمت اصلی</label>
                <input type="number" name="original_price" value="${original}" class="w-full input-style" dir="ltr" placeholder="قیمت اصلی را وارد کنید"
                  onfocus="if(this.value == 0) this.value=''"
                  onblur="if(this.value === '') { this.value = ''; state.productDraft.original_price = ''; }"
                  oninput="state.productDraft.original_price = Number(this.value)">
                ${ hasDiscount ? `<p class="text-xs text-emerald-400 mt-1">${discountPercent}% تخفیف</p>` : `<p class="text-xs text-white/40 mt-1">در صورت وارد کردن قیمت اصلی بالاتر، تخفیف محاسبه می‌شود.</p>` }
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm text-white/70 mb-2">موجودی *</label>
                <input type="number" name="stock" required value="${d.stock}" class="w-full input-style" dir="ltr" placeholder="موجودی را وارد کنید"
                  onfocus="if(this.value == 0) this.value=''"
                  onblur="if(this.value === '') { this.value = ''; state.productDraft.stock = ''; }"
                  oninput="state.productDraft.stock = Number(this.value)">
              </div>

              <div>
                <label class="block text-sm text-white/70 mb-2">دسته‌بندی</label>
                <select name="category" class="w-full input-style" onchange="state.productDraft.category = this.value">
                  <option value="">بدون دسته</option>
                  ${state.categories.map(cat => `<option value="${cat.id}" ${d.category === cat.id ? 'selected' : ''}>${escapeHtml(cat.title)}</option>`).join('')}
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm text-white/70 mb-2">تصویر اصلی</label>
              <div class="glass rounded-2xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer border border-dashed border-white/20 hover:border-violet-400 transition" onclick="document.getElementById('main-image-input').click()">
                ${ d.mainImage ? `
                  <div class="w-full max-h-56 rounded-xl overflow-hidden mb-3"><img src="${d.mainImage}" class="w-full h-full object-cover"></div>
                  <div class="flex gap-2">
                    <button type="button" class="btn-ghost px-4 py-2 rounded-xl text-sm" onclick="event.stopPropagation(); state.productDraft.mainImage=''; renderProductModalOnly();">حذف</button>
                    <button type="button" class="btn-primary px-4 py-2 rounded-xl text-sm" onclick="event.stopPropagation(); document.getElementById('main-image-input').click()">تغییر تصویر</button>
                  </div>` : `<div class="text-4xl">📷</div><p class="text-sm text-white/70 text-center">برای انتخاب تصویر کلیک کنید</p>` }
                <input id="main-image-input" type="file" accept="image/*" class="hidden" onchange="handleMainImageFiles(this.files)">
              </div>
            </div>

            <div>
              <label class="block text-sm text-white/70 mb-2">گالری تصاویر</label>
              <div class="flex gap-3 overflow-x-auto pb-2">
                ${ d.gallery.length === 0 ? `<p class="text-white/40 text-sm">هنوز تصویری اضافه نشده.</p>` : d.gallery.map((img, i) => `
                  <div class="glass rounded-xl p-2 flex-shrink-0 w-32">
                    <div class="w-full h-24 rounded-lg overflow-hidden mb-2"><img src="${img}" class="w-full h-full object-cover"></div>
                    <div class="flex items-center justify-between gap-1">
                      <button type="button" class="btn-ghost px-2 py-1 rounded-lg text-[10px]" onclick="removeGalleryItem(${i})">حذف</button>
                    </div>
                  </div>`).join('') }
              </div>

              <div class="glass rounded-2xl p-4 mt-3 flex flex-col items-center justify-center gap-3 cursor-pointer border border-dashed border-white/20 hover:border-violet-400 transition" onclick="document.getElementById('gallery-image-input').click()">
                <div class="text-3xl">🖼️</div>
                <p class="text-sm text-white/70 text-center">برای افزودن تصاویر کلیک کنید</p>
                <input id="gallery-image-input" type="file" accept="image/*" multiple class="hidden" onchange="handleGalleryFiles(this.files)">
              </div>
            </div>

            <div>
              <label class="block text-sm text-white/70 mb-2">مقاله محصول</label>
              <button type="button" onclick="openArticleEditor()" class="btn-primary w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2"><span>✏️</span><span>افزودن / ویرایش مقاله</span></button>
              ${ d.article ? `<p class="text-xs text-emerald-400 mt-2 truncate">مقاله ثبت شده ✔</p>` : `<p class="text-xs text-white/40 mt-2">مقاله‌ای ثبت نشده.</p>` }
            </div>

            <div>
              <label class="block text-sm text-white/70 mb-2">ویدیوهای محصول</label>
              <div class="flex flex-col gap-3">
                ${ d.videos.length === 0 ? `<p class="text-white/40 text-sm">ویدیویی اضافه نشده.</p>` : d.videos.map((vid, i) => `
                  <div class="glass rounded-xl p-3 flex items-center justify-between gap-3">
                    <div class="flex items-center gap-3 min-w-0 flex-1">
                      <div class="w-10 h-10 bg-black/10 rounded overflow-hidden flex items-center justify-center text-[10px] shrink-0">${escapeHtml((vid.name||'ویدیو').slice(0,10))}</div>
                      <div class="text-xs truncate flex-1 min-w-0">${escapeHtml(vid.name||'ویدیو')}</div>
                    </div>
                    <div class="flex gap-2 flex-shrink-0">
                      <button class="btn-ghost text-[11px] px-3 py-1 rounded-lg" type="button" onclick="openVideoPlayer(${i})">مشاهده</button>
                      <button class="btn-ghost text-[11px] px-3 py-1 rounded-lg" type="button" onclick="state.productDraft.videos.splice(${i},1); renderProductModalOnly();">حذف</button>
                    </div>
                  </div>`).join('') }
              </div>

              <div class="glass rounded-2xl p-4 mt-3 flex flex-col items-center justify-center gap-3 cursor-pointer border border-dashed border-white/20 hover:border-violet-400 transition" onclick="document.getElementById('video-upload-input').click()">
                <div class="text-3xl">🎥</div>
                <p class="text-sm text-white/70 text-center">برای افزودن ویدیو کلیک کنید</p>
                <input id="video-upload-input" type="file" accept="video/*" multiple class="hidden" onchange="(function(files){ const list = [...files]; for(const f of list) state.productDraft.videos.push(f); renderProductModalOnly(); })(this.files)">
              </div>
            </div>

          </div>

          <div class="flex gap-4 mt-8">
            ${ isEdit ? `<button type="button" class="flex-1 btn-danger py-4 rounded-xl font-semibold flex items-center justify-center gap-2" onclick="confirmDeleteProductFromModal('${product.id}', '${escapeJs(product.title)}')">🗑️<span>حذف محصول</span></button>` : '' }
            <button type="button" onclick="clearProductDraft()" class="flex-1 btn-ghost py-4 rounded-xl font-semibold">انصراف</button>
            <button type="submit" class="flex-1 btn-primary py-4 rounded-xl font-semibold" ${state.loading ? 'disabled' : ''}>${state.loading ? '⏳' : isEdit ? 'بروزرسانی' : 'ذخیره'}</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

// ---------- Product actions (با الهام از admin panel.js) ----------
function confirmDeleteProduct(id, title) {
  state.confirmModal = {
    type: 'delete-product', 
    title: 'حذف محصول', 
    message: `آیا از حذف «${title}» مطمئن هستید؟`, 
    icon: '🗑️',
    confirmText: 'حذف', 
    confirmClass: 'btn-danger',
    onConfirm: () => { 
      deleteProduct(id); 
      state.confirmModal = null; 
      state.editProduct = null; 
      state.productDraft = null; 
      render(); 
    }
  };
  render();
}

// تابع جدید برای حذف از داخل مودال (با الهام از deleteCategoryWithConfirm در admin panel.js)
function confirmDeleteProductFromModal(id, title) {
  // بستن مودال فعلی
  state.editProduct = null;
  state.productDraft = null;
  
  // نمایش مودال تایید حذف
  state.confirmModal = {
    type: 'delete-product', 
    title: 'حذف محصول', 
    message: `آیا از حذف «${title}» مطمئن هستید؟`, 
    icon: '🗑️',
    confirmText: 'حذف', 
    confirmClass: 'btn-danger',
    onConfirm: () => { 
      deleteProduct(id); 
      state.confirmModal = null; 
      render(); 
    }
  };
  render();
}

function validateProductForm(formEl) {
  const title = (formEl.title.value || '').trim();
  const price = Number(formEl.price.value || 0);
  const stock = Number(formEl.stock.value || 0);
  const mainImage = state.productDraft.mainImage;
  const errors = [];
  if (!title) errors.push('نام محصول الزامی است.');
  if (price < 0) errors.push('قیمت نمی‌تواند منفی باشد.');
  if (stock < 0) errors.push('موجودی نمی‌تواند منفی باشد.');
  if (!mainImage) errors.push('تصویر اصلی محصول الزامی است.');
  return { ok: errors.length === 0, errors };
}
function submitProductForm(formEl) {
  event.preventDefault(); initProductDraft();
  const { ok, errors } = validateProductForm(formEl);
  if (!ok) { toast(errors[0], 'warning'); return; }
  const price = Number(formEl.price.value || 0);
  const original_price = Number(formEl.original_price.value || 0);
  const payload = {
    article: state.productDraft.article || "",
    videos: state.productDraft.videos || [],
    title: formEl.title.value.trim(), category: formEl.category.value || '', price,
    stock: Number(formEl.stock.value || 0), description: formEl.description ? formEl.description.value || '' : '',
    main_image: state.productDraft.mainImage, image: state.productDraft.mainImage,
    images: state.productDraft.gallery.filter(Boolean), original_price: original_price > 0 ? original_price : 0
  };
  if (state.editProduct && state.editProduct.id) {
    const updated = updateProduct(state.editProduct.id, payload);
    if (updated) toast('تغییرات محصول ذخیره شد ✨', 'success');
    state.editProduct = null; state.productDraft = null; render(); return;
  }
  const created = createProduct(payload);
  if (created) toast('محصول ذخیره شد ✅', 'success');
  state.editProduct = null; state.productDraft = null; render();
}
function clearProductDraft() { 
  state.productDraft = { 
    title:'', category:'', price:0, stock:0, description:'', 
    mainImage:'', gallery:[], original_price:0, article: "", videos: [], _synced: null,
    seo_title:'', seo_description:'', seo_keywords:'', slug:'',
    seo_canonical:'', seo_robots:'index,follow',
    og_title:'', og_description:'', og_slug:'',
    twitter_title:'', twitter_description:'',
    redirect_old_url:'', schema_json:''
  }; 
  state.editProduct = null; 
  render(); 
}

// ---------- Article editor core ----------
function openArticleEditor() { 
  initProductDraft(); 
  
  const editorState = window.__articleEditor;
  const content = state.productDraft.article || "";
  editorState.history = [content];
  editorState.historyIndex = 0;
  editorState.lastSavedContent = content;
  editorState.isDirty = false;
  editorState.previewMode = false;
  editorState.activeTool = null;
  editorState.seo = {
    title: state.productDraft.seo_title || '',
    description: state.productDraft.seo_description || '',
    keywords: state.productDraft.seo_keywords || '',
    slug: state.productDraft.slug || '',
    canonical: state.productDraft.seo_canonical || '',
    robots: state.productDraft.seo_robots || 'index,follow',
    og_title: state.productDraft.og_title || '',
    og_description: state.productDraft.og_description || '',
    og_slug: state.productDraft.og_slug || '',
    twitter_title: state.productDraft.twitter_title || '',
    twitter_description: state.productDraft.twitter_description || '',
    redirect_old_url: state.productDraft.redirect_old_url || '',
    schema_json: state.productDraft.schema_json || ''
  };
  
  state.articleEditor = content; 
  state._prevEditProduct = state.editProduct || null; 
  state.editProduct = null; 
  state.currentScreen = "article-editor"; 
  render(); 
}
function initArticleEditor() { if (typeof state.articleEditor === "undefined") state.articleEditor = ""; }

// ---------- SEO Settings (پیشرفته) ----------
function updateSeoField(field, value) {
  const editorState = window.__articleEditor;
  if (!editorState.seo) editorState.seo = {};
  editorState.seo[field] = value;
  
  // به‌روزرسانی خودکار JSON-LD
  if (field === 'title' || field === 'description' || field === 'slug' || field === 'price') {
    generateSchemaJson();
  }
}

function generateSchemaJson() {
  const editorState = window.__articleEditor;
  if (!editorState.seo) return;
  
  const product = state.editProduct || {};
  const baseUrl = window.location.origin || 'https://example.com';
  const slug = editorState.seo.slug || product.slug || 'product';
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": editorState.seo.title || product.title || '',
    "description": editorState.seo.description || product.description || '',
    "url": `${baseUrl}/product/${slug}`,
    "sku": product.id || '',
    "brand": {
      "@type": "Brand",
      "name": config?.store_name || 'فروشگاه'
    },
    "offers": {
      "@type": "Offer",
      "price": product.price || 0,
      "priceCurrency": "IRR",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };
  
  editorState.seo.schema_json = JSON.stringify(schema, null, 2);
}

function saveSeoSettings() {
  const editorState = window.__articleEditor;
  if (editorState.seo) {
    state.productDraft.seo_title = editorState.seo.title;
    state.productDraft.seo_description = editorState.seo.description;
    state.productDraft.seo_keywords = editorState.seo.keywords;
    state.productDraft.slug = editorState.seo.slug;
    state.productDraft.seo_canonical = editorState.seo.canonical;
    state.productDraft.seo_robots = editorState.seo.robots;
    state.productDraft.og_title = editorState.seo.og_title;
    state.productDraft.og_description = editorState.seo.og_description;
    state.productDraft.og_slug = editorState.seo.og_slug;
    state.productDraft.twitter_title = editorState.seo.twitter_title;
    state.productDraft.twitter_description = editorState.seo.twitter_description;
    state.productDraft.redirect_old_url = editorState.seo.redirect_old_url;
    state.productDraft.schema_json = editorState.seo.schema_json;
    
    toast('✅ تنظیمات سئو ذخیره شد', 'success');
  }
}

// ---------- Editor styles ----------
(function injectEditorStyles() {
  if (document.getElementById('admin-product-editor-styles')) return;
  const css = `
    /* استایل انتخاب متن */
    ::selection {
      background: #3b82f6 !important;
      color: white !important;
    }
    ::-moz-selection {
      background: #3b82f6 !important;
      color: white !important;
    }
    
    /* نوار ابزار sticky مدرن */
    .article-toolbar-sticky {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(20, 25, 35, 0.95);
      backdrop-filter: blur(16px) saturate(180%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 12px 20px;
      margin-bottom: 24px;
      border-radius: 0;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }
    
    /* نوار ابزار اصلی */
    .article-toolbar { 
      display: flex; 
      gap: 10px; 
      align-items: center; 
      flex-wrap: nowrap; 
      overflow-x: auto; 
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch; 
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.3) transparent;
      padding: 4px 0;
    }
    
    .article-toolbar::-webkit-scrollbar {
      height: 8px;
      display: block;
    }
    .article-toolbar::-webkit-scrollbar-track {
      background: rgba(255,255,255,0.05);
      border-radius: 10px;
    }
    .article-toolbar::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.2);
      border-radius: 10px;
    }
    .article-toolbar::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.3);
    }
    
    .article-toolbar:not(:hover) {
      overflow-x: hidden;
    }
    
    .article-toolbar .tool-group { display: flex; gap: 6px; min-width: max-content; }
    .article-toolbar .tool-btn { 
      flex: 0 0 auto; 
      min-width: 44px; 
      height: 44px; 
      display: inline-flex; 
      align-items: center; 
      justify-content: center; 
      border-radius: 12px; 
      padding: 8px; 
      font-size: 18px;
      transition: all 0.2s ease;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.03);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      color: rgba(255, 255, 255, 0.9);
    }
    .article-toolbar .tool-btn:hover { 
      background: rgba(255, 255, 255, 0.12);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      border-color: rgba(255, 255, 255, 0.1);
    }
    .article-toolbar .tool-btn.active-tool { 
      background: linear-gradient(145deg, #4f46e5, #7c3aed);
      border-color: #a78bfa;
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.3);
      color: white;
    }
    
    /* باکس ویرایشگر سفید */
    .editor-white-box {
      background: white;
      color: #1a1a1a;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.08), 0 6px 12px rgba(0,0,0,0.05);
      border: 1px solid rgba(0,0,0,0.05);
    }
    .editor-white-box #article-editor-content {
      color: #1a1a1a;
      background: white;
      min-height: 500px;
      line-height: 1.8;
    }
    .editor-white-box blockquote {
      color: #333;
      border-right-color: #8b5cf6;
      background: rgba(139, 92, 246, 0.05);
    }
    
    /* استایل نقل قول با آیکون */
    .custom-blockquote {
      position: relative;
      background: rgba(139, 92, 246, 0.05);
      border-right: 4px solid #8b5cf6;
      padding: 20px 48px 20px 20px;
      margin: 20px 0;
      border-radius: 12px;
      font-style: italic;
      color: inherit;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .custom-blockquote::before {
      content: '"';
      position: absolute;
      right: 16px;
      top: 12px;
      font-size: 48px;
      color: #8b5cf6;
      opacity: 0.2;
      font-family: serif;
      line-height: 1;
      font-weight: bold;
    }
    
    /* پیش‌نمایش */
    .preview-mode-active {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: white;
      padding: 6px 16px;
      border-radius: 30px;
      font-size: 13px;
      font-weight: 500;
      margin-right: 16px;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }
    
    /* استایل‌های ریسپانسیو */
    @media (max-width: 768px) {
      .article-toolbar-sticky { padding: 8px 12px; }
      .article-toolbar .tool-btn { min-width: 40px; height: 40px; font-size: 16px; }
      .editor-white-box { padding: 16px; }
      .editor-white-box #article-editor-content { min-height: 350px; }
    }
    @media (max-width: 480px) {
      .article-toolbar .tool-btn { min-width: 36px; height: 36px; font-size: 15px; }
      .editor-white-box { padding: 12px; }
      .editor-white-box #article-editor-content { min-height: 300px; font-size: 14px; }
    }
  `;
  const style = document.createElement('style');
  style.id = 'admin-product-editor-styles';
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
})();

// ---------- Save handlers ----------
function saveArticleFromEditor() {
  const editor = document.getElementById("article-editor-content");
  const content = editor ? editor.innerHTML : (state.articleEditor || "");
  initProductDraft(); 
  state.productDraft.article = content;
  
  // ذخیره تنظیمات سئو
  const editorState = window.__articleEditor;
  if (editorState.seo) {
    state.productDraft.seo_title = editorState.seo.title;
    state.productDraft.seo_description = editorState.seo.description;
    state.productDraft.seo_keywords = editorState.seo.keywords;
    state.productDraft.slug = editorState.seo.slug;
    state.productDraft.seo_canonical = editorState.seo.canonical;
    state.productDraft.seo_robots = editorState.seo.robots;
    state.productDraft.og_title = editorState.seo.og_title;
    state.productDraft.og_description = editorState.seo.og_description;
    state.productDraft.og_slug = editorState.seo.og_slug;
    state.productDraft.twitter_title = editorState.seo.twitter_title;
    state.productDraft.twitter_description = editorState.seo.twitter_description;
    state.productDraft.redirect_old_url = editorState.seo.redirect_old_url;
    state.productDraft.schema_json = editorState.seo.schema_json;
  }
  
  editorState.lastSavedContent = content;
  editorState.isDirty = false;
  editorState.previewMode = false;
  editorState.activeTool = null;
  
  state.currentScreen = null; 
  state.editProduct = state._prevEditProduct || state.editProduct || {}; 
  state._prevEditProduct = null; 
  render(); 
}

function saveArticleOnly() {
  const editor = document.getElementById("article-editor-content");
  const content = editor ? editor.innerHTML : (state.articleEditor || "");
  initProductDraft(); 
  state.productDraft.article = content; 
  state.articleEditor = content;
  
  // ذخیره تنظیمات سئو
  const editorState = window.__articleEditor;
  if (editorState.seo) {
    state.productDraft.seo_title = editorState.seo.title;
    state.productDraft.seo_description = editorState.seo.description;
    state.productDraft.seo_keywords = editorState.seo.keywords;
    state.productDraft.slug = editorState.seo.slug;
    state.productDraft.seo_canonical = editorState.seo.canonical;
    state.productDraft.seo_robots = editorState.seo.robots;
    state.productDraft.og_title = editorState.seo.og_title;
    state.productDraft.og_description = editorState.seo.og_description;
    state.productDraft.og_slug = editorState.seo.og_slug;
    state.productDraft.twitter_title = editorState.seo.twitter_title;
    state.productDraft.twitter_description = editorState.seo.twitter_description;
    state.productDraft.redirect_old_url = editorState.seo.redirect_old_url;
    state.productDraft.schema_json = editorState.seo.schema_json;
  }
  
  editorState.lastSavedContent = content;
  editorState.isDirty = false;
  updateDirtyState(false);
  
  toast('✅ مقاله ذخیره شد', 'success'); 
  render();
}

// ---------- Toolbar helpers ----------
(function toolbarHelpers() {
  function normalizeToolbarIcons() {
    const toolbar = document.querySelector('.article-toolbar');
    if (!toolbar) return;
    try {
      toolbar.querySelectorAll('button, label').forEach(btn => {
        if (btn.querySelector('i') || btn.querySelector('.icon-fallback')) return;
        const title = (btn.getAttribute('title') || '').toLowerCase();
        const map = { 
          'bold':'ri-bold','italic':'ri-italic','underline':'ri-underline',
          'blockquote':'ri-double-quotes-l','link':'ri-link',
          'separator':'ri-separator','align left':'ri-align-left','align center':'ri-align-center',
          'align right':'ri-align-right','justify':'ri-align-justify','undo':'ri-arrow-go-back-line',
          'redo':'ri-arrow-go-forward-line', 'table':'ri-table-line',
          'preview':'ri-eye-line', 'font size':'ri-font-size', 
          'decrease':'ri-subtract-line', 'increase':'ri-add-line',
          'rtl':'ri-arrow-right-line', 'ltr':'ri-arrow-left-line'
        };
        for (const k in map) if (title.indexOf(k) !== -1) { 
          const i = document.createElement('i'); 
          i.className = map[k]; 
          btn.insertBefore(i, btn.firstChild); 
          break; 
        }
      });
    } catch (e) {}
    
    if (window.__applyIconFallback) window.__applyIconFallback();
  }
  setTimeout(normalizeToolbarIcons, 120);
  
  try {
    const obs = new MutationObserver(normalizeToolbarIcons);
    if (document.body) {
      obs.observe(document.body, { childList: true, subtree: true });
    }
  } catch (e) {}
})();

// ---------- Editor layout tweaks ----------
(function injectArticleLayoutStyles() {
  if (document.getElementById('admin-product-article-layout-styles')) return;
  const css = `
    .article-editor-wrapper { display:block; }
    .article-main-column { width:100%; }
    @media (min-width: 1024px) {
      .article-main-column { width:100%; }
    }
  `;
  const s = document.createElement('style'); 
  s.id = 'admin-product-article-layout-styles'; 
  s.appendChild(document.createTextNode(css)); 
  document.head.appendChild(s);
})();

// ---------- Render Article Editor (بدون عکس) ----------
function renderArticleEditor() {
  initArticleEditor();
  const content = state.articleEditor || "";
  const isDirty = window.__articleEditor ? window.__articleEditor.isDirty : false;
  const previewMode = window.__articleEditor ? window.__articleEditor.previewMode : false;
  const seo = window.__articleEditor ? window.__articleEditor.seo : { 
    title: '', description: '', keywords: '', slug: '',
    canonical: '', robots: 'index,follow',
    og_title: '', og_description: '', og_slug: '',
    twitter_title: '', twitter_description: '',
    redirect_old_url: '', schema_json: ''
  };

  return `
    <div class="p-4 lg:p-6 max-w-7xl mx-auto animate-fade">
      <!-- نوار ابزار sticky در هدر -->
      <div class="article-toolbar-sticky">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div class="flex items-center">
            <h2 class="text-lg sm:text-xl font-black">ویرایشگر مقاله محصول</h2>
            <span id="article-dirty-indicator" class="${isDirty ? 'text-amber-400' : 'text-emerald-400'} text-xs mr-2 whitespace-nowrap">
              ${isDirty ? '● ویرایش نشده' : '✓ ذخیره شده'}
            </span>
            ${previewMode ? '<span class="preview-mode-active">🔍 حالت پیش‌نمایش</span>' : ''}
          </div>
          <div class="flex gap-2 flex-wrap">
            <button class="btn-ghost px-3 py-2 rounded-lg text-sm flex items-center gap-1" type="button" onclick="undo()" title="بازگردانی">
              <i class="ri-arrow-go-back-line"></i> <span class="hidden sm:inline">بازگردانی</span>
            </button>
            <button class="btn-ghost px-3 py-2 rounded-lg text-sm flex items-center gap-1" type="button" onclick="redo()" title="جلو">
              <i class="ri-arrow-go-forward-line"></i> <span class="hidden sm:inline">جلو</span>
            </button>
            <button class="btn-ghost px-3 py-2 rounded-lg text-sm flex items-center gap-1" type="button" onclick="togglePreview()" title="پیش‌نمایش">
              <i class="ri-eye-line"></i> <span class="hidden sm:inline">پیش‌نمایش</span>
            </button>
            <button class="btn-ghost px-3 py-2 rounded-lg text-sm" type="button" onclick="saveArticleOnly()">ذخیره</button>
            <button class="btn-primary px-3 py-2 rounded-lg text-sm" type="button" onclick="saveArticleFromEditor()">ذخیره و بازگشت</button>
          </div>
        </div>

        <!-- نوار ابزار اصلی (بدون دکمه عکس) -->
        <div class="article-toolbar overflow-x-auto">
          <div class="tool-group flex gap-1 min-w-max" role="toolbar">
            <button class="btn-ghost tool-btn" type="button" onclick="applyTextFormat('bold')" title="Bold" data-cmd="bold"><i class="ri-bold"></i></button>
            <button class="btn-ghost tool-btn" type="button" onclick="applyTextFormat('italic')" title="Italic" data-cmd="italic"><i class="ri-italic"></i></button>
            <button class="btn-ghost tool-btn" type="button" onclick="applyTextFormat('underline')" title="Underline" data-cmd="underline"><i class="ri-underline"></i></button>

            <span class="w-px h-6 bg-white/10 mx-1"></span>

            <button class="btn-ghost tool-btn" type="button" onclick="setTextSize(24)" title="سایز بزرگ" data-cmd="size-large"><i class="ri-font-size"></i> +</button>
            <button class="btn-ghost tool-btn" type="button" onclick="setTextSize(18)" title="سایز متوسط" data-cmd="size-medium"><i class="ri-font-size"></i> =</button>
            <button class="btn-ghost tool-btn" type="button" onclick="setTextSize(14)" title="سایز کوچک" data-cmd="size-small"><i class="ri-font-size"></i> -</button>
            <button class="btn-ghost tool-btn" type="button" onclick="changeTextSize('increase')" title="افزایش سایز" data-cmd="size-increase"><i class="ri-add-line"></i></button>
            <button class="btn-ghost tool-btn" type="button" onclick="changeTextSize('decrease')" title="کاهش سایز" data-cmd="size-decrease"><i class="ri-subtract-line"></i></button>

            <span class="w-px h-6 bg-white/10 mx-1"></span>

            <button class="btn-ghost tool-btn" type="button" onclick="applyTextFormat('align-left')" title="Align left" data-cmd="align-left"><i class="ri-align-left"></i></button>
            <button class="btn-ghost tool-btn" type="button" onclick="applyTextFormat('align-center')" title="Align center" data-cmd="align-center"><i class="ri-align-center"></i></button>
            <button class="btn-ghost tool-btn" type="button" onclick="applyTextFormat('align-right')" title="Align right" data-cmd="align-right"><i class="ri-align-right"></i></button>
            <button class="btn-ghost tool-btn" type="button" onclick="applyTextFormat('align-justify')" title="Justify" data-cmd="align-justify"><i class="ri-align-justify"></i></button>

            <span class="w-px h-6 bg-white/10 mx-1"></span>

            <button class="btn-ghost tool-btn" type="button" onclick="applyTextFormat('blockquote')" title="Blockquote" data-cmd="blockquote"><i class="ri-double-quotes-l"></i></button>

            <button class="btn-ghost tool-btn" type="button" onclick="applyTextFormat('createLink')" title="Insert link" data-cmd="link"><i class="ri-link"></i></button>
            <button class="btn-ghost tool-btn" type="button" onclick="applyTextFormat('separator')" title="Separator" data-cmd="separator"><i class="ri-separator"></i></button>
            <button class="btn-ghost tool-btn" type="button" onclick="applyTextFormat('table')" title="Insert table" data-cmd="table"><i class="ri-table-line"></i></button>

            <span class="w-px h-6 bg-white/10 mx-1"></span>

            <button class="btn-ghost tool-btn" type="button" onclick="applyTextFormat('dir-rtl')" title="RTL" data-cmd="rtl"><i class="ri-arrow-right-line"></i></button>
            <button class="btn-ghost tool-btn" type="button" onclick="applyTextFormat('dir-ltr')" title="LTR" data-cmd="ltr"><i class="ri-arrow-left-line"></i></button>
          </div>
        </div>
      </div>

      <div class="article-editor-wrapper">
        <div class="glass rounded-xl mb-4 article-main-column">
          <div class="editor-white-box">
            ${previewMode ? `
              <div class="preview-mode">
                ${content}
              </div>
            ` : `
              <div 
                id="article-editor-content" 
                class="w-full min-h-[400px] sm:min-h-[520px] prose max-w-none text-sm outline-none" 
                contenteditable="true" 
                oninput="state.articleEditor = this.innerHTML; saveToHistory(this); scheduleAutoSave()" 
                onkeyup="updateActiveTool()"
                onmouseup="updateActiveTool()"
                onpaste="setTimeout(() => { updateEditorState(); saveToHistory(this); updateActiveTool(); }, 50)"
                spellcheck="true" 
                dir="rtl"
              >${content}</div>
            `}
          </div>
        </div>

        <!-- تنظیمات سئو پیشرفته -->
        <div class="glass rounded-xl p-5 mt-6">
          <h3 class="text-sm font-bold mb-3 flex items-center gap-2">
            <i class="ri-search-line text-lg"></i> تنظیمات پیشرفته سئو
          </h3>
          
          <div class="space-y-4">
            <!-- بخش ۱: اطلاعات اصلی -->
            <div class="glass p-4 rounded-lg">
              <h4 class="text-xs font-semibold text-white/70 mb-3">اطلاعات اصلی</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs text-white/70 mb-1">عنوان سئو (Title)</label>
                  <input type="text" class="input-style w-full text-sm" value="${escapeHtml(seo.title || '')}" placeholder="حداکثر ۶۰ کاراکتر" maxlength="60" oninput="updateSeoField('title', this.value)">
                  <p class="text-[10px] text-white/40 mt-1">${(seo.title || '').length}/60 کاراکتر</p>
                </div>
                <div>
                  <label class="block text-xs text-white/70 mb-1">توضیحات متا (Meta Description)</label>
                  <textarea class="input-style w-full text-sm" rows="2" placeholder="حداکثر ۱۶۰ کاراکتر" maxlength="160" oninput="updateSeoField('description', this.value)">${escapeHtml(seo.description || '')}</textarea>
                  <p class="text-[10px] text-white/40 mt-1">${(seo.description || '').length}/160 کاراکتر</p>
                </div>
                <div>
                  <label class="block text-xs text-white/70 mb-1">کلمات کلیدی (Keywords)</label>
                  <input type="text" class="input-style w-full text-sm" value="${escapeHtml(seo.keywords || '')}" placeholder="مثال: گوشی, موبایل, شیائومی" oninput="updateSeoField('keywords', this.value)">
                </div>
                <div>
                  <label class="block text-xs text-white/70 mb-1">آدرس یکتا (URL Slug)</label>
                  <input type="text" class="input-style w-full text-sm" value="${escapeHtml(seo.slug || '')}" placeholder="example-product" dir="ltr" oninput="updateSeoField('slug', this.value)">
                </div>
              </div>
            </div>

            <!-- بخش ۲: تنظیمات پیشرفته -->
            <div class="glass p-4 rounded-lg">
              <h4 class="text-xs font-semibold text-white/70 mb-3">تنظیمات پیشرفته</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs text-white/70 mb-1">آدرس کنونیکال (Canonical)</label>
                  <input type="url" class="input-style w-full text-sm" value="${escapeHtml(seo.canonical || '')}" placeholder="https://example.com/product" dir="ltr" oninput="updateSeoField('canonical', this.value)">
                </div>
                <div>
                  <label class="block text-xs text-white/70 mb-1">دستورالعمل روبات‌ها (Robots)</label>
                  <select class="input-style w-full text-sm" onchange="updateSeoField('robots', this.value)">
                    <option value="index,follow" ${seo.robots === 'index,follow' ? 'selected' : ''}>index, follow (پیش‌فرض)</option>
                    <option value="noindex,follow" ${seo.robots === 'noindex,follow' ? 'selected' : ''}>noindex, follow</option>
                    <option value="index,nofollow" ${seo.robots === 'index,nofollow' ? 'selected' : ''}>index, nofollow</option>
                    <option value="noindex,nofollow" ${seo.robots === 'noindex,nofollow' ? 'selected' : ''}>noindex, nofollow</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- بخش ۳: شبکه‌های اجتماعی -->
            <div class="glass p-4 rounded-lg">
              <h4 class="text-xs font-semibold text-white/70 mb-3">شبکه‌های اجتماعی</h4>
              
              <div class="mb-3">
                <h5 class="text-xs text-white/60 mb-2">Open Graph (فیسبوک، لینکدین)</h5>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label class="block text-xs text-white/70 mb-1">عنوان OG</label>
                    <input type="text" class="input-style w-full text-sm" value="${escapeHtml(seo.og_title || '')}" placeholder="عنوان اختصاصی" oninput="updateSeoField('og_title', this.value)">
                  </div>
                  <div>
                    <label class="block text-xs text-white/70 mb-1">توضیحات OG</label>
                    <input type="text" class="input-style w-full text-sm" value="${escapeHtml(seo.og_description || '')}" placeholder="توضیحات اختصاصی" oninput="updateSeoField('og_description', this.value)">
                  </div>
                  <div>
                    <label class="block text-xs text-white/70 mb-1">اسلاگ OG</label>
                    <input type="text" class="input-style w-full text-sm" value="${escapeHtml(seo.og_slug || '')}" placeholder="آدرس اختصاصی" dir="ltr" oninput="updateSeoField('og_slug', this.value)">
                  </div>
                </div>
              </div>

              <div>
                <h5 class="text-xs text-white/60 mb-2">Twitter Card</h5>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs text-white/70 mb-1">عنوان توییتر</label>
                    <input type="text" class="input-style w-full text-sm" value="${escapeHtml(seo.twitter_title || '')}" placeholder="عنوان اختصاصی" oninput="updateSeoField('twitter_title', this.value)">
                  </div>
                  <div>
                    <label class="block text-xs text-white/70 mb-1">توضیحات توییتر</label>
                    <input type="text" class="input-style w-full text-sm" value="${escapeHtml(seo.twitter_description || '')}" placeholder="توضیحات اختصاصی" oninput="updateSeoField('twitter_description', this.value)">
                  </div>
                </div>
              </div>
            </div>

            <!-- بخش ۴: ریدایرکت و اسکیما -->
            <div class="glass p-4 rounded-lg">
              <h4 class="text-xs font-semibold text-white/70 mb-3">ریدایرکت و اسکیما</h4>
              <div class="grid grid-cols-1 gap-3">
                <div>
                  <label class="block text-xs text-white/70 mb-1">ریدایرکت ۳۰۱ (آدرس قدیمی)</label>
                  <input type="url" class="input-style w-full text-sm" value="${escapeHtml(seo.redirect_old_url || '')}" placeholder="/old-product" dir="ltr" oninput="updateSeoField('redirect_old_url', this.value)">
                  <p class="text-[10px] text-white/40 mt-1">آدرس قدیمی به این آدرس جدید هدایت می‌شود</p>
                </div>
                <div>
                  <label class="block text-xs text-white/70 mb-1">اسکیمای JSON-LD (تولید خودکار)</label>
                  <textarea class="input-style w-full text-sm" rows="3" readonly placeholder="اسکیما به صورت خودکار تولید می‌شود">${escapeHtml(seo.schema_json || '')}</textarea>
                  <button class="btn-ghost text-xs px-3 py-1 rounded-lg mt-1" onclick="generateSchemaJson()">تولید مجدد اسکیما</button>
                </div>
              </div>
            </div>

            <div class="flex justify-end">
              <button class="btn-primary px-6 py-3 rounded-xl text-sm font-semibold" onclick="saveSeoSettings()">ذخیره تنظیمات سئو</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    ${renderVideoPlayerModal()}
  `;
}

// ---------- Attach controls after render ----------
(function ensureAttachAfterRender() {
  try {
    const obs = new MutationObserver(() => {
      const editor = document.getElementById('article-editor-content');
      if (editor && window.__articleEditor && !window.__articleEditor.previewMode) { 
        if (window.__applyIconFallback) window.__applyIconFallback(editor); 
        updateActiveTool();
      }
    });
    if (document.body) {
      obs.observe(document.body, { childList: true, subtree: true });
    }
  } catch (e) {}
})();

// ---------- Update editor state ----------
function updateEditorState() { 
  const editor = document.getElementById("article-editor-content"); 
  if (!editor) return; 
  state.articleEditor = editor.innerHTML; 
}

// ========== EXPOSE FUNCTIONS GLOBALLY ==========
window.undo = undo;
window.redo = redo;
window.togglePreview = togglePreview;
window.saveToHistory = saveToHistory;
window.scheduleAutoSave = scheduleAutoSave;
window.openTableModal = openTableModal;
window.openLinkModal = openLinkModal;
window.applyTextFormat = applyTextFormat;
window.openArticleEditor = openArticleEditor;
window.renderArticleEditor = renderArticleEditor;
window.updateEditorState = updateEditorState;
window.saveArticleOnly = saveArticleOnly;
window.saveArticleFromEditor = saveArticleFromEditor;
window.updateActiveTool = updateActiveTool;
window.changeTextSize = changeTextSize;
window.setTextSize = setTextSize;
window.insertSeparator = insertSeparator;
window.updateSeoField = updateSeoField;
window.saveSeoSettings = saveSeoSettings;
window.generateSchemaJson = generateSchemaJson;
window.openVideoPlayer = openVideoPlayer;
window.closeVideoPlayer = closeVideoPlayer;
window.handleMainImageFiles = handleMainImageFiles;
window.handleGalleryFiles = handleGalleryFiles;
window.removeGalleryItem = removeGalleryItem;
window.renderProductModalOnly = renderProductModalOnly;
window.confirmDeleteProduct = confirmDeleteProduct;
window.confirmDeleteProductFromModal = confirmDeleteProductFromModal;
window.clearProductDraft = clearProductDraft;
window.setProductFilterCategory = setProductFilterCategory;
window.renderAdminProductsEditor = renderAdminProductsEditor;
window.renderProductModal = renderProductModal;

// ---------- End of file ----------