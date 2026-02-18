// ═══════════════════════════════════════════════════════════════
// PRODUCT DETAIL PAGE (GPT‑5 FINAL – MESSENGER REPLIES + MOBILE BAR + GALLERY FIX)
// File: assets/js/product detail page.js
// ═══════════════════════════════════════════════════════════════

// ───── State init ─────
state.reviews = state.reviews || [];
state.wishlist = state.wishlist || [];
state.currentUser = state.currentUser || null;
state.reviewDraftRatings = state.reviewDraftRatings || {};
state.productGalleryIndex =
  typeof state.productGalleryIndex === 'number' ? state.productGalleryIndex : 0;
state.reviewRepliesModal = state.reviewRepliesModal || null;
state.productGalleryLightbox = state.productGalleryLightbox || null;
state.lastProductId = state.lastProductId || null;

// ───── Global modal helpers (body scroll lock) ─────
function openGlobalModal() {
  if (typeof document !== 'undefined') {
    document.body.dataset.modalOpenCount =
      (parseInt(document.body.dataset.modalOpenCount || '0', 10) || 0) + 1;
    document.body.style.overflow = 'hidden';
  }
}

function closeGlobalModal() {
  if (typeof document !== 'undefined') {
    const current =
      parseInt(document.body.dataset.modalOpenCount || '0', 10) || 0;
    const next = Math.max(0, current - 1);
    document.body.dataset.modalOpenCount = String(next);
    if (next === 0) document.body.style.overflow = '';
  }
}

// ───── Helpers ─────
function isLoggedIn() {
  return !!state.currentUser;
}

function isInWishlist(productId) {
  return state.wishlist.includes(productId);
}

// حفظ اسکرول بعد از رندر
function preserveScrollAndRender() {
  const y = window.scrollY || 0;
  render();
  setTimeout(() => {
    window.scrollTo(0, y);
  }, 0);
}

// اجرای اکشن بدون لندینگ به بالا (همراه با رندر)
function safeActionWithRender(fn) {
  const y = window.scrollY || 0;
  fn();
  render();
  setTimeout(() => {
    window.scrollTo(0, y);
  }, 0);
}

function toggleWishlist(productId) {
  safeActionWithRender(() => {
    if (isInWishlist(productId)) {
      state.wishlist = state.wishlist.filter(id => id !== productId);
      toast('از لیست علاقه‌مندی‌ها حذف شد', 'info');
    } else {
      state.wishlist.push(productId);
      toast('به لیست علاقه‌مندی‌ها اضافه شد', 'success');
    }
  });
}

// ───── Reviews ─────
function getProductReviews(productId) {
  return (state.reviews || []).filter(r => r.product_id === productId);
}

function buildReviewTree(reviews) {
  const map = {};
  reviews.forEach(r => (map[r.id] = { ...r, children: [] }));
  const roots = [];

  reviews.forEach(r => {
    if (r.parent) {
      if (map[r.parent]) map[r.parent].children.push(map[r.id]);
    } else {
      roots.push(map[r.id]);
    }
  });

  return roots;
}

// ستاره انتخاب امتیاز در فرم نظر
function setReviewRating(formId, productId, value) {
  state.reviewDraftRatings = state.reviewDraftRatings || {};
  state.reviewDraftRatings[productId] = value;

  const form = document.getElementById(formId);
  if (!form) return;

  if (form.rating) {
    form.rating.value = value;
  }

  const stars = form.querySelectorAll('[data-star]');
  stars.forEach(star => {
    const v = Number(star.getAttribute('data-star'));
    if (v <= value) {
      star.classList.add('text-amber-400');
      star.classList.remove('text-white/30');
    } else {
      star.classList.remove('text-amber-400');
      star.classList.add('text-white/30');
    }
  });
}

function submitReview(event, productId) {
  event.preventDefault();

  if (!isLoggedIn()) {
    toast('برای ثبت نظر باید وارد شوید', 'warning');
    return;
  }

  const form = event.target;
  const rating = Number(form.rating.value || 0);
  const text = form.text.value.trim();

  if (!rating || !text) {
    toast('امتیاز و متن نظر الزامی است', 'warning');
    return;
  }

  safeActionWithRender(() => {
    state.reviews.push({
      id: 'rev_' + utils.generateId(),
      product_id: productId,
      user_name: state.currentUser.name,
      rating,
      text,
      likes: 0,
      dislikes: 0,
      status: 'pending',
      parent: null,
      created_at: Date.now()
    });

    toast('نظر شما ثبت شد و پس از تأیید مدیر نمایش داده می‌شود', 'success');
    form.reset();
    state.reviewDraftRatings[productId] = 0;
  });
}

