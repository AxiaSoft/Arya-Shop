// ═════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD — PRO VERSION (WITH 3 ESSENTIAL CHARTS)
// File: assets/js/admin dashboard.js
// ═════════════════════════════════════════════════════════════════

function renderAdminDashboard() {
  const orders = Array.isArray(state.orders) ? state.orders : [];
  const products = Array.isArray(state.products) ? state.products : [];
  const users = Array.isArray(state.users) ? state.users : [];

  // Total sales
  const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  // Today orders
  const today = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter(o => (o.created_at || '').startsWith(today));

  // Pending orders
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  // Last 5 orders
  const lastOrders = orders
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  // Best selling products
  const productSales = {};
  orders.forEach(o => {
    const items = Array.isArray(o.items) ? o.items : [];
    items.forEach(i => {
      if (!productSales[i.id]) productSales[i.id] = { title: i.title, qty: 0 };
      productSales[i.id].qty += i.qty || 1;
    });
  });

  const bestProducts = Object.values(productSales)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return `
    <div class="animate-fade">

      <h1 class="text-2xl lg:text-3xl font-black mb-8">داشبورد مدیریت</h1>

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        ${dashboardStatCard("💰", "کل فروش", utils.formatPriceShort(totalSales), "from-emerald-500 to-green-600")}
        ${dashboardStatCard("📅", "سفارشات امروز", todayOrders.length, "from-blue-500 to-cyan-600")}
        ${dashboardStatCard("⏳", "در انتظار", pendingOrders, "from-amber-500 to-orange-600")}
        ${dashboardStatCard("📦", "محصولات", products.length, "from-violet-500 to-purple-600")}
      </div>

      <!-- Essential Charts -->
      ${renderSalesChart(orders)}
      ${renderOrdersChart(orders)}
      ${renderMonthlyRevenueChart(orders)}

      <!-- Best Selling Products -->
      <div class="glass rounded-2xl p-6 mb-8">
        <h2 class="font-bold text-lg mb-4">پرفروش‌ترین محصولات</h2>

        ${
          bestProducts.length === 0
            ? `<p class="text-white/60 text-sm">هنوز فروشی ثبت نشده است.</p>`
            : `
              <div class="space-y-3">
                ${bestProducts
                  .map(
                    p => `
                  <div class="glass rounded-xl p-4 flex items-center justify-between">
                    <span class="text-sm font-medium">${p.title}</span>
                    <span class="text-emerald-400 font-bold">${p.qty} عدد</span>
                  </div>
                `
                  )
                  .join("")}
              </div>
            `
        }
      </div>

      <!-- Recent Orders -->
      <div class="glass rounded-2xl p-6">
        <h2 class="font-bold text-lg mb-5">آخرین سفارشات</h2>

        ${
          lastOrders.length === 0
            ? `<p class="text-white/60 text-center py-12">سفارشی ثبت نشده است</p>`
            : `
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
                    ${lastOrders
                      .map(o => {
                        const statusInfo = utils.getStatusInfo(o.status);
                        return `
                          <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td class="py-4 px-3 font-mono text-xs">#${(o.id || "").slice(-6)}</td>
                            <td class="py-4 px-3 hidden sm:table-cell">${o.user_name || o.user_phone}</td>
                            <td class="py-4 px-3 text-emerald-400 font-bold">${utils.formatPrice(o.total)}</td>
                            <td class="py-4 px-3"><span class="badge ${statusInfo.badge}">${statusInfo.label}</span></td>
                            <td class="py-4 px-3 text-white/60 hidden lg:table-cell">${utils.formatDate(o.created_at)}</td>
                          </tr>
                        `;
                      })
                      .join("")}
                  </tbody>
                </table>
              </div>
            `
        }
      </div>

    </div>
  `;
}

