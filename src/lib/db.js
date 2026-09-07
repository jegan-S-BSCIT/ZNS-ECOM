// Supabase-backed data access: auth, products, orders, customers.
import { getSupabase } from './supabaseClient';

const STAGES = ["Order Placed", "Confirmed", "Processing", "Packed", "Shipped", "Out for Delivery", "Delivered"];

// ── AUTH ──
export async function signUp(name, email, password, phone) {
  const { data, error } = await (await getSupabase()).auth.signUp({
    email,
    password,
    options: { data: { name, phone } }
  });
  if (error) throw error;
  return data.session;
}

export async function signIn(email, password) {
  const { data, error } = await (await getSupabase()).auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  const { error } = await (await getSupabase()).auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data } = await (await getSupabase()).auth.getSession();
  return data.session;
}

export async function onAuthStateChange(callback) {
  const { data } = (await getSupabase()).auth.onAuthStateChange((_event, session) => callback(session));
  return data.subscription;
}

export async function resetPassword(email) {
  const { error } = await (await getSupabase()).auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login`
  });
  if (error) throw error;
}

export function isAdminSession(session) {
  return session?.user?.app_metadata?.role === 'admin';
}

// ── PRODUCTS ──
function mapProductRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    originalPrice: row.original_price != null ? Number(row.original_price) : null,
    stockQuantity: row.stock_quantity,
    benefitLine: row.benefit_line,
    images: row.images || [],
    rating: row.rating != null ? Number(row.rating) : null,
    reviewCount: row.review_count || 0
  };
}

export async function fetchProducts() {
  const { data, error } = await (await getSupabase()).from('products').select('*').order('created_at');
  if (error) throw error;
  return data.map(mapProductRow);
}

// ── STORAGE (product photos) ──
export async function uploadProductImage(file) {
  const supabase = await getSupabase();
  const path = `${crypto.randomUUID()}-${file.name}`;
  const { error } = await supabase.storage.from('product-images').upload(path, file);
  if (error) throw error;
  return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
}

export async function deleteProduct(id) {
  const { error } = await (await getSupabase()).from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function upsertProduct(product) {
  const row = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    price: product.price,
    original_price: product.originalPrice,
    stock_quantity: product.stockQuantity,
    benefit_line: product.benefitLine,
    images: product.images || []
  };
  const { data, error } = await (await getSupabase()).from('products').upsert(row).select().single();
  if (error) throw error;
  return mapProductRow(data);
}

// ── ORDERS ──
function orderIdGen() {
  return `ZNS-${Math.floor(1000 + Math.random() * 9000)}`;
}

function formatOrderDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function mapOrderRow(row, items, history) {
  return {
    id: row.id,
    date: formatOrderDate(row.order_date),
    // Raw timestamp kept alongside the display string: the admin charts group by
    // calendar day and cannot parse '07 Sep 2026' reliably.
    orderDate: row.order_date,
    customerId: row.customer_id,
    customer: { name: row.buyer_name, email: row.buyer_email, phone: row.buyer_phone, isGuest: row.is_guest },
    address: {
      fullName: row.buyer_name,
      street: row.address_street,
      apartment: row.address_apartment,
      city: row.address_city,
      state: row.address_state,
      pincode: row.address_pincode
    },
    items: items.map(i => ({ id: i.product_id, name: i.name, price: Number(i.price), quantity: i.quantity, image: i.image })),
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping),
    discount: Number(row.discount),
    total: Number(row.total),
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    status: row.status,
    trackingNumber: row.tracking_number,
    statusHistory: history
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(h => ({ stage: h.stage, date: h.status_date, completed: h.completed, current: h.is_current }))
  };
}

async function hydrateOrders(orders) {
  if (!orders.length) return [];
  const ids = orders.map(o => o.id);
  const [{ data: items, error: e1 }, { data: history, error: e2 }] = await Promise.all([
    (await getSupabase()).from('order_items').select('*').in('order_id', ids),
    (await getSupabase()).from('order_status_history').select('*').in('order_id', ids)
  ]);
  if (e1) throw e1;
  if (e2) throw e2;
  return orders.map(o =>
    mapOrderRow(o, items.filter(i => i.order_id === o.id), history.filter(h => h.order_id === o.id))
  );
}

export async function fetchOrdersForCustomer(customerId) {
  if (!customerId) return [];
  const { data, error } = await (await getSupabase())
    .from('orders')
    .select('*')
    .eq('customer_id', customerId)
    .order('order_date', { ascending: false });
  if (error) throw error;
  return hydrateOrders(data);
}

export async function fetchAllOrders() {
  const { data, error } = await (await getSupabase()).from('orders').select('*').order('order_date', { ascending: false });
  if (error) throw error;
  return hydrateOrders(data);
}

export async function createOrder(orderData, customerId) {
  const { customer, address, items, subtotal, shipping, discount, total, paymentMethod, paymentStatus } = orderData;
  const id = orderIdGen();

  const { error: orderErr } = await (await getSupabase()).from('orders').insert({
    id,
    customer_id: customerId || null,
    buyer_name: address.fullName || customer.name,
    buyer_email: customer.email,
    buyer_phone: customer.phone,
    is_guest: !!customer.isGuest,
    address_street: address.street,
    address_apartment: address.apartment,
    address_city: address.city,
    address_state: address.state,
    address_pincode: address.pincode,
    subtotal,
    shipping,
    discount,
    total,
    payment_method: paymentMethod,
    payment_status: paymentStatus,
    status: 'Order Placed'
  });
  if (orderErr) throw orderErr;

  const { error: itemErr } = await (await getSupabase()).from('order_items').insert(
    items.map(i => ({ order_id: id, product_id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image }))
  );
  if (itemErr) throw itemErr;

  const historyRows = STAGES.map((stage, idx) => ({
    order_id: id,
    stage,
    status_date: idx === 0 ? new Date().toLocaleString() : 'Pending',
    completed: idx === 0,
    is_current: idx === 0,
    sort_order: idx
  }));
  const { error: histErr } = await (await getSupabase()).from('order_status_history').insert(historyRows);
  if (histErr) throw histErr;

  const placedAt = new Date().toISOString();
  return {
    id,
    date: formatOrderDate(placedAt),
    orderDate: placedAt,
    customer,
    address,
    items,
    subtotal,
    shipping,
    discount,
    total,
    paymentMethod,
    paymentStatus,
    status: 'Order Placed',
    statusHistory: historyRows.map(h => ({ stage: h.stage, date: h.status_date, completed: h.completed, current: h.is_current }))
  };
}

export async function updateOrderStatusRemote(orderId, newStatus) {
  const { error } = await (await getSupabase()).from('orders').update({ status: newStatus }).eq('id', orderId);
  if (error) throw error;

  const { data: history, error: histErr } = await (await getSupabase()).from('order_status_history').select('*').eq('order_id', orderId);
  if (histErr) throw histErr;

  // Cancelled is not a pipeline stage. Clear "current" from every stage rather
  // than bailing out, which used to leave the buyer's tracker stuck showing the
  // last stage as still in progress.
  const targetIdx = STAGES.indexOf(newStatus);
  if (targetIdx === -1) {
    await Promise.all(
      history.map(async h =>
        (await getSupabase()).from('order_status_history').update({ is_current: false }).eq('id', h.id)
      )
    );
    return;
  }

  await Promise.all(
    history.map(async h => {
      const idx = STAGES.indexOf(h.stage);
      const patch =
        idx < targetIdx
          ? { completed: true, is_current: false }
          : idx === targetIdx
          ? { completed: true, is_current: true, status_date: new Date().toLocaleString() }
          : { completed: false, is_current: false };
      return (await getSupabase()).from('order_status_history').update(patch).eq('id', h.id);
    })
  );
}

// ── CUSTOMERS (admin user management) ──
export async function fetchAllCustomers() {
  const { data, error } = await (await getSupabase()).from('customers').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// ── PROFILE & ACCOUNT SETTINGS ──
// The `customers` row is the profile. Name/phone are mirrored into auth user
// metadata so the header can render them straight off the session without a
// round-trip.
function mapProfileRow(row) {
  return {
    id: row.id,
    name: row.name || '',
    email: row.email || '',
    phone: row.phone || '',
    avatarUrl: row.avatar_url || '',
    dateOfBirth: row.date_of_birth || '',
    gender: row.gender || '',
    notifyOrders: row.notify_orders,
    notifyMarketing: row.notify_marketing
  };
}

export async function fetchProfile(customerId) {
  if (!customerId) return null;
  const { data, error } = await (await getSupabase())
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProfileRow(data) : null;
}

export async function updateProfile(customerId, patch) {
  const row = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.phone !== undefined) row.phone = patch.phone;
  if (patch.avatarUrl !== undefined) row.avatar_url = patch.avatarUrl || null;
  if (patch.dateOfBirth !== undefined) row.date_of_birth = patch.dateOfBirth || null;
  if (patch.gender !== undefined) row.gender = patch.gender || null;
  if (patch.notifyOrders !== undefined) row.notify_orders = patch.notifyOrders;
  if (patch.notifyMarketing !== undefined) row.notify_marketing = patch.notifyMarketing;

  const { data, error } = await (await getSupabase())
    .from('customers')
    .update(row)
    .eq('id', customerId)
    .select()
    .single();
  if (error) throw error;

  // Keep the session copy in step so the header/checkout prefill stay correct.
  if (patch.name !== undefined || patch.phone !== undefined) {
    const { error: authErr } = await (await getSupabase()).auth.updateUser({
      data: { name: data.name, phone: data.phone }
    });
    if (authErr) throw authErr;
  }
  return mapProfileRow(data);
}

export async function changePassword(newPassword) {
  const { error } = await (await getSupabase()).auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function changeEmail(newEmail) {
  const { error } = await (await getSupabase()).auth.updateUser({ email: newEmail });
  if (error) throw error;
}

// ── SAVED ADDRESSES ──
function mapAddressRow(row) {
  return {
    id: row.id,
    label: row.label,
    fullName: row.full_name,
    phone: row.phone || '',
    street: row.street,
    apartment: row.apartment || '',
    city: row.city,
    state: row.state || '',
    pincode: row.pincode,
    isDefault: row.is_default
  };
}

function toAddressRow(address, customerId) {
  return {
    customer_id: customerId,
    label: address.label || 'Home',
    full_name: address.fullName,
    phone: address.phone || null,
    street: address.street,
    apartment: address.apartment || null,
    city: address.city,
    state: address.state || null,
    pincode: address.pincode,
    is_default: !!address.isDefault
  };
}

export async function fetchAddresses(customerId) {
  if (!customerId) return [];
  const { data, error } = await (await getSupabase())
    .from('addresses')
    .select('*')
    .eq('customer_id', customerId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data.map(mapAddressRow);
}

// A partial unique index allows only one default row per customer, so the
// old default has to be cleared before the new one lands.
async function clearDefaultAddress(customerId, exceptId) {
  let q = (await getSupabase()).from('addresses').update({ is_default: false }).eq('customer_id', customerId).eq('is_default', true);
  if (exceptId) q = q.neq('id', exceptId);
  const { error } = await q;
  if (error) throw error;
}

export async function saveAddress(address, customerId) {
  const isFirst = address.isDefault || (await fetchAddresses(customerId)).length === 0;
  if (isFirst) await clearDefaultAddress(customerId, address.id);

  const row = toAddressRow({ ...address, isDefault: isFirst }, customerId);
  const query = address.id
    ? (await getSupabase()).from('addresses').update(row).eq('id', address.id).select().single()
    : (await getSupabase()).from('addresses').insert(row).select().single();

  const { data, error } = await query;
  if (error) throw error;
  return mapAddressRow(data);
}

export async function deleteAddress(addressId) {
  const { error } = await (await getSupabase()).from('addresses').delete().eq('id', addressId);
  if (error) throw error;
}

export async function setDefaultAddress(addressId, customerId) {
  await clearDefaultAddress(customerId, addressId);
  const { error } = await (await getSupabase()).from('addresses').update({ is_default: true }).eq('id', addressId);
  if (error) throw error;
}

// ── WISHLIST (synced per account) ──
export async function fetchWishlist(customerId) {
  if (!customerId) return [];
  const { data, error } = await (await getSupabase())
    .from('wishlist_items')
    .select('product_id')
    .eq('customer_id', customerId);
  if (error) throw error;
  return data.map(r => r.product_id);
}

export async function addWishlistItem(productId, customerId) {
  const { error } = await (await getSupabase())
    .from('wishlist_items')
    .upsert({ customer_id: customerId, product_id: productId });
  if (error) throw error;
}

export async function removeWishlistItem(productId, customerId) {
  const { error } = await (await getSupabase())
    .from('wishlist_items')
    .delete()
    .eq('customer_id', customerId)
    .eq('product_id', productId);
  if (error) throw error;
}

// Fold whatever the visitor saved while signed out into their account.
export async function mergeWishlist(localIds, customerId) {
  if (!localIds.length) return fetchWishlist(customerId);
  const { error } = await (await getSupabase())
    .from('wishlist_items')
    .upsert(localIds.map(id => ({ customer_id: customerId, product_id: id })));
  if (error) throw error;
  return fetchWishlist(customerId);
}
