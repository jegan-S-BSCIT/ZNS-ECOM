// Storage helper for Zen Nova Solutions cart & wishlist (LocalStorage).
// Auth, orders, products and customers now live in Supabase — see src/lib/db.js.

const KEYS = {
  CART: 'zennova_cart',
  WISHLIST: 'zennova_wishlist'
};

export function getItem(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('zennova_storage_update'));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

// ── CART ──
export function getStoredCart() {
  return getItem(KEYS.CART, []);
}
export function saveCart(cart) {
  setItem(KEYS.CART, cart);
}

// ── WISHLIST ──
export function getStoredWishlist() {
  return getItem(KEYS.WISHLIST, []);
}
export function saveWishlist(wishlist) {
  setItem(KEYS.WISHLIST, wishlist);
}
