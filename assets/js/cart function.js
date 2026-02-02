// ═══════════════════════════════════════════════════════════════
// CART FUNCTIONS
// ════════════════════════════════  ══════════════════════════════
function addToCart(product) {
  if (!product) return;
  
  const existingIndex = state.cart.findIndex(item => item.id === product.id);
  
  if (existingIndex >= 0) {
    if (state.cart[existingIndex].qty < (product.stock || 99)) {
      state.cart[existingIndex].qty++;
      toast('تعداد محصول افزایش یافت');
    } else {
      toast('موجودی انبار کافی نیست', 'warning');
      return;
    }
  } else {
    if ((product.stock || 0) <= 0) {
      toast('این محصول موجود نیست', 'warning');
      return;
    }
    
    state.cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      original_price: product.original_price,
      image: product.image,
      qty: 1
    });
    toast('به سبد خرید اضافه شد 🛒');
  }
  
  render();
}

function updateCartQuantity(productId, newQty) {
  const index = state.cart.findIndex(item => item.id === productId);
  
  if (index >= 0) {
    if (newQty <= 0) {
      state.cart.splice(index, 1);
      toast('محصول   ز سبد حذف شد', 'info');
    } else {
      const product = state.products.find(p => p.id === productId);
      if (product && newQty > (product.stock || 99)) {
        toast('موجودی انبار کافی نیست', 'warning');
        return;
      }
      state.cart[index].qty = newQty;
    }
    render();
  }
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(item => item.id !== productId);
  toast('محصول از سبد حذف شد', 'info');
  render();
}

function getCartTotal() {
  return state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function getCartOriginalTotal() {
  return state.cart.reduce((sum, item) => {
    const originalPrice = item.original_price || item.price;
    return sum + (originalPrice * item.qty);
  }, 0);
}

function getCartCount() {
  return state.cart.reduce((sum, item) => sum + item.qty, 0);
}

function getCartDiscount() {
  const original = getCartOriginalTotal();
  const current = getCartTotal();
  return original - current;
}