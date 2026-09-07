import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  getStoredCart, saveCart,
  getStoredWishlist, saveWishlist
} from '../utils/storage';
import {
  getSession, onAuthStateChange, isAdminSession,
  signUp as dbSignUp, signIn as dbSignIn, signOut as dbSignOut,
  fetchOrdersForCustomer, createOrder,
  fetchProfile, fetchAddresses,
  mergeWishlist, addWishlistItem, removeWishlistItem,
  fetchProducts
} from '../lib/db';
import { mergeWithCatalogDetails } from '../data/products';

const CartContext = createContext();

const FREE_SHIPPING_THRESHOLD = 499;

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => getStoredCart());
  const [wishlist, setWishlist] = useState(() => getStoredWishlist());
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [toast, setToast] = useState(null);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);

  const toastTimer = useRef(null);

  const showToast = useCallback((message, type = 'success', action = null) => {
    clearTimeout(toastTimer.current);
    setToast({ message, type, action, key: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 4500);
  }, []);

  const dismissToast = useCallback(() => {
    clearTimeout(toastTimer.current);
    setToast(null);
  }, []);

  // Restore session on load, then react to sign-in/out. Both calls pull in the
  // Supabase client lazily, so this runs just after first paint rather than
  // blocking it.
  useEffect(() => {
    let active = true;
    let subscription;

    getSession()
      .then((s) => {
        if (active) setSession(s);
      })
      .catch((err) => console.error('Could not restore session:', err))
      .finally(() => {
        if (active) setAuthLoading(false);
      });

    onAuthStateChange((s) => { if (active) setSession(s); })
      .then((sub) => {
        if (active) subscription = sub;
        else sub.unsubscribe();
      })
      .catch((err) => console.error('Auth listener failed:', err));

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, []);

  // The full catalog is global, not per-account, so it loads once regardless
  // of sign-in state — this is what lets an admin's edits (including new
  // photos) show up on the storefront immediately.
  const reloadProducts = useCallback(async () => {
    const rows = (await fetchProducts()).map(mergeWithCatalogDetails);
    setProducts(rows);
    return rows;
  }, []);

  useEffect(() => {
    reloadProducts()
      .catch((err) => console.error('Failed to load products:', err))
      .finally(() => setProductsLoading(false));
  }, [reloadProducts]);

  const customerId = session?.user?.id ?? null;

  const reloadAddresses = useCallback(async () => {
    if (!customerId) return [];
    const rows = await fetchAddresses(customerId);
    setAddresses(rows);
    return rows;
  }, [customerId]);

  const reloadProfile = useCallback(async () => {
    if (!customerId) return null;
    const p = await fetchProfile(customerId);
    setProfile(p);
    return p;
  }, [customerId]);

  // Pull everything that belongs to the signed-in customer; reset on sign-out.
  useEffect(() => {
    if (!customerId) {
      setOrders([]);
      setProfile(null);
      setAddresses([]);
      setWishlist(getStoredWishlist());
      return;
    }
    let active = true;
    Promise.all([
      fetchOrdersForCustomer(customerId),
      fetchProfile(customerId),
      fetchAddresses(customerId),
      // Anything hearted while signed out follows the visitor into their account.
      mergeWishlist(getStoredWishlist(), customerId)
    ])
      .then(([o, p, a, w]) => {
        if (!active) return;
        setOrders(o);
        setProfile(p);
        setAddresses(a);
        setWishlist(w);
        saveWishlist(w);
      })
      .catch((err) => console.error('Failed to load account data:', err));
    return () => { active = false; };
  }, [customerId]);

  // Memoized on the primitives that actually determine identity — an object
  // literal recomputed every render (even with unchanged content) breaks any
  // effect that depends on `user`/`admin`, since the dependency looks "new"
  // every time and re-fires. That previously caused an infinite reload loop
  // on the admin dashboard once reloadData started touching context state.
  const user = useMemo(() => (
    session?.user
      ? {
          id: session.user.id,
          name: profile?.name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
          email: session.user.email,
          phone: profile?.phone || session.user.user_metadata?.phone || '',
          avatarUrl: profile?.avatarUrl || ''
        }
      : null
  ), [session?.user, profile]);

  const admin = useMemo(() => (
    isAdminSession(session) ? { email: session.user.email, role: 'Super Admin' } : null
  ), [session]);

  // ── Cart ──
  const addToCart = useCallback((product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      const next = existing
        ? prev.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
          )
        : [
            ...prev,
            {
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              originalPrice: product.originalPrice,
              image: product.images ? product.images[0] : product.image,
              quantity,
              stockQuantity: product.stockQuantity ?? 50
            }
          ];
      saveCart(next);
      return next;
    });
    showToast(`Added ${product.name} to bag`, 'success');
  }, [showToast]);

  const updateQuantity = useCallback((productId, newQuantity) => {
    setCart((prev) => {
      const next = newQuantity <= 0
        ? prev.filter((item) => item.id !== productId)
        : prev.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item));
      saveCart(next);
      return next;
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => {
      const removed = prev.find((i) => i.id === productId);
      const next = prev.filter((item) => item.id !== productId);
      saveCart(next);
      if (removed) {
        showToast(`Removed ${removed.name}`, 'info', {
          label: 'Undo',
          onClick: () =>
            setCart((current) => {
              if (current.some((i) => i.id === removed.id)) return current;
              const restored = [...current, removed];
              saveCart(restored);
              return restored;
            })
        });
      }
      return next;
    });
  }, [showToast]);

  const clearCart = useCallback(() => {
    setCart([]);
    saveCart([]);
  }, []);

  // ── Wishlist (Supabase when signed in, localStorage otherwise) ──
  const toggleWishlist = useCallback((product) => {
    const exists = wishlist.includes(product.id);
    const next = exists ? wishlist.filter((id) => id !== product.id) : [...wishlist, product.id];

    setWishlist(next);
    saveWishlist(next);
    showToast(exists ? `Removed ${product.name} from saved` : `Saved ${product.name}`, exists ? 'info' : 'success');

    if (customerId) {
      const write = exists ? removeWishlistItem(product.id, customerId) : addWishlistItem(product.id, customerId);
      write.catch((err) => {
        console.error('Wishlist sync failed:', err);
        setWishlist(wishlist);
        saveWishlist(wishlist);
        showToast('Could not save that. Check your connection and try again.', 'error');
      });
    }
  }, [wishlist, customerId, showToast]);

  const isInWishlist = useCallback((productId) => wishlist.includes(productId), [wishlist]);

  // ── Orders ──
  const placeOrder = useCallback(async (orderData) => {
    const newOrder = await createOrder(orderData, customerId);
    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  }, [customerId, clearCart]);

  // ── Auth ──
  const signUpUser = useCallback(async (name, email, password, phone) => {
    await dbSignUp(name, email, password, phone);
    showToast(`Welcome to Zen Nova, ${name}`, 'success');
  }, [showToast]);

  const signInUser = useCallback(async (email, password) => {
    const s = await dbSignIn(email, password);
    showToast('Signed in', 'success');
    return s;
  }, [showToast]);

  const logout = useCallback(async () => {
    await dbSignOut();
    saveWishlist([]);
    showToast('Signed out', 'info');
  }, [showToast]);

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );
  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const value = useMemo(() => ({
    products,
    productsLoading,
    reloadProducts,
    cart,
    cartCount,
    cartSubtotal,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    isFreeShipping: cartSubtotal >= FREE_SHIPPING_THRESHOLD,
    amountNeededForFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal),
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    wishlist,
    toggleWishlist,
    isInWishlist,
    orders,
    placeOrder,
    user,
    admin,
    profile,
    setProfile,
    addresses,
    setAddresses,
    reloadAddresses,
    reloadProfile,
    authLoading,
    signUpUser,
    signInUser,
    signOut: logout,
    toast,
    showToast,
    dismissToast,
    isMiniCartOpen,
    setIsMiniCartOpen
  }), [
    products, productsLoading, reloadProducts,
    cart, cartCount, cartSubtotal, addToCart, updateQuantity, removeFromCart, clearCart,
    wishlist, toggleWishlist, isInWishlist, orders, placeOrder, user, admin, profile,
    addresses, reloadAddresses, reloadProfile, authLoading, signUpUser, signInUser,
    logout, toast, showToast, dismissToast, isMiniCartOpen
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
