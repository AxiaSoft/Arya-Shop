// ═══════════════════════════════════════════════════════════════
// CONFIRM MODAL
// ══════════════════════════════════════  ════════════════════════
function renderConfirmModal() {
  const modal = state.confirmModal;
  if (!modal) return '';
  
  return `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay">
      <div class="glass-strong rounded-3xl p-8 max-w-md w-full animate-scale text-center">
        <div class="text-6xl mb-5">${modal.icon || '❓'}</div>
        <h2 class="text-xl font-bold mb-3">${modal.title}</h2>
        <p class="text-white/70 text-sm mb-8 leading-relaxed">${modal.message}</p>
        <div class="flex gap-4">
          <button 
            onclick="state.confirmModal = null; render()" 
            class="flex-1 btn-ghost py-3.5 rounded-xl font-semibold transition-all"
          >
            انصراف
          </button>
          <button 
            onclick="state.confirmModal.onConfirm()" 
            class="flex-1 ${modal.confirmClass || 'btn-primary'} py-3.5 rounded-xl font-semibold transition-all"
          >
            ${modal.confirmText || 'تایید'}
          </button>
        </div>
      </div>
    </div>
  `;
}