function submitReply(event, productId, parentId) {
  event.preventDefault();

  if (!isLoggedIn()) {
    toast('برای پاسخ دادن باید وارد شوید', 'warning');
    return;
  }

  const form = event.target;
  const text = form.text.value.trim();

  if (!text) {
    toast('متن پاسخ الزامی است', 'warning');
    return;
  }

  safeActionWithRender(() => {
    state.reviews.push({
      id: 'rev_' + utils.generateId(),
      product_id: productId,
      user_name: state.currentUser.name,
      rating: 0,
      text,
      likes: 0,
      dislikes: 0,
      status: 'pending',
      parent: parentId,
      created_at: Date.now()
    });

    toast('پاسخ شما ثبت شد و پس از تأیید مدیر نمایش داده می‌شود', 'success');
    form.reset();
  });
}

// منطق لایک/دیس‌لایک منطقی (یک واکنش در لحظه) بدون رندر مجدد صفحه
function toggleReviewVote(reviewId, type) {
  const r = state.reviews.find(x => x.id === reviewId);
  if (!r) return;

  r.likes =
    typeof r.likes === 'number' ? r.likes : parseInt(r.likes || '0', 10) || 0;
  r.dislikes =
    typeof r.dislikes === 'number'
      ? r.dislikes
      : parseInt(r.dislikes || '0', 10) || 0;

  const prev = r._clientReaction || null;

  if (type === 'like') {
    if (prev === 'like') {
      r.likes = Math.max(0, r.likes - 1);
      r._clientReaction = null;
    } else {
      if (prev === 'dislike') {
        r.dislikes = Math.max(0, r.dislikes - 1);
      }
      r.likes += 1;
      r._clientReaction = 'like';
    }
  } else if (type === 'dislike') {
    if (prev === 'dislike') {
      r.dislikes = Math.max(0, r.dislikes - 1);
      r._clientReaction = null;
    } else {
      if (prev === 'like') {
        r.likes = Math.max(0, r.likes - 1);
      }
      r.dislikes += 1;
      r._clientReaction = 'dislike';
    }
  }

  if (typeof document !== 'undefined') {
    const nodes = document.querySelectorAll(`[data-review-id="${reviewId}"]`);
    nodes.forEach(node => {
      const likeBtn = node.querySelector('[data-review-like]');
      const dislikeBtn = node.querySelector('[data-review-dislike]');
      if (likeBtn) {
        const span = likeBtn.querySelector('span:last-child');
        if (span) span.textContent = String(r.likes);
        likeBtn.classList.toggle('bg-emerald-500/20', r._clientReaction === 'like');
        likeBtn.classList.toggle('text-emerald-300', r._clientReaction === 'like');
        if (r._clientReaction === 'like') {
          likeBtn.classList.remove('bg-white/5', 'hover:bg-white/10');
        } else {
          likeBtn.classList.add('bg-white/5', 'hover:bg-white/10');
        }
      }
      if (dislikeBtn) {
        const span = dislikeBtn.querySelector('span:last-child');
        if (span) span.textContent = String(r.dislikes);
        dislikeBtn.classList.toggle('bg-rose-500/20', r._clientReaction === 'dislike');
        dislikeBtn.classList.toggle('text-rose-300', r._clientReaction === 'dislike');
        if (r._clientReaction === 'dislike') {
          dislikeBtn.classList.remove('bg-white/5', 'hover:bg-white/10');
        } else {
          dislikeBtn.classList.add('bg-white/5', 'hover:bg-white/10');
        }
      }
    });
  }
}

// ───── مودال پاسخ‌ها (استایل شبیه پیام‌رسان، بدون چت دوطرفه) ─────
function openReviewRepliesModal(reviewId, productId) {
  state.reviewRepliesModal = { reviewId, productId };
  openGlobalModal();
  preserveScrollAndRender();
}

function closeReviewRepliesModal() {
  state.reviewRepliesModal = null;
  closeGlobalModal();
  preserveScrollAndRender();
}

