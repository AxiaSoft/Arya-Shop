// ═══════════════════════════════════════════════════════════════
// PRODUCT DETAIL PAGE (GPT‑5 FINAL PRO)
// ═══════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────
// State init
// ───────────────────────────────────────────────────────────────
state.reviews = state.reviews || [];
state.wishlist = state.wishlist || [];
state.currentUser = state.currentUser || null;

// ───────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────
function isLoggedIn() {
  return !!state.currentUser;
}

function isInWishlist(productId) {
  return state.wishlist.includes(productId);
}

function toggleWishlist(productId) {
  if (isInWishlist(productId)) {
    state.wishlist = state.wishlist.filter(id => id !== productId);
    toast('از لیست علاقه‌مندی‌ها حذف شد', 'info');
  } else {
    state.wishlist.push(productId);
    toast('به لیست علاقه‌مندی‌ها اضافه شد', 'success');
  }
  render();
}

// ───────────────────────────────────────────────────────────────
// Reviews
// ───────────────────────────────────────────────────────────────
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
  render();
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
  render();
}

function toggleReviewVote(reviewId, type) {
  const r = state.reviews.find(x => x.id === reviewId);
  if (!r) return;

  if (type === 'like') r.likes++;
  if (type === 'dislike') r.dislikes++;

  render();
}

// ───────────────────────────────────────────────────────────────
// Render Review Item (recursive)
// ───────────────────────────────────────────────────────────────
function renderReviewItem(review, depth, productId) {
  const indent = Math.min(depth, 4);

  return `
    <div class="glass rounded-2xl p-4 mb-3 ml-${indent * 4}">
      
      <!-- Header -->
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">
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

      <!-- Text -->
      <p class="text-sm text-white/80 mb-3 leading-relaxed">${review.text}</p>

      <!-- Actions -->
      <div class="flex items-center justify-between text-xs text-white/50 mb-2">
        <div class="flex items-center gap-2">
          <button onclick="toggleReviewVote('${review.id}', 'like')" class="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 flex items-center gap-1">
            👍 <span>${review.likes}</span>
          </button>
          <button onclick="toggleReviewVote('${review.id}', 'dislike')" class="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 flex items-center gap-1">
            👎 <span>${review.dislikes}</span>
          </button>
        </div>

        <button onclick="this.parentElement.nextElementSibling.classList.toggle('hidden')" class="text-violet-400 hover:text-violet-300">
          پاسخ دادن
        </button>
      </div>

      <!-- Reply Form -->
      ${
        isLoggedIn()
          ? `
        <form class="hidden mt-3 space-y-2" onsubmit="submitReply(event, '${productId}', '${review.id}')">
          <textarea name="text" class="input-style w-full text-sm" rows="2" placeholder="پاسخ خود را بنویسید..."></textarea>
          <div class="flex justify-end">
            <button class="btn-primary px-4 py-2 rounded-xl text-xs">ارسال پاسخ</button>
          </div>
        </form>
        `
          : `
        <div class="mt-3 text-xs text-white/50">
          برای پاسخ دادن ابتدا 
          <button onclick="goTo('login')" class="text-violet-400 underline">وارد شوید</button>
        </div>
        `
      }

      <!-- Children -->
      ${review.children.map(c => renderReviewItem(c, depth + 1, productId)).join('')}
    </div>
  `;
}

