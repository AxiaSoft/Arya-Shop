// ═══════════════════════════════════════════════════════════════
// ADMIN PRODUCTS
// ═══════════════════════════════  ═══════════════════════════════

// فقط این نسخه از رندر لیست محصولات استفاده می‌شود
function renderAdminProductsEditor() {
  initProductDraft();
  if (state.editProduct) syncDraftFromEditing();

  return `
    <div class="animate-fade">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl lg:text-3xl font-black">محصولات (${state.products.length})</h1>
        <button 
          onclick="state.editProduct = {}; state.productDraft={title:'',category:'',price:0,stock:0,description:'',mainImage:'',gallery:[],original_price:0,_synced:null}; render()"
          class="btn-primary px-5 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold"
        >
          <span>+</span>
          <span>افزودن محصول</span>
        </button>
      </div>
      
      ${state.products.length > 0 ? `
        <div class="grid gap-4">
          ${state.products.map((product, i) => {
            const imgSrc = product.image || product.main_image || '';
            const hasImage = !!imgSrc;
            const price = Number(product.price || 0);
            const original = Number(product.original_price || 0);
            const hasDiscount = original > price && price > 0;
            const discountPercent = hasDiscount
              ? Math.round(((original - price) / original) * 100)
              : 0;

            return `
              <div class="glass rounded-2xl p-5 flex items-center gap-4 animate-fade" style="animation-delay: ${i * 0.05}s">
                <div class="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                  ${
                    hasImage
                      ? `<img src="${imgSrc}" alt="${product.title}" class="w-full h-full object-cover">`
                      : `<span class="text-3xl">📦</span>`
                  }
                </div>
                
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold truncate">${product.title}</h3>
                  <p class="text-white/60 text-sm">
                    ${state.categories.find(c => c.id === product.category)?.title || 'بدون دسته'}
                  </p>
                </div>
                
                <div class="text-left hidden sm:block">
                  ${
                    hasDiscount
                      ? `
                        <div class="flex items-center gap-2">
                          <span class="text-emerald-400 font-bold">${utils.formatPrice(price)}</span>
                          <span class="price-original text-xs">${utils.formatPrice(original)}</span>
                        </div>
                        <div class="mt-1">
                          <span class="badge badge-discount text-[10px]">${discountPercent}% تخفیف</span>
                        </div>
                      `
                      : `<p class="text-emerald-400 font-bold">${utils.formatPrice(price)}</p>`
                  }
                  <p class="text-xs text-white/60 mt-1">موجودی: ${product.stock || 0}</p>
                </div>
                
                <div class="flex gap-2">
                  <button 
                    onclick="state.editProduct = state.products.find(p => p.id === '${product.id}'); render()"
                    class="p-3 glass rounded-xl hover:bg-white/10 transition-all"
                    aria-label="ویرایش"
                  >
                    ✏️
                  </button>
                  <button 
                    onclick="
                      state.editProduct = null;
                      state.confirmModal = { 
                        type: 'delete-product', 
                        title: 'حذف محصول', 
                        message: 'آیا از حذف «${product.title}» مطمئن هستید؟', 
                        icon: '🗑️', 
                        confirmText: 'حذف', 
                        confirmClass: 'btn-danger', 
                        onConfirm: () => { 
                          deleteProduct('${product.id}');
                          state.confirmModal = null;
                          render();
                        } 
                      }; 
                      render();
                    "
                    class="p-3 glass rounded-xl hover:bg-rose-500/20 text-rose-400 transition-all"
                    aria-label="حذف"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : `
        <div class="glass rounded-3xl p-16 text-center">
          <div class="text-7xl mb-6 animate-float">📦</div>
          <h3 class="text-2xl font-bold mb-4">محصولی ثبت نشده است</h3>
          <p class="text-white/60 mb-6">اولین محصول خود را اضافه کنید</p>
          <button 
            onclick="state.editProduct = {}; state.productDraft={title:'',category:'',price:0,stock:0,description:'',mainImage:'',gallery:[],original_price:0,_synced:null}; render()"
            class="btn-primary px-8 py-4 rounded-xl font-bold"
          >
            افزودن محصول
          </button>
        </div>
      `}
    </div>
  `;
}

/* ========== Products: pro editor (sections, responsive, drag & drop) ========== */
function initProductDraft() {
  if (!state.productDraft) {
    state.productDraft = {
      title: '',
      category: '',
      price: 0,
      stock: 0,
      description: '',
      mainImage: '',
      gallery: [],
      original_price: 0,
      _synced: null
    };
  }
}

function syncDraftFromEditing() {
  const p = state.editProduct;
  if (!p) return;
  const d = state.productDraft;
  if (d._synced === p.id) return;
  d.title = p.title || '';
  d.category = p.category || '';
  d.price = Number(p.price || 0);
  d.stock = Number(p.stock || 0);
  d.description = p.description || '';
  d.mainImage = p.main_image || p.image || '';
  d.gallery = Array.isArray(p.images) ? [...p.images] : [];
  d.original_price = Number(p.original_price || 0);
  d._synced = p.id;
}

function readImageFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

async function handleMainImageFiles(files) {
  const file = files[0];
  if (!file) return;
  const dataUrl = await readImageFile(file);
  state.productDraft.mainImage = dataUrl;
  toast('تصویر اصلی تنظیم شد', 'success');
  render();
}

async function handleGalleryFiles(files) {
  const allowed = Math.max(0, 10 - state.productDraft.gallery.length);
  const list = [...files].slice(0, allowed);
  for (const f of list) {
    const dataUrl = await readImageFile(f);
    state.productDraft.gallery.push(dataUrl);
  }
  if (list.length) toast(`${list.length} تصویر به گالری اضافه شد`, 'success');
  render();
}

function removeGalleryItem(i) {
  state.productDraft.gallery.splice(i, 1);
  render();
}

function moveGalleryItem(i, dir) {
  const g = state.productDraft.gallery;
  const ni = i + dir;
  if (ni < 0 || ni >= g.length) return;
  const [item] = g.splice(i, 1);
  g.splice(ni, 0, item);
  render();
}

function onMainImageChange(e) {
  const file = e.target.files?.[0];
  if (file) handleMainImageFiles([file]);
}

function onGalleryImageChange(e, i) {
  const file = e.target.files?.[0];
  if (!file) return;
  readImageFile(file).then(dataUrl => {
    state.productDraft.gallery[i] = dataUrl;
    toast('تصویر گالری تغییر کرد', 'info');
    render();
  });
}

function clearProductDraft() {
  state.productDraft = { 
    title:'', 
    category:'', 
    price:0, 
    stock:0, 
    description:'', 
    mainImage:'', 
    gallery:[], 
    original_price:0,
    _synced: null 
  };
  state.editProduct = null;
  render();
}

// دسته‌بندی دیگر اجباری نیست
function validateProductForm(formEl) {
  const title = (formEl.title.value || '').trim();
  const price = Number(formEl.price.value || 0);
  const stock = Number(formEl.stock.value || 0);

  const errors = [];
  if (!title) errors.push('نام محصول الزامی است.');
  if (price < 0) errors.push('قیمت نمی‌تواند منفی باشد.');
  if (stock < 0) errors.push('موجودی نمی‌تواند منفی باشد.');

  return { ok: errors.length === 0, errors };
}

function submitProductForm(formEl) {
  event.preventDefault();
  initProductDraft();
  const { ok, errors } = validateProductForm(formEl);
  if (!ok) { toast(errors[0], 'warning'); return; }

  const price = Number(formEl.price.value || 0);
  const original_price = Number(formEl.original_price.value || 0);

  const payload = {
    title: formEl.title.value.trim(),
    category: formEl.category.value || '',
    price,
    stock: Number(formEl.stock.value || 0),
    description: formEl.description.value || '',
    main_image: state.productDraft.mainImage,
    image: state.productDraft.mainImage,
    images: state.productDraft.gallery.filter(Boolean),
    original_price: original_price > 0 ? original_price : 0
  };

  if (state.editProduct && state.editProduct.id) {
    const updated = updateProduct(state.editProduct.id, payload);
    if (updated) toast('تغییرات محصول ذخیره شد ✨', 'success');
    clearProductDraft();
  } else {
    const created = createProduct(payload);
    if (created) toast('محصول ذخیره شد ✅', 'success');
    clearProductDraft();
  }
}

// ═══════════════════════════════════════════════════════════════
// PRODUCT MODAL
// ═══════════════════════════════════════════════════════════════
function renderProductModal() {
  const isEdit = state.editProduct && state.editProduct.id;
  const product = state.editProduct || {};

  initProductDraft();
  if (state.editProduct) syncDraftFromEditing();

  const d = state.productDraft;
  const price = d.price || product.price || 0;
  const original = d.original_price || product.original_price || 0;
  const hasDiscount = original > price && price > 0;
  const discountPercent = hasDiscount
    ? Math.round(((original - price) / original) * 100)
    : 0;
  
  return `
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay">
      <div class="glass-strong rounded-3xl p-6 lg:p-8 max-w-lg w-full max-h-[90%] overflow-y-auto animate-scale">
        <h2 class="text-xl font-black mb-6">
          ${isEdit ? '✏️ ویرایش محصول' : '➕ محصول جدید'}
        </h2>
        
        <form onsubmit="
          event.preventDefault();
          submitProductForm(this);
        ">
          
          <div class="space-y-5">
            <div>
              <label for="product-title" class="block text-sm text-white/70 mb-2">عنوان محصول *</label>
              <input 
                type="text" 
                id="product-title" 
                name="title" 
                required 
                value="${product.title || d.title || ''}"
                class="w-full input-style"
                placeholder="نام محصول را وارد کنید"
              >
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="product-price" class="block text-sm text-white/70 mb-2">قیمت (تومان) *</label>
                <input 
                  type="number" 
                  id="product-price" 
                  name="price" 
                  required 
                  value="${price || ''}"
                  class="w-full input-style"
                  dir="ltr"
                  placeholder="0"
                >
              </div>
              <div>
                <label for="product-original-price" class="block text-sm text-white/70 mb-2">قیمت اصلی (برای تخفیف)</label>
                <input 
                  type="number" 
                  id="product-original-price" 
                  name="original_price" 
                  value="${original || ''}"
                  class="w-full input-style"
                  dir="ltr"
                  placeholder="مثال: قیمت قبل از تخفیف"
                >
                ${
                  hasDiscount
                    ? `<p class="text-xs text-emerald-400 mt-1">${discountPercent}% تخفیف روی این محصول اعمال شده است</p>`
                    : `<p class="text-xs text-white/40 mt-1">در صورت وارد کردن قیمت اصلی بالاتر از قیمت فعلی، تخفیف محاسبه می‌شود.</p>`
                }
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="product-stock" class="block text-sm text-white/70 mb-2">موجودی *</label>
                <input 
                  type="number" 
                  id="product-stock" 
                  name="stock" 
                  required 
                  value="${product.stock || d.stock || ''}"
                  class="w-full input-style"
                  dir="ltr"
                  placeholder="0"
                >
              </div>
              <div>
                <label for="product-category" class="block text-sm text-white/70 mb-2">دسته‌بندی</label>
                <select 
                  id="product-category" 
                  name="category" 
                  class="w-full input-style"
                >
                  <option value="">بدون دسته</option>
                  ${state.categories.map(cat => `
                    <option value="${cat.id}" ${(product.category || d.category) === cat.id ? 'selected' : ''}>
                      ${cat.icon || ''} ${cat.title}
                    </option>
                  `).join('')}
                </select>
              </div>
            </div>

            <!-- تصویر اصلی: آپلود حرفه‌ای -->
            <div>
              <label class="block text-sm text-white/70 mb-2">تصویر اصلی محصول</label>
              <div 
                id="main-dropzone"
                class="glass rounded-2xl p-4 flex flex-col items-center justify-center gap-3 cursor-pointer border border-dashed border-white/20 hover:border-violet-400 transition"
                onclick="document.getElementById('main-image-input')?.click()"
              >
                ${
                  d.mainImage
                    ? `
                      <div class="w-full max-h-56 rounded-xl overflow-hidden mb-3">
                        <img src="${d.mainImage}" class="w-full h-full object-cover" alt="تصویر اصلی">
                      </div>
                      <div class="flex gap-2">
                        <button 
                          type="button" 
                          class="btn-ghost px-4 py-2 rounded-xl text-sm"
                          onclick="event.stopPropagation(); state.productDraft.mainImage=''; render();"
                        >
                          حذف تصویر
                        </button>
                        <button 
                          type="button" 
                          class="btn-primary px-4 py-2 rounded-xl text-sm"
                          onclick="event.stopPropagation(); document.getElementById('main-image-input')?.click()"
                        >
                          تغییر تصویر
                        </button>
                      </div>
                    `
                    : `
                      <div class="text-4xl">📷</div>
                      <p class="text-sm text-white/70 text-center">برای انتخاب تصویر اصلی کلیک کنید یا فایل را اینجا رها کنید</p>
                    `
                }
                <input 
                  id="main-image-input"
                  type="file" 
                  accept="image/*" 
                  class="hidden"
                  onchange="onMainImageChange(event)"
                >
              </div>
            </div>

            <!-- گالری تصاویر: آپلود حرفه‌ای -->
            <div>
              <label class="block text-sm text-white/70 mb-2">گالری تصاویر</label>
              
              <div class="flex gap-3 overflow-x-auto pb-2">
                ${
                  (d.gallery || []).length === 0
                    ? `<p class="text-white/40 text-sm">هنوز تصویری در گالری ثبت نشده است.</p>`
                    : d.gallery.map((img, i) => `
                        <div class="glass rounded-xl p-2 flex-shrink-0 w-32">
                          <div class="w-full h-24 rounded-lg overflow-hidden mb-2">
                            <img src="${img}" class="w-full h-full object-cover" alt="گالری">
                          </div>
                          <div class="flex items-center justify-between gap-1">
                            <button 
                              type="button" 
                              class="btn-ghost px-2 py-1 rounded-lg text-[10px]"
                              onclick="removeGalleryItem(${i})"
                            >
                              حذف
                            </button>
                            <div class="flex gap-1">
                              <button 
                                type="button" 
                                class="btn-ghost px-2 py-1 rounded-lg text-[10px]"
                                onclick="moveGalleryItem(${i}, -1)"
                              >
                                ◀
                              </button>
                              <button 
                                type="button" 
                                class="btn-ghost px-2 py-1 rounded-lg text-[10px]"
                                onclick="moveGalleryItem(${i}, 1)"
                              >
                                ▶
                              </button>
                            </div>
                          </div>
                        </div>
                      `).join('')
                }
              </div>

              <div 
                id="gallery-dropzone"
                class="glass rounded-2xl p-4 mt-3 flex flex-col items-center justify-center gap-3 cursor-pointer border border-dashed border-white/20 hover:border-violet-400 transition"
                onclick="document.getElementById('gallery-image-input')?.click()"
              >
                <div class="text-3xl">🖼️</div>
                <p class="text-sm text-white/70 text-center">برای افزودن تصاویر به گالری کلیک کنید یا فایل‌ها را اینجا رها کنید (حداکثر ۱۰ تصویر)</p>
                <input 
                  id="gallery-image-input"
                  type="file" 
                  accept="image/*" 
                  multiple
                  class="hidden"
                  onchange="handleGalleryFiles(this.files)"
                >
              </div>
            </div>
            
            <div>
              <label for="product-description" class="block text-sm text-white/70 mb-2">توضیحات</label>
              <textarea 
                id="product-description" 
                name="description" 
                rows="3" 
                class="w-full input-style resize-none"
                placeholder="توضیحات محصول..."
              >${product.description || d.description || ''}</textarea>
            </div>
          </div>
          
          <div class="flex gap-4 mt-8">
            ${
              isEdit
                ? `
                  <button 
                    type="button" 
                    class="flex-1 btn-danger py-4 rounded-xl font-semibold"
                    onclick="
                      state.confirmModal = {
                        type: 'delete-product',
                        title: 'حذف محصول',
                        message: 'آیا از حذف «${product.title}» مطمئن هستید؟',
                        icon: '🗑️',
                        confirmText: 'حذف',
                        confirmClass: 'btn-danger',
                        onConfirm: () => {
                          deleteProduct('${product.id}');
                          state.confirmModal = null;
                          state.editProduct = null;
                          render();
                        }
                      };
                      render();
                    "
                  >
                    حذف محصول
                  </button>
                `
                : ''
            }
            <button 
              type="button" 
              onclick="clearProductDraft()"
              class="flex-1 btn-ghost py-4 rounded-xl font-semibold"
            >
              انصراف
            </button>
            <button 
              type="submit" 
              class="flex-1 btn-primary py-4 rounded-xl font-semibold"
              ${state.loading ? 'disabled' : ''}
            >
              ${state.loading ? '⏳' : isEdit ? 'بروزرسانی' : 'ذخیره'}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}