function renderReviewRepliesModal(productId) {
  const m = state.reviewRepliesModal;
  if (!m || m.productId !== productId) return '';

  const all = getProductReviews(productId).filter(r => r.status === 'approved');
  const root = all.find(r => r.id === m.reviewId);
  if (!root) return '';

  const children = all.filter(r => r.parent === root.id);

  return `
    <div class="fixed inset-0 z-[200] flex items-center justify-center p-4 modal-overlay bg-black/70" onclick="if(event.target===this){closeReviewRepliesModal()}">
      <div class="glass-strong rounded-3xl p-4 sm:p-6 lg:p-8 max-w-xl w-full max-h-[90%] flex flex-col animate-scale" dir="rtl">
        
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base sm:text-lg font-black flex items-center gap-2">
            <span>💬</span>
            <span>گفت‌وگوی مربوط به این نظر</span>
          </h2>
          <button type="button" class="text-white/60 hover:text-white text-lg" onclick="closeReviewRepliesModal()">✖️</button>
        </div>

        <div class="flex-1 overflow-y-auto no-scrollbar rounded-3xl bg-black/40 p-3 sm:p-4 space-y-3">

          <div class="flex justify-start">
            <div class="max-w-[85%] flex gap-2 items-start">
              <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs sm:text-sm" aria-hidden="true">
                ${(root.user_name || 'ک')[0]}
              </div>
              <div class="bg-white/5 rounded-2xl rounded-bl-sm px-3 py-2 text-xs sm:text-sm text-white/90 shadow-sm">
                <div class="flex items-center justify-between gap-2 mb-1">
                  <span class="font-semibold text-[11px] sm:text-xs">${root.user_name}</span>
                  <span class="text-[10px] text-white/40">${utils.formatDateTime(root.created_at)}</span>
                </div>
                ${
                  root.rating
                    ? `<div class="flex items-center gap-1 text-amber-400 text-[10px] mb-1">
                         ${utils.renderStars(root.rating, 'text-[10px]')}
                         <span class="text-white/60">(${root.rating})</span>
                       </div>`
                    : ''
                }
                <p class="leading-relaxed">${root.text}</p>
              </div>
            </div>
          </div>

          ${
            children.length
              ? children
                  .map(
                    c => `
              <div class="flex justify-end">
                <div class="max-w-[85%] flex gap-2 items-start flex-row-reverse">
                  <div class="w-8 h-8 rounded-full bg-violet-500/40 flex items-center justify-center text-xs sm:text-sm" aria-hidden="true">
                    ${(c.user_name || 'ک')[0]}
                  </div>
                  <div class="bg-violet-500/20 border border-violet-400/40 rounded-2xl rounded-br-sm px-3 py-2 text-xs sm:text-sm text-white shadow-sm">
                    <div class="flex items-center justify-between gap-2 mb-1">
                      <span class="font-semibold text-[11px] sm:text-xs">${c.user_name}</span>
                      <span class="text-[10px] text-white/50">${utils.formatDateTime(c.created_at)}</span>
                    </div>
                    <p class="leading-relaxed">${c.text}</p>
                    <div class="mt-1 flex items-center gap-2 text-[10px] text-white/50">
                      <button 
                        type="button"
                        data-review-like
                        onclick="toggleReviewVote('${c.id}', 'like')" 
                        class="px-1.5 py-0.5 rounded-lg flex items-center gap-1 ${
                          c._clientReaction === 'like'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-white/5 hover:bg-white/10'
                        }"
                      >
                        👍 <span>${c.likes || 0}</span>
                      </button>
                      <button 
                        type="button"
                        data-review-dislike
                        onclick="toggleReviewVote('${c.id}', 'dislike')" 
                        class="px-1.5 py-0.5 rounded-lg flex items-center gap-1 ${
                          c._clientReaction === 'dislike'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-white/5 hover:bg-white/10'
                        }"
                      >
                        👎 <span>${c.dislikes || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            `
                  )
                  .join('')
              : `<p class="text-xs sm:text-sm text-white/60 text-center mt-2">هنوز پاسخی برای این نظر ثبت نشده است.</p>`
          }
        </div>

        ${
          isLoggedIn()
            ? `
          <form class="mt-3 space-y-2" onsubmit="submitReply(event, '${productId}', '${root.id}')">
            <div class="text-[11px] text-white/50 mb-1">
              در حال پاسخ به نظر <span class="font-semibold text-white/80">${root.user_name}</span>
            </div>
            <textarea name="text" class="input-style w-full text-xs sm:text-sm" rows="2" placeholder="پاسخ خود را درباره این نظر بنویسید..."></textarea>
            <div class="flex justify-end">
              <button class="btn-primary px-4 py-2 rounded-xl text-xs" type="submit">ارسال پاسخ</button>
            </div>
          </form>
        `
            : `
          <div class="mt-3 text-xs text-white/50">
            برای پاسخ دادن ابتدا 
            <button onclick="goTo('login')" class="text-violet-400 underline" type="button">وارد شوید</button>
          </div>
        `
        }
      </div>
    </div>
  `;
}

