// ═══════════════════════════════════════════════════════════════
// CRUD OPERATIONS PRODUCTS (GPT‑5 Refactor: safe + modular)
// File: assets/js/crud operations products.js
// ═══════════════════════════════════════════════════════════════

(function () {
  // Helper: sanitize string inputs
  function sanitize(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[<>]/g, '');
  }

  // Helper: normalize images input (array or comma-separated string)
  function normalizeImages(images) {
    if (Array.isArray(images)) return images.map(sanitize);
    if (typeof images === 'string') {
      return images
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .map(sanitize);
    }
    return [];
  }

  // Helper: pick known fields with alias support
  function normalizeProductFields(src) {
    const title = sanitize(src.title);
    const price = Number(src.price) || 0;
    const stock = Number(src.stock) || 0;
    const category = sanitize(src.category || '');
    const description = sanitize(src.description || '');
    const image = sanitize(src.main_image ?? src.image ?? '');
    const original_price = Number(src.original_price) || undefined;
    const images = normalizeImages(src.images);

    const out = {
      title,
      price,
      stock,
      category,
      description,
      images
    };

    // Only add image if present (keep previous schema intact)
    if (image) out.image = image;
    // Preserve original_price if provided
    if (Number.isFinite(original_price)) out.original_price = original_price;

    return out;
  }

  // Create product
  function createProduct(product) {
    const normalized = normalizeProductFields(product || {});
    const safeProduct = {
      id: utils.generateId(),
      ...normalized,
      created_at: new Date().toISOString()
    };

    state.products.push(safeProduct);
    toast('محصول جدید اضافه شد ✅');
    render();
    return safeProduct;
  }

  // Read products (with optional filter)
  function getProducts(filter = {}) {
    let result = [...state.products];
    if (filter.category) {
      result = result.filter(p => p.category === filter.category);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(q));
    }
    return result;
  }

  // Update product (accepts id or product object as first arg)
  function updateProduct(targetOrId, updates) {
    let product = null;

    if (targetOrId && typeof targetOrId === 'object' && targetOrId.id) {
      // Backward-compat: received the product object directly
      product = state.products.find(p => p.id === targetOrId.id);
    } else {
      // Original API: received the id
      product = state.products.find(p => p.id === targetOrId);
    }

    if (!product) {
      toast('محصول یافت نشد ❌');
      return null;
    }

    // Normalize incoming updates (support aliases)
    const normalized = normalizeProductFields(updates || {});

    // Apply only known keys, preserving non-mentioned fields
    Object.keys(normalized).forEach(key => {
      // Maintain previous schema: assign sanitized/normalized values
      product[key] = normalized[key];
    });

    toast('محصول بروزرسانی شد ✨');
    render();
    return product;
  }

  // Delete product
  function deleteProduct(id) {
    const index = state.products.findIndex(p => p.id === id);
    if (index === -1) {
      toast('محصول یافت نشد ❌');
      return false;
    }

    state.products.splice(index, 1);
    toast('محصول حذف شد 🗑️');
    render();
    return true;
  }

  // Expose to global scope
  window.createProduct = createProduct;
  window.getProducts = getProducts;
  window.updateProduct = updateProduct;
  window.deleteProduct = deleteProduct;
})();