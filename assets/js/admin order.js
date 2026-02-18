// ═══════════════════════════════════════════════════════════════
// ADMIN ORDERS
// File: assets/js/admin orders.js
// ═══════════════════════════════════════════════════════════════
function renderAdminOrders() {
  let filteredOrders = [...state.orders];
  
  if (state.orderFilter.status) {
    filteredOrders = filteredOrders.filter(o => o.status === state.orderFilter.status);
  }
  
  return `
    <div class="animate-fade">
      <h1 class="text-2xl lg:text-3xl font-black mb-8">سفارشات (${filteredOrders.length})</h1>
      
      <!-- Filter -->
      <div class="glass rounded-2xl p-5 mb-6">
        <div class="flex flex-wrap gap-2">
          <button 
            onclick="state.orderFilter.status = ''; render()"
            class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${!state.orderFilter.status ? 'bg-violet-500 text-white' : 'glass hover:bg-white/10'}"
          >
            همه
          </button>
          ${[
            { value: 'pending', label: '⏳ در انتظار', color: 'bg-amber-500' },
            { value: 'processing', label: '⚙️ پردازش', color: 'bg-blue-500' },
            { value: 'shipped', label: '🚚 ارسال شده', color: 'bg-cyan-500' },
            { value: 'delivered', label: '✅ تحویل', color: 'bg-emerald-500' }
          ].map(opt => `
            <button 
              onclick="state.orderFilter.status = '${opt.value}'; render()"
              class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${state.orderFilter.status === opt.value ? opt.color + ' text-white' : 'glass hover:bg-white/10'}"
            >
              ${opt.label}
            </button>
          `).join('')}
        </div>
      </div>
      
      ${filteredOrders.length > 0 ? `
        <div class="space-y-4">
          ${filteredOrders.map((order, i) => {
            const items = JSON.parse(order.items || '[]');
            const statusInfo = utils.getStatusInfo(order.status);
            
            return `
              <div class="glass rounded-2xl p-6 animate-fade" style="animation-delay: ${i * 0.05}s">
                <div class="flex flex-wrap items-center justify-between gap-4 mb-5">
                  <div>
                    <span class="font-mono font-bold">#${(order.id || '').slice(-8)}</span>
                    <p class="text-xs text-white/60 mt-1">${utils.formatDateTime(order.created_at)}</p>
                  </div>
                  
                  <div>
                    <label for="status-${order.id}" class="sr-only">وضعیت سفارش</label>
                    <select 
                      id="status-${order.id}"
                      onchange="updateOrderStatus(state.orders.find(o => o.id === '${order.id}'), this.value)"
                      class="bg-white/10 border border-white/20 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-violet-500"
                    >
                      <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>⏳ در انتظار</option>
                      <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>⚙️ پردازش</option>
                      <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>🚚 ارسال شده</option>
                      <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>✅ تحویل</option>
                    </select>
                  </div>
                </div>
                
                <div class="grid md:grid-cols-3 gap-4">
                  <div class="glass rounded-xl p-4">
                    <p class="text-xs text-white/60 mb-2">مشتری</p>
                    <p class="font-semibold">${order.user_name || 'بدون نام'}</p>
                    <p class="text-sm font-mono text-white/70">${order.user_phone}</p>
                  </div>
                  
                  <div class="glass rounded-xl p-4 hidden md:block">
                    <p class="text-xs text-white/60 mb-2">آدرس</p>
                    <p class="text-sm line-clamp-2">${order.address || '-'}</p>
                  </div>
                  
                  <div class="glass rounded-xl p-4">
                    <p class="text-xs text-white/60 mb-2">مبلغ کل</p>
                    <p class="text-xl font-black text-emerald-400">${utils.formatPrice(order.total)}</p>
                    <p class="text-xs text-white/60">${items.length} کالا</p>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : `
        <div class="glass rounded-3xl p-16 text-center">
          <div class="text-7xl mb-6">🛒</div>
          <h3 class="text-2xl font-bold">سفارشی یافت ن  د</h3>
        </div>
      `}
    </div>
  `;
}