// ───── Render Review Item (لیست اصلی، بدون نمایش پاسخ‌ها) ─────
function renderReviewItem(review, depth, productId, options) {
  const opts = options || {};
  const indent = Math.min(depth, 4);
  const hasChildren =
    review.children && Array.isArray(review.children) && review.children.length > 0;

  return `
    <div class="glass rounded-2xl p-4 mb-3 ml-${indent * 4}" data-review-id="${review.id}">
      
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm" aria-hidden="true">
            ${(review.user_name || 'ک')[0]}
          </div>
          <div>
            <div class="text-sm font-semibold">${review.user_name}</div>
            <div class="text-[11px] text-white/40">${utils.formatDateTime(review.created_at)}</div>
          </div>
        </div>

        ${
          review.rating
            ? `<div class="flex items-center gap-1 text-amber-400 text-xs">
                 ${utils.renderStars(review.rating, 'text-xs')}
                 <span class="text-white/60">(${review.rating})</span>
               </div>`
            : ''
        }
      </div>

      <p class="text-sm text-white/80 mb-3 leading-relaxed">${review.text}</p>

      <div class="flex items-center justify-between text-xs text-white/50 mb-2">
        <div class="flex items-center gap-2">
          <button 
            type="button"
            data-review-like
            onclick="toggleReviewVote('${review.id}', 'like')" 
            class="px-2 py-1 rounded-lg flex items-center gap-1 ${
              review._clientReaction === 'like'
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-white/5 hover:bg-white/10'
            }"
            aria-label="پسندیدن این نظر"
          >
            👍 <span>${review.likes || 0}</span>
          </button>
          <button 
            type="button"
            data-review-dislike
            onclick="toggleReviewVote('${review.id}', 'dislike')" 
            class="px-2 py-1 rounded-lg flex items-center gap-1 ${
              review._clientReaction === 'dislike'
                ? 'bg-rose-500/20 text-rose-300'
                : 'bg-white/5 hover:bg-white/10'
            }"
            aria-label="نپسندیدن این نظر"
          >
            👎 <span>${review.dislikes || 0}</span>
          </button>
        </div>

        <div class="flex items-center gap-2">
          ${
            hasChildren && !opts.hideRepliesButton
              ? `
            <button
              type="button"
              class="px-2 py-1 rounded-lg glass text-[11px] flex items-center gap-1 hover:bg-white/10"
              onclick="openReviewRepliesModal('${review.id}', '${productId}')"
            >
              💬 پاسخ‌ها (${review.children.length})
            </button>
          `
              : ''
          }
          <button 
            type="button"
            onclick="this.parentElement.parentElement.nextElementSibling.classList.toggle('hidden')" 
            class="text-violet-400 hover:text-violet-300"
          >
            پاسخ دادن
          </button>
        </div>
      </div>

      ${
        isLoggedIn()
          ? `
        <form class="hidden mt-3 space-y-2" onsubmit="submitReply(event, '${productId}', '${review.id}')">
          <textarea name="text" class="input-style w-full text-sm" rows="2" placeholder="پاسخ خود را بنویسید..."></textarea>
          <div class="flex justify-end">
            <button class="btn-primary px-4 py-2 rounded-xl text-xs" type="submit">ارسال پاسخ</button>
          </div>
        </form>
        `
          : `
        <div class="mt-3 text-xs text-white/50">
          برای پاسخ دادن ابتدا 
          <button onclick="goTo('login')" class="text-violet-400 underline" type="button">وارد شوید</button>
        </div>
        `
      }

      ${!opts.hideChildren ? '' : ''}
    </div>
  `;
}

