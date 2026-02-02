// ═══════════════════════════════════════════════════════════════
// FOOTER COMPONENT (GPT‑5 Final)
// - سال شمسی دقیق با Intl
// - سوشال‌ها از socialLinks
// - نمادها از trustBadges (داینامیک و ریسپانسیو)
// - Google Maps با لینک Embed صحیح
// File: assets/js/footer component.js
// ═══════════════════════════════════════════════════════════════
(function () {
  function navigate(page) {
    goTo(page);
    setTimeout(() => {
      try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch {}
    }, 0);
  }

  // سال شمسی دقیق
  function getShamsiYear() {
    return new Intl.DateTimeFormat('fa-IR-u-nu-latn', { year: 'numeric' })
      .format(new Date());
  }

  function renderFooter() {
    const currentYear = getShamsiYear();

    // اگر trustBadges تعریف نشده بود، یک آرایه خالی باشد
    const badges = Array.isArray(window.trustBadges) ? window.trustBadges : [];

    return `
      <footer class="glass border-t border-white/5 mt-16" aria-label="پاورقی سایت">
        <div class="max-w-7xl mx-auto px-4 lg:px-8 py-12 lg:py-16">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            
            <!-- Brand -->
            <div class="col-span-2 md:col-span-1">
              <div class="flex items-center gap-3 mb-4">
                <img src="assets/img/logo/logo.png" alt="Logo" class="w-10 h-10 object-contain">
                <span class="font-black text-xl gradient-text">${config.store_name}</span>
              </div>
              <p class="text-white/60 text-sm leading-relaxed mb-6">
                ${config.hero_subtitle}
              </p>
              <div class="flex items-center justify-center gap-6 mt-6">
                <a href="${socialLinks?.instagram || '#'}" target="_blank" class="transition hover:opacity-80">
                  <img src="assets/img/logo/instagram.png" alt="Instagram" class="w-7 h-7 object-contain">
                </a>
                <a href="${socialLinks?.telegram || '#'}" target="_blank" class="transition hover:opacity-80">
                  <img src="assets/img/logo/telegram.png" alt="Telegram" class="w-7 h-7 object-contain">
                </a>
                <a href="${socialLinks?.whatsapp || '#'}" target="_blank" class="transition hover:opacity-80">
                  <img src="assets/img/logo/whatsapp.png" alt="WhatsApp" class="w-7 h-7 object-contain">
                </a>
              </div>
            </div>
            
            <!-- Quick Links -->
            <div>
              <h4 class="font-bold text-sm mb-5">دسترسی سریع</h4>
              <ul class="space-y-3">
                <li><button onclick="navigate('home')" class="text-white/60 hover:text-white text-sm transition-colors" type="button">صفحه اصلی</button></li>
                <li><button onclick="navigate('shop')" class="text-white/60 hover:text-white text-sm transition-colors" type="button">فروشگاه</button></li>
                <li><button onclick="navigate('cart')" class="text-white/60 hover:text-white text-sm transition-colors" type="button">سبد خرید</button></li>
              </ul>
            </div>
            
            <!-- Categories -->
            <div>
              <h4 class="font-bold text-sm mb-5">دسته‌بندی‌ها</h4>
              <ul class="space-y-3">
                ${(state.categories || []).slice(0, 4).map(cat => `
                  <li>
                    <button 
                      onclick="state.productFilter.category='${cat.id}'; navigate('shop')" 
                      class="text-white/60 hover:text-white text-sm transition-colors"
                      type="button"
                    >
                      ${cat.title}
                    </button>
                  </li>
                `).join('')}
              </ul>
            </div>
            
            <!-- Contact -->
            <div>
              <h4 class="font-bold text-sm mb-5">ارتباط با ما</h4>
              <ul class="space-y-3 text-white/60 text-sm">
                <li class="flex items-center gap-2"><span aria-hidden="true">📞</span><span class="font-mono" dir="ltr">۰۲۱-۱۲۳۴۵۶۸</span></li>
                <li class="flex items-center gap-2"><span aria-hidden="true">📧</span><span>info@premium-shop.ir</span></li>
                <li class="flex items-center gap-2"><span aria-hidden="true">📍</span><span>تهران، ایران</span></li>
                <li class="flex items-center gap-2"><span aria-hidden="true">⏰</span><span>شنبه تا پنج‌شنبه ۹-۱۸</span></li>
              </ul>
            </div>
          </div>
          
          <!-- Bottom Bar -->
          <div class="border-t border-white/10 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p class="text-white/40 text-xs text-center md:text-right">
              © ${currentYear} ${config.store_name} - تمامی حقوق محفوظ است
            </p>
            <div class="flex flex-wrap items-center gap-3">
              ${badges.length === 0
                ? `
                <div class="flex flex-wrap items-center gap-3">
  ${trustBadges.map(b => `
    <img src="${b.img}" alt="${b.alt}" class="h-12 w-auto rounded-lg glass p-1">
  `).join('')}
</div>
                `
                : badges.map(b => `
                  <img src="${b.img}" alt="${b.alt || ''}" class="h-10 w-auto rounded-lg glass p-1">
                `).join('')}
            </div>
          </div>
        </div>

        <!-- Google Map -->
        <div class="mt-6">
          <div class="rounded-2xl overflow-hidden glass" style="height:200px;">
            <iframe
              title="موقعیت فروشگاه روی نقشه"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d809.7641054083018!2d51.503209039672846!3d35.72483089176731!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3f8e034310ea73a5%3A0xa0c3fb28da93acf6!2sSquare%202!5e0!3m2!1sen!2s!4v1769885074544!5m2!1sen!2s"
              width="100%" height="100%" style="border:0;" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
        </div>

        <!-- Back-to-top button -->
        <div class="fixed bottom-6 left-6 z-[60]">
          <button onclick="window.scrollTo({ top: 0, behavior: 'smooth' })"
            class="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 ring-1 ring-white/10 shadow-2xl hover:bg-white/20 transition-all flex items-center justify-center text-xl"
            aria-label="برو به بالا" title="برو به بالا" type="button">⬆️</button>
        </div>
      </footer>
    `;
  }

  window.renderFooter = renderFooter;
  window.navigate = navigate;
})();