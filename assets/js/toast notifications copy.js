// ═══════════════════════════════════════════════════════════════
// TOAST NOTIFICATIONS
// File: assets/js/toast notifictions.js
// ═══════════════════════════════════════════════════════════════

function ensureToastContainer() {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className =
      'fixed top-4 left-4 z-[9999] flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(container);
  }
  return container;
}

function toast(message, type = 'success', duration = 4000) {
  const container = ensureToastContainer();

  const toastEl = document.createElement('div');
  toastEl.className = `
    toast-item pointer-events-auto px-4 py-3 rounded-xl shadow-lg text-sm
    ${type === 'success' ? 'bg-emerald-500/20 text-emerald-300' : ''}
    ${type === 'error' ? 'bg-rose-500/20 text-rose-300' : ''}
    ${type === 'warning' ? 'bg-amber-500/20 text-amber-300' : ''}
    ${type === 'info' ? 'bg-blue-500/20 text-blue-300' : ''}
    backdrop-blur-xl border border-white/10 animate-fade-in
  `;
  toastEl.textContent = message;

  container.appendChild(toastEl);

  setTimeout(() => {
    toastEl.classList.add('animate-fade-out');
    setTimeout(() => toastEl.remove(), 300);
  }, duration);
}