// ───── گالری محصول ─────
function buildProductGallery(product) {
  const gallery = [];

  const mainImage =
    product.main_image ||
    product.image ||
    null;

  if (mainImage) {
    gallery.push(mainImage);
  }

  if (Array.isArray(product.images) && product.images.length) {
    product.images.forEach(img => {
      if (img && img !== mainImage) gallery.push(img);
    });
  }

  if (Array.isArray(product.gallery) && product.gallery.length) {
    product.gallery.forEach(img => {
      if (img && img !== mainImage) gallery.push(img);
    });
  }

  return gallery.filter(Boolean);
}

// ───── گالری محصول + لایت‌باکس ─────
function openProductGalleryLightbox(productId) {
  state.productGalleryLightbox = { productId: productId };
  openGlobalModal();
  preserveScrollAndRender();
}

function closeProductGalleryLightbox() {
  state.productGalleryLightbox = null;
  closeGlobalModal();
  preserveScrollAndRender();
}

// جابجایی اسلایدها فقط با آپدیت DOM، بدون رندر مجدد
function changeGalleryIndex(delta, galleryLength) {
  const max = Math.max(0, galleryLength - 1);
  let next = state.productGalleryIndex + delta;
  if (next < 0) next = max;
  if (next > max) next = 0;
  state.productGalleryIndex = next;

  if (typeof document === 'undefined') return;

  const product = state.selectedProduct;
  if (!product) return;

  const gallery = buildProductGallery(product);
  const img = gallery[next] || '';

  const mainImg = document.querySelector('[data-gallery-main]');
  if (mainImg && img) {
    mainImg.src = img;
    mainImg.classList.remove('opacity-0');
    mainImg.classList.add('opacity-0');
    setTimeout(() => {
      mainImg.classList.remove('opacity-0');
    }, 10);
  }

  const thumbs = document.querySelectorAll('[data-gallery-thumb]');
  thumbs.forEach(btn => {
    const idx = Number(btn.getAttribute('data-index') || '0');
    if (idx === next) {
      btn.classList.add('border-violet-400');
      btn.classList.remove('border-white/30');
    } else {
      btn.classList.remove('border-violet-400');
      btn.classList.add('border-white/30');
    }
  });
}

function setGalleryIndexDirect(index, galleryLength) {
  const max = Math.max(0, galleryLength - 1);
  const next = Math.min(Math.max(0, index), max);
  state.productGalleryIndex = next;
  changeGalleryIndex(0, galleryLength);
}

function renderProductGalleryLightbox(product, gallery) {
  const m = state.productGalleryLightbox;
  if (!m || m.productId !== product.id) return '';

  const maxIndex = Math.max(0, gallery.length - 1);
  const idx = Math.min(Math.max(0, state.productGalleryIndex), maxIndex);
  const img = gallery[idx] || '';

  return `
    <div 
      class="fixed inset-0 z-[210] flex items-center justify-center p-4 modal-overlay bg-black/80"
      onclick="if(event.target===this){closeProductGalleryLightbox()}"
    >
      <div class="relative max-w-5xl w-full max-h-[90%] flex flex-col animate-scale">
        <div class="flex items-center justify-between mb-3 text-white">
          <span class="text-sm text-white/70">${product.title}</span>
          <button type="button" class="text-white/80 hover:text-white text-lg" onclick="closeProductGalleryLightbox()">✖️</button>
        </div>

        <div class="relative flex-1 flex items-center justify-center overflow-hidden rounded-3xl bg-black/60">
          ${
            img
              ? `<img src="${img}" alt="${product.title}" data-gallery-main class="max-h-full max-w-full object-contain transition-opacity duration-300 ease-out">`
              : `<div class="text-6xl text-white/60">📦</div>`
          }

          <button 
            type="button"
            class="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center"
            onclick="changeGalleryIndex(-1, ${gallery.length})"
          >
            ◀
          </button>

          <button 
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center"
            onclick="changeGalleryIndex(1, ${gallery.length})"
          >
            ▶
          </button>
        </div>

        <div class="flex gap-2 overflow-x-auto no-scrollbar mt-3 justify-center w-full">
          ${gallery
            .map(
              (g, i) => `
            <button
              type="button"
              data-gallery-thumb
              data-index="${i}"
              class="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border ${
                i === idx ? 'border-violet-400' : 'border-white/30'
              } bg-black/40"
              onclick="setGalleryIndexDirect(${i}, ${gallery.length})"
            >
              ${
                g
                  ? `<img src="${g}" alt="${product.title}" class="w-full h-full object-contain">`
                  : `<div class="w-full h-full flex items-center justify-center text-xl text-white/70">📦</div>`
              }
            </button>
          `
            )
            .join('')}
        </div>
      </div>
    </div>
  `;
}

