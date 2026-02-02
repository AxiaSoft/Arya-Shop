// ════════════════   ══════════════════════════════════════════════
// ADMIN DASHBOARD
// ══════════════════════════════════════════════   ════════════════
function renderAdminDashboard() {
  const totalSales = state.orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = state.orders.filter(o => o.status === 'pending').length;
  const totalProducts = state.products.length;
  
  return `
    <div class="animate-fade">
      <h1 class="text-2xl lg:text-3xl font-black mb-8">داشبورد</h1>
      
      <!-- Stats Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <div class="glass rounded-2xl p-5 lg:p-6">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
              💰
            </div>
            <div>
              <p class="text-white/60 text-xs">کل فروش</p>
              <p class="text-lg lg:text-xl font-black text-emerald-400">${utils.formatPriceShort(totalSales)}</p>
            </div>
          </div>
        </div>
        
        <div class="glass rounded-2xl p-5 lg:p-6">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
              ⏳
            </div>
            <div>
              <p class="text-white/60 text-xs">در انتظار</p>
              <p class="text-3xl font-black text-amber-400">${pendingOrders}</p>
            </div>
          </div>
        </div>
        
        <div class="glass rounded-2xl p-5 lg:p-6">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
              📦
            </div>
            <div>
              <p class="text-white/60 text-xs">محصولات</p>
              <p class="text-3xl font-black text-violet-400">${totalProducts}</p>
            </div>
          </div>
        </div>
        
        <div class="glass rounded-2xl p-5 lg:p-6">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
              🛒
            </div>
            <div>
              <p class="text-white/60 text-xs">کل سفارشات</p>
              <p class="text-3xl font-black text-cyan-400">${state.orders.length}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Recent Orders -->
      <div class="glass rounded-2xl p-6">
        <h2 class="font-bold text-lg mb-5">آخرین سفارشات</h2>
        
        ${state.orders.length > 0 ? `
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-white/10">
                  <th class="text-right py-4 px-3 text-white/60 font-medium">شماره</th>
                  <th class="text-right py-4 px-3 text-white/60 font-medium hidden sm:table-cell">مشتری</th>
                  <th class="text-right py-4 px-3 text-white/60 font-medium">مبلغ</th>
                  <th class="text-right py-4 px-3 text-white/60 font-medium">وضعیت</th>
                  <th class="text-right py-4 px-3 text-white/60 font-medium hidden lg:table-cell">تاریخ</th>
                </tr>
              </thead>
              <tbody>
                ${state.orders.slice(0, 5).map(order => {
                  const statusInfo = utils.getStatusInfo(order.status);
                  return `
                    <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td class="py-4 px-3 font-mono text-xs">#${(order.id || '').slice(-6)}</td>
                      <td class="py-4 px-3 hidden sm:table-cell">${order.user_name || order.user_phone}</td>
                      <td class="py-4 px-3 text-emerald-400 font-bold">${utils.formatPrice(order.total)}</td>
                      <td class="py-4 px-3"><span class="badge ${statusInfo.badge}">${statusInfo.label}</span></td>
                      <td class="py-4 px-3 text-white/60 hidden lg:table-cell">${utils.formatDate(order.created_at)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        ` : `
          <p class="text-white/60 text-center py-12">سفارشی ثبت نشده است</p>
        `}
      </div>
    </div>
  `;
}