// ═══════════════════════════════════════════  ═══════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════
function goTo(page, data = null) {
  state.prevPage = state.page;
  state.page = page;
  state.mobileMenuOpen = false;
  
  if (data) {
    if (page === 'product') state.selectedProduct = data;
  }
  
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // بعد از تغییر صفحه داخل goTo:
try { location.hash = '#/' + state.page; } catch {}
// و در init:
if (location.hash) {
  const page = location.hash.replace(/^#\/?/, '');
  if (page) state.page = page;
}
}