// افزودن به سبد خرید بدون لندینگ
function addToCartFromProduct(product) {
  safeActionWithRender(() => {
    addToCart(product);
  });
}

// ───── PRODUCT PAGE ─────
function renderProductPage() {
  const product = state.selectedProduct;
  if (!product) return renderShopPage();

  if (state.lastProductId !== product.id) {
    state.productGalleryIndex = 0;
    state.lastProductId = product.id;
  }

  const inStock = (product.stock || 0) > 0;
  const discount = utils.calculateDiscount(
    product.original_price,
    product.price
  );
  const category = state.categories.find(c => c.id === product.category);

  const allReviews = getProductReviews(product.id);
  const approvedReviews = allReviews.filter(r => r.status === 'approved');

  const ratings = approvedReviews.filter(r => r.rating > 0).map(r => r.rating);
  const avgRating = ratings.length
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
    : '0.0';

  const reviewTree = buildReviewTree(approvedReviews);

  const relatedProducts = state.products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const inWishlist = isInWishlist(product.id);

  const gallery = buildProductGallery(product);
  const mainImage = gallery[0] || '';

  const maxIndex = Math.max(0, gallery.length - 1);
  if (state.productGalleryIndex > maxIndex) state.productGalleryIndex = 0;
  if (state.productGalleryIndex < 0) state.productGalleryIndex = 0;

  const currentDraftRating = state.reviewDraftRatings[product.id] || 0;
  const reviewFormId = `review-form-${product.id}`;

  const thumbLimit = 5;
  const visibleThumbs = gallery.slice(0, thumbLimit);
  const extraCount = gallery.length > thumbLimit ? gallery.length - thumbLimit : 0;

  return `
    ${renderHeader()}

    <main class="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12 pb-28 lg:pb-16">

      <nav class="flex flex-wrap items-center gap-2 text-sm text-white/60 mb-6 lg:mb-8" aria-label="مسیر صفحه">
        <button onclick="goTo('home')" class="hover:text-white" type="button">خانه</button>
        <span>←</span>
        <button onclick="goTo('shop')" class="hover:text-white" type="button">فروشگاه</button>
        ${
          category
            ? `<span>←</span><button onclick="state.productFilter.category='${category.id}'; goTo('shop')" class="hover:text-white" type="button">${category.title}</button>`
            : ''
        }
        <span>←</span>
        <span class="text-white truncate max-w-[150px] lg:max-w-xs" title="${product.title}">${product.title}</span>
      </nav>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16 items-start">

        <!-- Gallery -->
        <div class="space-y-4">
          <div 
            class="glass rounded-3xl overflow-hidden cursor-pointer w-full flex items-center justify-center aspect-[4/3] sm:aspect-[16/10]"
            onclick="state.productGalleryIndex=0; openProductGalleryLightbox('${product.id}')"
          >
            ${
              mainImage
                ? `
                  <img 
                    src="${mainImage}" 
                    alt="${product.title}" 
                    class="w-full h-full object-contain"
                  >
                `
                : `<div class="text-[6rem] lg:text-[8rem]" aria-hidden="true">📦</div>`
            }
          </div>

          ${
            gallery.length > 0
              ? `
            <div class="flex items-center gap-3 overflow-x-auto no-scrollbar w-full">
              ${visibleThumbs
                .map(
                  (img, idx) => `
                <button
                  type="button"
                  class="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border border-white/10 hover:border-violet-400 transition-colors bg-black/30"
                  onclick="state.productGalleryIndex=${idx}; openProductGalleryLightbox('${product.id}')"
                  aria-label="تصویر ${idx + 1} محصول"
                >
                  ${
                    img
                      ? `<img src="${img}" alt="${product.title}" class="w-full h-full object-contain">`
                      : `<div class="w-full h-full flex items-center justify-center text-2xl">📦</div>`
                  }
                </button>
              `
                )
                .join('')}

              ${
                extraCount > 0
                  ? `
                <button
                  type="button"
                  class="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl glass flex items-center justify-center text-xs text-white/80 hover:bg-white/10"
                  onclick="state.productGalleryIndex=0; openProductGalleryLightbox('${product.id}')"
                >
                  +${extraCount} تصویر دیگر
                </button>
              `
                  : ''
              }
            </div>
          `
              : ''
          }
        </div>

        <!-- Info -->
        <div class="space-y-6">

          ${
            category
              ? `<span class="inline-block bg-violet-500/20 text-violet-400 px-4 py-1.5 rounded-full text-sm font-medium">${category.title}</span>`
              : ''
          }

          <h1 class="text-2xl md:text-3xl lg:text-4xl font-black leading-snug">${product.title}</h1>

          <div class="flex flex-wrap items-center gap-3 text-sm">
            <div class="flex items-center gap-2">
              ${utils.renderStars(Number(avgRating), 'text-base')}
              <span class="text-white/60 text-sm">(${avgRating})</span>
            </div>
            <span class="text-white/40 text-xs">| ${approvedReviews.length} نظر</span>
            ${
              discount > 0
                ? `<span class="text-xs px-2 py-1 rounded-full bg-rose-500/20 text-rose-300">-${discount}% تخفیف</span>`
                : ''
            }
          </div>

          <p class="text-white/70 leading-relaxed text-sm md:text-base">
            ${product.description || ''}
          </p>

          <!-- Price & stock & wishlist (desktop/tablet) -->
          <div class="glass rounded-2xl p-5 md:p-6 space-y-4 hidden md:block">
            <div class="flex items-center justify-between gap-4">
              <span class="text-white/60 text-sm">قیمت:</span>
              <div class="text-left">
                <span class="text-2xl md:text-3xl font-black text-emerald-400">${utils.formatPrice(
                  product.price
                )}</span>
                ${
                  product.original_price > product.price
                    ? `<span class="block text-xs md:text-sm price-original">${utils.formatPrice(
                        product.original_price
                      )}</span>`
                    : ''
                }
              </div>
            </div>

            <div class="flex items-center justify-between gap-4 text-sm">
              <span class="text-white/60">موجودی:</span>
              <span class="${inStock ? 'text-emerald-400' : 'text-rose-400'} font-semibold">
                ${inStock ? `${product.stock} عدد` : 'ناموجود'}
              </span>
            </div>

            <div class="flex items-center justify-between gap-4 text-sm">
              <span class="text-white/60">علاقه‌مندی:</span>
              <button 
                type="button"
                onclick="toggleWishlist('${product.id}')" 
                class="px-3 py-1.5 rounded-xl text-sm flex items-center gap-2 ${
                  inWishlist
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }"
                aria-pressed="${inWishlist ? 'true' : 'false'}"
              >
                <span>${inWishlist ? '❤️' : '🤍'}</span>
                <span>${inWishlist ? 'در لیست' : 'افزودن'}</span>
              </button>
            </div>

            <button
              type="button"
              class="btn-primary w-full mt-2 py-3 rounded-2xl text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed"
              onclick="addToCartFromProduct(${JSON.stringify({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image || product.main_image || ''
              })})"
              ${inStock ? '' : 'disabled'}
            >
              ${inStock ? 'افزودن به سبد خرید' : 'ناموجود'}
            </button>
          </div>
        </div>
      </div>

      <!-- Reviews -->
      <section class="mb-16">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg md:text-xl font-black flex items-center gap-2">
            <span>⭐</span>
            <span>نظرات کاربران</span>
          </h2>
          <span class="text-xs text-white/50">${approvedReviews.length} نظر ثبت شده</span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)] gap-6 lg:gap-10 items-start">
          <div>
            ${
              reviewTree.length
                ? reviewTree
                    .map(r => renderReviewItem(r, 0, product.id, { hideChildren: true }))
                    .join('')
                : `<p class="text-sm text-white/60">هنوز نظری برای این محصول ثبت نشده است.</p>`
            }
          </div>

          <div class="glass rounded-2xl p-4 md:p-5">
            <h3 class="text-sm md:text-base font-bold mb-3 flex items-center gap-2">
              <span>✍️</span>
              <span>ثبت نظر شما</span>
            </h3>

            ${
              isLoggedIn()
                ? `
              <form id="${reviewFormId}" class="space-y-3" onsubmit="submitReview(event, '${product.id}')">
                <div class="text-xs text-white/60">امتیاز شما به این محصول:</div>
                <div class="flex items-center gap-1 mb-2">
                  ${[1, 2, 3, 4, 5]
                    .map(
                      v => `
                    <button
                      type="button"
                      data-star="${v}"
                      onclick="setReviewRating('${reviewFormId}', '${product.id}', ${v})"
                      class="text-lg ${
                        currentDraftRating >= v ? 'text-amber-400' : 'text-white/30'
                      }"
                    >
                      ★
                    </button>
                  `
                    )
                    .join('')}
                  <input type="hidden" name="rating" value="${currentDraftRating}">
                </div>

                <textarea
                  name="text"
                  rows="4"
                  class="input-style w-full text-sm"
                  placeholder="تجربه خود از این محصول را بنویسید..."
                ></textarea>

                <button
                  type="submit"
                  class="btn-primary w-full py-2.5 rounded-xl text-sm font-bold"
                >
                  ارسال نظر
                </button>
              </form>
            `
                : `
              <div class="text-xs text-white/60">
                برای ثبت نظر ابتدا
                <button type="button" onclick="goTo('login')" class="text-violet-400 underline">
                  وارد شوید
                </button>
              </div>
            `
            }
          </div>
        </div>
      </section>

      <!-- Related products -->
      ${
        relatedProducts.length
          ? `
      <section class="mb-10">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg md:text-xl font-black flex items-center gap-2">
            <span>🛍️</span>
            <span>محصولات مرتبط</span>
          </h2>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          ${relatedProducts
            .map(
              p => `
            <button
              type="button"
              onclick="state.selectedProduct = ${JSON.stringify(p)}; goTo('product')"
              class="glass rounded-2xl p-3 flex flex-col items-stretch text-right hover:bg-white/5 transition-colors"
            >
              <div class="w-full aspect-[4/3] rounded-xl overflow-hidden bg-black/30 mb-3 flex items-center justify-center">
                ${
                  p.image || p.main_image
                    ? `<img src="${p.image || p.main_image}" alt="${p.title}" class="w-full h-full object-contain">`
                    : `<div class="text-4xl">📦</div>`
                }
              </div>
              <div class="text-xs text-white/70 line-clamp-2 mb-1">${p.title}</div>
              <div class="text-sm font-bold text-emerald-400">${utils.formatPrice(p.price)}</div>
            </button>
          `
            )
            .join('')}
        </div>
      </section>
      `
          : ''
      }

    </main>

    <!-- Mobile fixed add-to-cart bar -->
    <div class="fixed inset-x-0 bottom-0 z-[120] md:hidden">
      <div class="mx-auto max-w-7xl px-4 pb-4">
        <div class="glass-strong rounded-3xl px-4 py-3 flex items-center justify-between gap-3">
          <div class="flex flex-col">
            <span class="text-[11px] text-white/60 mb-0.5">قیمت</span>
            <div class="flex items-baseline gap-2">
              <span class="text-lg font-black text-emerald-400">${utils.formatPrice(
                product.price
              )}</span>
              ${
                product.original_price > product.price
                  ? `<span class="text-[11px] price-original">${utils.formatPrice(
                      product.original_price
                    )}</span>`
                  : ''
              }
            </div>
          </div>
          <button
            type="button"
            class="btn-primary flex-1 py-2.5 rounded-2xl text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed"
            onclick="addToCartFromProduct(${JSON.stringify({
              id: product.id,
              title: product.title,
              price: product.price,
              image: product.image || product.main_image || ''
            })})"
            ${inStock ? '' : 'disabled'}
          >
            ${inStock ? 'افزودن به سبد خرید' : 'ناموجود'}
          </button>
        </div>
      </div>
    </div>

    ${renderFooter()}
    ${renderReviewRepliesModal(product.id)}
    ${renderProductGalleryLightbox(product, gallery)}
  `;
}