/* Helper: stat card */
function dashboardStatCard(icon, label, value, gradient) {
  return `
    <div class="glass rounded-2xl p-5">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-2xl shadow-lg">
          ${icon}
        </div>
        <div>
          <p class="text-white/60 text-xs">${label}</p>
          <p class="text-xl font-black">${value}</p>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================
   SALES CHART (30 DAYS)
   ============================================================ */
function renderSalesChart(orders) {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push(key);
  }

  const salesMap = {};
  days.forEach(d => (salesMap[d] = 0));

  orders.forEach(o => {
    const date = (o.created_at || "").slice(0, 10);
    if (salesMap[date] !== undefined) {
      salesMap[date] += o.total || 0;
    }
  });

  const values = Object.values(salesMap);
  const maxValue = Math.max(...values, 1);

  const points = values
    .map((v, i) => `${(i / 29) * 100},${100 - (v / maxValue) * 100}`)
    .join(" ");

  return `
    <div class="glass rounded-2xl p-6 mb-8">
      <h2 class="font-bold text-lg mb-4">نمودار فروش (۳۰ روز اخیر)</h2>

      <svg viewBox="0 0 100 100" class="w-full h-40 lg:h-56">
        <polyline points="${points}" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="3"/>
        <polyline points="${points}" fill="none" stroke="url(#gradSales)" stroke-width="3"/>

        <defs>
          <linearGradient id="gradSales" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#4ade80"/>
            <stop offset="100%" stop-color="#22c55e"/>
          </linearGradient>
        </defs>
      </svg>

      <p class="text-xs text-white/50 mt-2">فروش روزانه</p>
    </div>
  `;
}

/* ============================================================
   ORDERS COUNT CHART (30 DAYS)
   ============================================================ */
function renderOrdersChart(orders) {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push(key);
  }

  const ordersMap = {};
  days.forEach(d => (ordersMap[d] = 0));

  orders.forEach(o => {
    const date = (o.created_at || "").slice(0, 10);
    if (ordersMap[date] !== undefined) {
      ordersMap[date] += 1;
    }
  });

  const values = Object.values(ordersMap);
  const maxValue = Math.max(...values, 1);

  const points = values
    .map((v, i) => `${(i / 29) * 100},${100 - (v / maxValue) * 100}`)
    .join(" ");

  return `
    <div class="glass rounded-2xl p-6 mb-8">
      <h2 class="font-bold text-lg mb-4">تعداد سفارشات (۳۰ روز اخیر)</h2>

      <svg viewBox="0 0 100 100" class="w-full h-40 lg:h-56">
        <polyline points="${points}" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="3"/>
        <polyline points="${points}" fill="none" stroke="url(#gradOrders)" stroke-width="3"/>

        <defs>
          <linearGradient id="gradOrders" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#60a5fa"/>
            <stop offset="100%" stop-color="#3b82f6"/>
          </linearGradient>
        </defs>
      </svg>

      <p class="text-xs text-white/50 mt-2">سفارشات روزانه</p>
    </div>
  `;
}

/* ============================================================
   MONTHLY REVENUE CHART (12 MONTHS)
   ============================================================ */
function renderMonthlyRevenueChart(orders) {
  const months = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push(key);
  }

  const revenueMap = {};
  months.forEach(m => (revenueMap[m] = 0));

  orders.forEach(o => {
    const date = o.created_at || "";
    const monthKey = date.slice(0, 7);
    if (revenueMap[monthKey] !== undefined) {
      revenueMap[monthKey] += o.total || 0;
    }
  });

  const values = Object.values(revenueMap);
  const maxValue = Math.max(...values, 1);

  const points = values
    .map((v, i) => `${(i / 11) * 100},${100 - (v / maxValue) * 100}`)
    .join(" ");

  return `
    <div class="glass rounded-2xl p-6 mb-8">
      <h2 class="font-bold text-lg mb-4">درآمد ماهانه (۱۲ ماه اخیر)</h2>

      <svg viewBox="0 0 100 100" class="w-full h-48 lg:h-64">
        <polyline points="${points}" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="3"/>
        <polyline points="${points}" fill="none" stroke="url(#gradMonthly)" stroke-width="3"/>

        <defs>
          <linearGradient id="gradMonthly" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#f472b6"/>
            <stop offset="100%" stop-color="#ec4899"/>
          </linearGradient>
        </defs>
      </svg>

      <p class="text-xs text-white/50 mt-2">درآمد ماهانه</p>
    </div>
  `;
}