// ───────────────────────────────────────────────────────────────
// PRODUCT PAGE
// ───────────────────────────────────────────────────────────────
function renderProductPage() {
  const product = state.selectedProduct;
  if (!product) return renderShopPage();

  const inStock = (product.stock || 0) > 0;
  const discount = utils.calculateDiscount(product.original_price, product.price);
  const category = state.categories.find(c => c.id === product.category);

  const allReviews = getProductReviews(product.id);
  const approvedReviews = allReviews.filter(r => r.status === 'approved');

  const ratings = approvedReviews.filter(r => r.rating > 0).map(r => r.rating);
  const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '0.0';

  const reviewTree = buildReviewTree(approvedReviews);

  const relatedProducts = state.products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const inWishlist = isInWishlist(product.id);

  return `
    ${renderHeader()}

    <main class="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">

      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-white/60 mb-8">
        <button onclick="goTo('home')" class="hover:text-white">خانه</button>
        <span>←</span>
        <button onclick="goTo('shop')" class="hover:text-white">فروشگاه</button>
        ${
          category
            ? `<span>←</span><button onclick="state.productFilter.category='${category.id}'; goTo('shop')" class="hover:text-white">${category.title}</button>`
            : ''
        }
        <span>←</span>
        <span class="text-white truncate max-w-[150px]">${product.title}</span>
      </nav>

      <!-- Product Details -->
      <div class="grid lg:grid-cols-2 gap-8 lg:gap-16 mb-16">

        <!-- Image -->
        <div class="glass rounded-3xl aspect-square overflow-hidden flex items-center justify-center">
          ${
            product.image
              ? `<img src="${product.image}" class="w-full h-full object-cover">`
              : `<div class="text-[8rem]">📦</div>`
          }
        </div>

        <!-- Info -->
        <div>

          ${
            category
              ? `<span class="inline-block bg-violet-500/20 text-violet-400 px-4 py-1.5 rounded-full text-sm font-medium mb-4">${category.title}</span>`
              : ''
          }

          <h1 class="text-3xl lg:text-4xl font-black mb-4">${product.title}</h1>

          <div class="flex items-center gap-4 mb-6">
            <div class="flex items-center gap-2">
              ${utils.renderStars(Number(avgRating), 'text-base')}
              <span class="text-white/60 text-sm">(${avgRating})</span>
              <span class="text-white/40 text-xs">| ${approvedReviews.length} نظر</span>
            </div>
          </div>

          <p class="text-white/70 leading-relaxed mb-8">${product.description || ''}</p>

          <!-- Price -->
          <div class="glass rounded-2xl p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
              <span class="text-white/60">قیمت:</span>
              <div>
                <span class="text-3xl font-black text-emerald-400">${utils.formatPrice(product.price)}</span>
                ${
                  product.original_price > product.price
                    ? `<span class="block text-sm price-original">${utils.formatPrice(product.original_price)}</span>`
                    : ''
                }
              </div>
            </div>

            <div class="flex items-center justify-between mb-3">
              <span class="text-white/60">موجودی:</span>
              <span class="${inStock ? 'text-emerald-400' : 'text-rose-400'} font-semibold">
                ${inStock ? `${product.stock} عدد` : 'ناموجود'}
              </span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-white/60">علاقه‌مندی:</span>
              <button onclick="toggleWishlist('${product.id}')" class="px-3 py-1.5 rounded-xl text-sm flex items-center gap-2 ${
                inWishlist ? 'bg-rose-500/20 text-rose-300' : 'bg-white/5 text-white/70 hover:bg-white/10'
              }">
                <span>${inWishlist ? '❤️' : '🤍'}</span>
                <span>${inWishlist ? 'در لیست' : 'افزودن'}</span>
              </button>
            </div>
          </div>

          <!-- Add to Cart -->
          <button onclick="addToCart(state.selectedProduct)" ${!inStock ? 'disabled' : ''} class="w-full btn-primary py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 mb-6">
            🛒 <span>${inStock ? 'افزودن به سبد خرید' : 'ناموجود'}</span>
          </button>

        </div>
      </div>

      <!-- Reviews -->
      <section class="mb-16">

        <h2 class="text-2xl font-bold mb-6">نظرات کاربران</h2>

        <!-- Add Review -->
        <div class="glass rounded-3xl p-5 mb-8">
          <h3 class="text-lg font-semibold mb-4">ثبت نظر شما</h3>

          ${
            !isLoggedIn()
              ? `
            <div class="text-center text-white/70 py-6">
              برای ثبت نظر ابتدا 
              <button onclick="goTo('login')" class="text-violet-400 underline">وارد شوید</button>
            </div>
            `
              : `
            <form onsubmit="submitReview(event, '${product.id}')" class="space-y-4">

              <div>
                <label class="block text-xs text-white/60 mb-1">امتیاز *</label>
                <div class="flex items-center gap-2">
                  ${[5,4,3,2,1].map(v => `
                    <label class="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name="rating" value="${v}" class="accent-amber-400">
                      <span class="text-xs text-white/70">${v}</span>
                    </label>
                  `).join('')}
                </div>
              </div>

              <div>
                <label class="block text-xs text-white/60 mb-1">متن نظر *</label>
                <textarea name="text" rows="3" class="input-style w-full text-sm" placeholder="نظر خود را بنویسید..."></textarea>
              </div>

              <p class="text-[11px] text-white/40">نظر شما پس از تأیید مدیر نمایش داده می‌شود.</p>

              <div class="flex justify-end">
                <button class="btn-primary px-6 py-3 rounded-xl text-sm font-semibold">ارسال نظر</button>
              </div>

            </form>
            `
          }
        </div>

        <!-- Reviews List -->
        ${
          reviewTree.length
            ? `<div class="space-y-3">${reviewTree.map(r => renderReviewItem(r, 0, product.id)).join('')}</div>`
            : `<div class="glass rounded-2xl p-8 text-center text-sm text-white/60">هنوز نظری ثبت نشده است.</div>`
        }

      </section>

      <!-- Related -->
      ${
        relatedProducts.length
          ? `
        <section>
          <h2 class="text-2xl font-bold mb-6">محصولات مرتبط</h2>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            ${relatedProducts.map((p, i) => renderProductCard(p, i)).join('')}
          </div>
        </section>
        `
          : ''
      }

    </main>

    ${renderFooter()}
  `;
}