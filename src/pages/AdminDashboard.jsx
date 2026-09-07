import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  upsertProduct, deleteProduct, uploadProductImage,
  fetchAllOrders, updateOrderStatusRemote,
  fetchAllCustomers, isAdminSession
} from '../lib/db';
import {
  ALL_STATUSES, CANCELLED,
  bucketByDay, ordersInRange, statusBreakdown, summarise, topProducts, trend
} from '../lib/orderStats';
import {
  RevenueTrendChart, OrderVolumeChart, StatusFunnelChart, TopProductsChart, RangeFilter
} from '../components/AdminCharts';
import {
  Icon, NavRail, Panel, StatCard, Toolbar, SearchInput, FilterSelect, IconButton,
  StatusPill, StockMeter, Table, THead, Th, Td, Tr, EmptyRow, Pagination, usePaged,
  Modal, ConfirmDialog, useSort, sortRows, orderTone, stockTone
} from '../components/AdminUI';
import { CATEGORIES, formatPrice } from '../data/products';
import logo from '../assets/logo.png';

const BLANK_PRODUCT_FORM = {
  name: '', category: 'skin-care', price: 499, originalPrice: 699, stockQuantity: 30, benefitLine: '', images: []
};

const LOW_STOCK_AT = 10;

const SECTIONS = [
  { id: 'dashboard', label: 'Overview',   icon: Icon.grid },
  { id: 'orders',    label: 'Orders',     icon: Icon.box },
  { id: 'products',  label: 'Products',   icon: Icon.flask },
  { id: 'inventory', label: 'Inventory',  icon: Icon.shelf },
  { id: 'customers', label: 'Customers',  icon: Icon.people },
  { id: 'categories',label: 'Categories', icon: Icon.tag }
];

const shortDate = (v) => {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v ?? '—') : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
};

export default function AdminDashboard() {
  const { admin, authLoading, signInUser, signOut, showToast, products, reloadProducts } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const requested = searchParams.get('tab');
  const activeTab = SECTIONS.some((s) => s.id === requested) ? requested : 'dashboard';
  const goTab = (id) => setSearchParams({ tab: id });

  // Admin auth
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  // Data
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Product editor
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(BLANK_PRODUCT_FORM);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  // Filters — shared by the funnel chart and the order table, so clicking a
  // stage on the overview actually lands on a filtered list.
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [rangeDays, setRangeDays] = useState(30);
  const [bulkStatus, setBulkStatus] = useState('');
  const [selectedOrders, setSelectedOrders] = useState([]);

  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  // Paging + sorting, per table
  const [orderPage, setOrderPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [customerPage, setCustomerPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [orderSort, toggleOrderSort] = useSort('date');
  const [productSort, toggleProductSort] = useSort('name', 'asc');
  const [customerSort, toggleCustomerSort] = useSort('joined');

  const reloadData = () => {
    setDataLoading(true);
    Promise.all([reloadProducts(), fetchAllOrders(), fetchAllCustomers()])
      .then(([, o, c]) => {
        setOrders(o);
        setCustomers(c);
      })
      .catch((err) => showToast(err.message || 'Failed to load admin data', 'error'))
      .finally(() => setDataLoading(false));
  };

  useEffect(() => {
    if (admin) reloadData();
  }, [admin]);

  // Any filter change puts you back on page one, or the list looks empty.
  useEffect(() => setOrderPage(1), [orderSearch, statusFilter, perPage]);
  useEffect(() => setProductPage(1), [productSearch, categoryFilter, stockFilter, perPage]);
  useEffect(() => setCustomerPage(1), [customerSearch, perPage]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setSigningIn(true);
    try {
      const session = await signInUser(adminEmail, adminPassword);
      if (!isAdminSession(session)) {
        await signOut();
        showToast('This account does not have admin access.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Invalid admin credentials', 'error');
    } finally {
      setSigningIn(false);
    }
  };

  if (authLoading) {
    return (
      <div className="shell py-20" role="status" aria-label="Loading the admin dashboard">
        <div className="skeleton h-9 w-56 rounded-md" />
        <div className="skeleton h-64 w-full rounded-xl mt-8" />
      </div>
    );
  }

  /* ── Sign-in gate ─────────────────────────────────────────────── */
  if (!admin) {
    return (
      <div className="min-h-[80vh] grid place-items-center px-4 py-14 bg-ink-900">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3">
            <img src={logo} alt="" className="w-10 h-10 object-contain rounded-lg" />
            <div>
              <p className="eyebrow text-amber-500/80 before:hidden">Back room</p>
              <h1 className="font-display text-[22px] font-semibold text-white leading-tight">Zen Nova operations</h1>
            </div>
          </div>

          <p className="text-[13.5px] text-white/55 mt-4 leading-relaxed">
            The catalog, the order book and the shelf counts live here. Sign in with an
            account that carries admin rights.
          </p>

          <form onSubmit={handleAdminLogin} className="mt-7 space-y-4">
            <div>
              <label htmlFor="admin-email" className="field-label text-white/50">Admin email</label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@zennova.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="field bg-ink-800 border-rule-dark text-white placeholder:text-white/30"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="field-label text-white/50">Password</label>
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="field bg-ink-800 border-rule-dark text-white placeholder:text-white/30"
              />
            </div>
            <button type="submit" disabled={signingIn} className="btn btn-accent w-full">
              {signingIn ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="font-mono text-[11px] text-white/35 mt-6 leading-relaxed">
            Admin rights are granted per account in Supabase — see the README for setup.
          </p>
        </div>
      </div>
    );
  }

  /* ── Actions ──────────────────────────────────────────────────── */
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatusRemote(orderId, newStatus);
      reloadData();
      showToast(`${orderId} moved to ${newStatus}`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update order status', 'error');
    }
  };

  const handleStockToggle = async (product) => {
    try {
      const newQty = product.stockQuantity === 0 ? 25 : 0;
      await upsertProduct({ ...product, stockQuantity: newQty });
      await reloadProducts();
      showToast(newQty === 0 ? `${product.name} marked out of stock` : `${product.name} restocked to 25`, 'info');
    } catch (err) {
      showToast(err.message || 'Failed to update stock', 'error');
    }
  };

  const confirmDeleteProduct = async () => {
    const product = pendingDelete;
    setPendingDelete(null);
    try {
      await deleteProduct(product.id);
      await reloadProducts();
      showToast(`${product.name} removed from the catalog`, 'info');
    } catch (err) {
      showToast(err.message || 'Failed to delete product', 'error');
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    setUploadingImage(true);
    try {
      const urls = await Promise.all(files.map(uploadProductImage));
      setProductForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    } catch (err) {
      showToast(err.message || 'Failed to upload photo', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeProductImage = (idx) =>
    setProductForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  const openProductEditor = (product = null) => {
    setEditingProduct(product);
    setProductForm(product ? {
      name: product.name,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      stockQuantity: product.stockQuantity,
      benefitLine: product.benefitLine || '',
      images: product.images || []
    } : BLANK_PRODUCT_FORM);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSavingProduct(true);
    try {
      const images = productForm.images.length
        ? productForm.images
        : ["https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80"];
      const productPayload = editingProduct
        ? { ...editingProduct, ...productForm, images }
        : {
            id: `custom-${Date.now()}`,
            slug: productForm.name.toLowerCase().replace(/\s+/g, '-'),
            ...productForm,
            rating: 4.8,
            reviewCount: 1,
            images
          };
      await upsertProduct(productPayload);
      await reloadProducts();
      setIsProductModalOpen(false);
      showToast(editingProduct ? 'Product updated' : 'Product published to the catalog', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save product', 'error');
    } finally {
      setSavingProduct(false);
    }
  };

  // Bulk-advance sequentially: each order rewrites its own status-history
  // rows, and hammering them in parallel half-applies and leaves trackers
  // inconsistent.
  const handleBulkStatus = async () => {
    if (!bulkStatus || !selectedOrders.length) return;
    try {
      for (const id of selectedOrders) await updateOrderStatusRemote(id, bulkStatus);
      showToast(`${selectedOrders.length} order${selectedOrders.length === 1 ? '' : 's'} moved to ${bulkStatus}`, 'success');
      setSelectedOrders([]);
      setBulkStatus('');
      reloadData();
    } catch (err) {
      showToast(err.message || 'Bulk update failed', 'error');
    }
  };

  const toggleSelected = (id) =>
    setSelectedOrders((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  /* ── Derived data ─────────────────────────────────────────────── */
  const lowStockCount = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity < LOW_STOCK_AT).length;
  const outOfStockCount = products.filter((p) => p.stockQuantity === 0).length;

  // Every tile and chart on the overview reads one range picker, so they can
  // never describe different slices of time.
  const analytics = useMemo(() => {
    const scoped = ordersInRange(orders, rangeDays);
    return {
      scoped,
      daily: bucketByDay(orders, rangeDays),
      totals: summarise(scoped),
      allTime: summarise(orders),
      funnel: statusBreakdown(scoped),
      best: topProducts(scoped),
      revenueTrend: trend(orders, rangeDays, (s) => s.revenue),
      orderTrend: trend(orders, rangeDays, (s) => s.orders)
    };
  }, [orders, rangeDays]);

  const visibleOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    const filtered = orders.filter((o) => {
      if (statusFilter && o.status !== statusFilter) return false;
      if (!q) return true;
      return [o.id, o.customer?.name, o.customer?.email, o.customer?.phone, o.address?.pincode]
        .some((v) => v && String(v).toLowerCase().includes(q));
    });
    return sortRows(filtered, orderSort, {
      id: (o) => o.id,
      date: (o) => new Date(o.date).getTime() || 0,
      customer: (o) => o.customer?.name || '',
      total: (o) => o.total || 0,
      status: (o) => o.status || ''
    });
  }, [orders, orderSearch, statusFilter, orderSort]);

  const visibleProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    const filtered = products.filter((p) => {
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (stockFilter === 'out' && p.stockQuantity !== 0) return false;
      if (stockFilter === 'low' && !(p.stockQuantity > 0 && p.stockQuantity < LOW_STOCK_AT)) return false;
      if (stockFilter === 'in' && p.stockQuantity < LOW_STOCK_AT) return false;
      if (!q) return true;
      return [p.name, p.category, p.benefitLine].some((v) => v && String(v).toLowerCase().includes(q));
    });
    return sortRows(filtered, productSort, {
      name: (p) => p.name,
      category: (p) => p.category,
      price: (p) => p.price,
      stock: (p) => p.stockQuantity
    });
  }, [products, productSearch, categoryFilter, stockFilter, productSort]);

  const orderCountByCustomer = useMemo(() => {
    const map = new Map();
    orders.forEach((o) => map.set(o.customerId, (map.get(o.customerId) || 0) + 1));
    return map;
  }, [orders]);

  const visibleCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    const filtered = customers.filter((c) =>
      !q || [c.name, c.email, c.phone].some((v) => v && String(v).toLowerCase().includes(q))
    );
    return sortRows(filtered, customerSort, {
      name: (c) => c.name || '',
      email: (c) => c.email || '',
      joined: (c) => new Date(c.created_at).getTime() || 0,
      orders: (c) => orderCountByCustomer.get(c.id) || 0
    });
  }, [customers, customerSearch, customerSort, orderCountByCustomer]);

  const lowStockProducts = useMemo(
    () => [...products].sort((a, b) => a.stockQuantity - b.stockQuantity),
    [products]
  );

  const orderPaging = usePaged(visibleOrders, orderPage, perPage);
  const productPaging = usePaged(visibleProducts, productPage, perPage);
  const customerPaging = usePaged(visibleCustomers, customerPage, perPage);

  const pageSelected = orderPaging.slice.filter((o) => selectedOrders.includes(o.id)).length;
  const allPageSelected = pageSelected > 0 && pageSelected === orderPaging.slice.length;

  const toggleSelectPage = () =>
    setSelectedOrders((prev) => {
      const ids = orderPaging.slice.map((o) => o.id);
      return allPageSelected ? prev.filter((id) => !ids.includes(id)) : [...new Set([...prev, ...ids])];
    });

  const exportOrdersCsv = () => {
    const head = ['Order ID', 'Date', 'Customer', 'Email', 'Phone', 'City', 'Pincode', 'Items', 'Payment', 'Payment Status', 'Status', 'Total'];
    // Quotes doubled per RFC 4180 so a comma or quote in an address can't shift columns.
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = visibleOrders.map((o) => [
      o.id, o.date, o.customer?.name, o.customer?.email, o.customer?.phone,
      o.address?.city, o.address?.pincode,
      (o.items || []).map((i) => `${i.name} x${i.quantity}`).join(' | '),
      o.paymentMethod, o.paymentStatus, o.status, o.total
    ].map(esc).join(','));
    const blob = new Blob([[head.map(esc).join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zennova-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${visibleOrders.length} order${visibleOrders.length === 1 ? '' : 's'}`, 'success');
  };

  const sectionItems = SECTIONS.map((s) => ({
    ...s,
    count: s.id === 'orders' ? orders.length
      : s.id === 'products' ? products.length
      : s.id === 'customers' ? customers.length
      : s.id === 'inventory' ? lowStockCount + outOfStockCount
      : undefined
  }));

  const activeSection = SECTIONS.find((s) => s.id === activeTab);

  return (
    <div className="bg-mist-200 min-h-screen">
      {/* Operations bar — the same ink band the storefront header wears, so
          the back room reads as the same shop rather than another product. */}
      <div className="bg-ink-900 text-white">
        <div className="shell flex flex-wrap items-center gap-4 py-4">
          <img src={logo} alt="" className="w-9 h-9 object-contain rounded-lg shrink-0" />
          <div className="min-w-0">
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-amber-500/80">Operations</p>
            <h1 className="font-display text-[19px] font-semibold leading-tight truncate">Zen Nova back room</h1>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={reloadData}
              disabled={dataLoading}
              className="btn btn-sm btn-on-dark"
            >
              <Icon.refresh className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{dataLoading ? 'Refreshing' : 'Refresh'}</span>
            </button>
            <button onClick={() => navigate('/')} className="btn btn-sm btn-on-dark">
              <Icon.store className="w-4 h-4" />
              <span className="hidden sm:inline">Storefront</span>
            </button>
            <button
              onClick={async () => { await signOut(); navigate('/login'); }}
              className="btn btn-sm btn-on-dark"
            >
              <Icon.logout className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="shell py-8 lg:py-10">
        <div className="grid lg:grid-cols-[13.5rem_1fr] gap-6 lg:gap-8 items-start">
          <NavRail items={sectionItems} active={activeTab} onSelect={goTab} />

          <main className="min-w-0 space-y-6">
            <header className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow text-slate-600">{activeSection.label}</p>
                <h2 className="font-display text-[clamp(1.5rem,3vw,1.95rem)] font-semibold leading-tight mt-1">
                  {activeTab === 'dashboard' && 'How the shop is trading'}
                  {activeTab === 'orders' && 'The order book'}
                  {activeTab === 'products' && 'The formulary'}
                  {activeTab === 'inventory' && 'What is on the shelf'}
                  {activeTab === 'customers' && 'Who is buying'}
                  {activeTab === 'categories' && 'Product families'}
                </h2>
              </div>
              {activeTab === 'dashboard' && <RangeFilter value={rangeDays} onChange={setRangeDays} />}
            </header>

            {/* ── OVERVIEW ─────────────────────────────────────────── */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                  <StatCard
                    label={`Revenue · ${rangeDays}d`}
                    value={formatPrice(analytics.totals.revenue)}
                    delta={analytics.revenueTrend}
                    icon={Icon.grid}
                    tone="accent"
                  />
                  <StatCard
                    label={`Orders · ${rangeDays}d`}
                    value={analytics.totals.orders}
                    delta={analytics.orderTrend}
                    icon={Icon.box}
                    tone="brand"
                  />
                  <StatCard
                    label="Average order"
                    value={formatPrice(analytics.totals.aov)}
                    hint={`${analytics.totals.units} unit${analytics.totals.units === 1 ? '' : 's'} sold`}
                    icon={Icon.tag}
                  />
                  <StatCard
                    label="Needs restocking"
                    value={lowStockCount + outOfStockCount}
                    hint={outOfStockCount ? `${outOfStockCount} already out of stock` : 'Nothing has run out'}
                    icon={Icon.shelf}
                    tone={lowStockCount + outOfStockCount ? 'alert' : 'default'}
                  />
                </div>

                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                  <StatCard label="Delivered" value={analytics.totals.delivered} icon={Icon.box} />
                  <StatCard
                    label="Cancelled"
                    value={analytics.totals.cancelled}
                    icon={Icon.close}
                    tone={analytics.totals.cancelled ? 'alert' : 'default'}
                  />
                  <StatCard label="Customers" value={customers.length} icon={Icon.people} />
                  <StatCard label="Catalog size" value={products.length} icon={Icon.flask} />
                </div>

                <RevenueTrendChart data={analytics.daily} />

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                  <OrderVolumeChart data={analytics.daily} />
                  <StatusFunnelChart
                    data={analytics.funnel}
                    selected={statusFilter}
                    onSelect={(st) => { setStatusFilter(st); goTab('orders'); }}
                  />
                </div>

                <TopProductsChart data={analytics.best} />

                {/* All-time context, so the range picker can't hide the real totals. */}
                <div className="card px-5 py-4 flex flex-wrap gap-x-8 gap-y-2 text-[12.5px] text-slate-700">
                  <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-slate-600 self-center">All time</span>
                  <span><b className="font-mono">{analytics.allTime.orders}</b> orders</span>
                  <span><b className="font-mono">{formatPrice(analytics.allTime.revenue)}</b> gross revenue</span>
                  <span><b className="font-mono">{analytics.allTime.cancelled}</b> cancelled</span>
                  <span><b className="font-mono">{products.length}</b> products listed</span>
                </div>
              </div>
            )}

            {/* ── ORDERS ───────────────────────────────────────────── */}
            {activeTab === 'orders' && (
              <Panel flush>
                <Toolbar>
                  <SearchInput
                    value={orderSearch}
                    onChange={setOrderSearch}
                    placeholder="Search order ID, buyer, phone or pincode"
                    className="w-full sm:w-80"
                  />
                  <FilterSelect
                    label="Filter by status"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={ALL_STATUSES}
                    allLabel="Any status"
                  />
                  {(orderSearch || statusFilter) && (
                    <button
                      onClick={() => { setOrderSearch(''); setStatusFilter(''); }}
                      className="text-[12.5px] font-medium text-slate-600 hover:text-ink-800 underline underline-offset-2"
                    >
                      Clear filters
                    </button>
                  )}
                  <button onClick={exportOrdersCsv} className="btn btn-ghost btn-sm ml-auto">
                    <Icon.download className="w-4 h-4" />
                    Export CSV
                  </button>
                </Toolbar>

                {/* Bulk bar appears only when there is something to act on. */}
                {selectedOrders.length > 0 && (
                  <div className="flex flex-wrap items-center gap-3 px-5 py-3 bg-spruce-50 border-b border-rule">
                    <p className="font-mono text-[12px] text-spruce-800">
                      {selectedOrders.length} selected
                    </p>
                    <FilterSelect
                      label="Move selected to"
                      value={bulkStatus}
                      onChange={setBulkStatus}
                      options={ALL_STATUSES}
                      allLabel="Move to…"
                    />
                    <button onClick={handleBulkStatus} disabled={!bulkStatus} className="btn btn-primary btn-sm">
                      Apply to {selectedOrders.length}
                    </button>
                    <button onClick={() => setSelectedOrders([])} className="btn btn-ghost btn-sm">
                      Clear selection
                    </button>
                  </div>
                )}

                <Table minWidth="960px">
                  <THead>
                    <Th width="44px">
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        onChange={toggleSelectPage}
                        aria-label="Select every order on this page"
                        className="w-3.5 h-3.5 accent-amber-600 cursor-pointer"
                      />
                    </Th>
                    <Th sortKey="id" sort={orderSort} onSort={toggleOrderSort}>Order</Th>
                    <Th sortKey="date" sort={orderSort} onSort={toggleOrderSort}>Placed</Th>
                    <Th sortKey="customer" sort={orderSort} onSort={toggleOrderSort}>Buyer</Th>
                    <Th>Ship to</Th>
                    <Th sortKey="total" sort={orderSort} onSort={toggleOrderSort} align="right">Total</Th>
                    <Th sortKey="status" sort={orderSort} onSort={toggleOrderSort}>Status</Th>
                    <Th width="90px">Actions</Th>
                  </THead>
                  <tbody>
                    {orderPaging.slice.map((o) => (
                      <Tr key={o.id} tone={orderTone(o.status)}>
                        <Td>
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(o.id)}
                            onChange={() => toggleSelected(o.id)}
                            aria-label={`Select order ${o.id}`}
                            className="w-3.5 h-3.5 accent-amber-600 cursor-pointer"
                          />
                        </Td>
                        <Td mono className="font-semibold text-spruce-800">{o.id}</Td>
                        <Td mono className="text-slate-600 text-[12px] whitespace-nowrap">{shortDate(o.date)}</Td>
                        <Td>
                          <p className="font-medium">{o.customer?.name || '—'}</p>
                          <p className="font-mono text-[11px] text-slate-600 truncate max-w-[190px]">{o.customer?.email}</p>
                          {o.customer?.isGuest && (
                            <span className="inline-block mt-1 font-mono text-[9.5px] tracking-[0.1em] uppercase text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                              Guest
                            </span>
                          )}
                        </Td>
                        <Td className="text-[12px] text-slate-600">
                          <span className="block max-w-[200px] line-clamp-2">
                            {[o.address?.city, o.address?.state].filter(Boolean).join(', ') || '—'}
                          </span>
                          {o.address?.pincode && <span className="font-mono text-[11px]">{o.address.pincode}</span>}
                        </Td>
                        <Td mono align="right" className="font-semibold">{formatPrice(o.total)}</Td>
                        <Td>
                          <select
                            value={o.status}
                            onChange={(e) => handleStatusChange(o.id, e.target.value)}
                            aria-label={`Status of order ${o.id}`}
                            className="field py-1.5 px-2 text-[12px] w-auto cursor-pointer"
                          >
                            {ALL_STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
                          </select>
                        </Td>
                        <Td>
                          <IconButton
                            label={`Open tracker for ${o.id}`}
                            icon={Icon.eye}
                            onClick={() => navigate(`/order-tracking/${o.id}`)}
                          />
                        </Td>
                      </Tr>
                    ))}
                    {orderPaging.total === 0 && (
                      <EmptyRow
                        colSpan={8}
                        title={orders.length ? 'No orders match these filters' : 'No orders yet'}
                        body={orders.length ? 'Clear the search or pick another status.' : 'Orders appear here the moment a customer checks out.'}
                      />
                    )}
                  </tbody>
                </Table>

                <Pagination
                  page={orderPaging.page}
                  pageCount={orderPaging.pageCount}
                  total={orderPaging.total}
                  start={orderPaging.start}
                  shown={orderPaging.slice.length}
                  perPage={perPage}
                  onPage={setOrderPage}
                  onPerPage={setPerPage}
                  noun="orders"
                />
              </Panel>
            )}

            {/* ── PRODUCTS ─────────────────────────────────────────── */}
            {activeTab === 'products' && (
              <Panel flush>
                <Toolbar>
                  <SearchInput
                    value={productSearch}
                    onChange={setProductSearch}
                    placeholder="Search products"
                    className="w-full sm:w-72"
                  />
                  <FilterSelect
                    label="Filter by category"
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    options={CATEGORIES.map((c) => ({ value: c.id, label: c.name }))}
                    allLabel="All categories"
                  />
                  <FilterSelect
                    label="Filter by stock"
                    value={stockFilter}
                    onChange={setStockFilter}
                    options={[
                      { value: 'in', label: 'Well stocked' },
                      { value: 'low', label: `Low (under ${LOW_STOCK_AT})` },
                      { value: 'out', label: 'Out of stock' }
                    ]}
                    allLabel="Any stock level"
                  />
                  <button onClick={() => openProductEditor()} className="btn btn-accent btn-sm ml-auto">
                    <Icon.plus className="w-4 h-4" />
                    Add product
                  </button>
                </Toolbar>

                <Table minWidth="820px">
                  <THead>
                    <Th sortKey="name" sort={productSort} onSort={toggleProductSort}>Product</Th>
                    <Th sortKey="category" sort={productSort} onSort={toggleProductSort}>Category</Th>
                    <Th sortKey="price" sort={productSort} onSort={toggleProductSort} align="right">Price</Th>
                    <Th sortKey="stock" sort={productSort} onSort={toggleProductSort}>Stock</Th>
                    <Th>Availability</Th>
                    <Th width="104px">Actions</Th>
                  </THead>
                  <tbody>
                    {productPaging.slice.map((p) => {
                      const tone = stockTone(p.stockQuantity, LOW_STOCK_AT);
                      return (
                        <Tr key={p.id} tone={tone}>
                          <Td>
                            <div className="flex items-center gap-3">
                              <span className="media w-10 h-10 rounded-lg shrink-0 border border-rule">
                                <img src={p.images?.[0] || p.image} alt="" loading="lazy" />
                              </span>
                              <div className="min-w-0">
                                <p className="font-medium line-clamp-1">{p.name}</p>
                                {p.benefitLine && (
                                  <p className="text-[11.5px] text-slate-600 line-clamp-1 max-w-[240px]">{p.benefitLine}</p>
                                )}
                              </div>
                            </div>
                          </Td>
                          <Td className="capitalize text-slate-700">{p.category.replace('-', ' ')}</Td>
                          <Td mono align="right" className="font-semibold">{formatPrice(p.price)}</Td>
                          <Td><StockMeter qty={p.stockQuantity} threshold={LOW_STOCK_AT} /></Td>
                          <Td>
                            <button onClick={() => handleStockToggle(p)} title="Toggle availability">
                              <StatusPill
                                tone={tone}
                                label={p.stockQuantity === 0 ? 'Out of stock' : tone === 'work' ? 'Low' : 'In stock'}
                              />
                            </button>
                          </Td>
                          <Td>
                            <div className="flex items-center gap-0.5">
                              <IconButton label={`Edit ${p.name}`} icon={Icon.edit} onClick={() => openProductEditor(p)} />
                              <IconButton label={`View ${p.name}`} icon={Icon.eye} onClick={() => navigate(`/product/${p.slug || p.id}`)} />
                              <IconButton label={`Delete ${p.name}`} icon={Icon.trash} tone="danger" onClick={() => setPendingDelete(p)} />
                            </div>
                          </Td>
                        </Tr>
                      );
                    })}
                    {productPaging.total === 0 && (
                      <EmptyRow
                        colSpan={6}
                        title="Nothing matches those filters"
                        body="Try a different category or stock level."
                      />
                    )}
                  </tbody>
                </Table>

                <Pagination
                  page={productPaging.page}
                  pageCount={productPaging.pageCount}
                  total={productPaging.total}
                  start={productPaging.start}
                  shown={productPaging.slice.length}
                  perPage={perPage}
                  onPage={setProductPage}
                  onPerPage={setPerPage}
                  noun="products"
                />
              </Panel>
            )}

            {/* ── INVENTORY ────────────────────────────────────────── */}
            {activeTab === 'inventory' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <StatCard label="Out of stock" value={outOfStockCount} icon={Icon.close} tone={outOfStockCount ? 'alert' : 'default'} />
                  <StatCard label={`Below ${LOW_STOCK_AT} units`} value={lowStockCount} icon={Icon.shelf} tone={lowStockCount ? 'accent' : 'default'} />
                  <StatCard
                    label="Units on hand"
                    value={products.reduce((n, p) => n + (p.stockQuantity || 0), 0)}
                    icon={Icon.box}
                    hint={`Across ${products.length} products`}
                  />
                </div>

                <Panel
                  title="Shelf counts"
                  description={`Sorted by what runs out first. The line on each bar is the ${LOW_STOCK_AT}-unit reorder point.`}
                  flush
                >
                  <Table minWidth="700px">
                    <THead>
                      <Th>Product</Th>
                      <Th>Category</Th>
                      <Th>On hand</Th>
                      <Th>Condition</Th>
                      <Th width="140px">Action</Th>
                    </THead>
                    <tbody>
                      {lowStockProducts.map((p) => {
                        const tone = stockTone(p.stockQuantity, LOW_STOCK_AT);
                        return (
                          <Tr key={p.id} tone={tone}>
                            <Td>
                              <div className="flex items-center gap-3">
                                <span className="media w-10 h-10 rounded-lg shrink-0 border border-rule">
                                  <img src={p.images?.[0] || p.image} alt="" loading="lazy" />
                                </span>
                                <p className="font-medium line-clamp-1 max-w-[240px]">{p.name}</p>
                              </div>
                            </Td>
                            <Td className="capitalize text-slate-700">{p.category.replace('-', ' ')}</Td>
                            <Td><StockMeter qty={p.stockQuantity} threshold={LOW_STOCK_AT} /></Td>
                            <Td>
                              <StatusPill
                                tone={tone}
                                label={p.stockQuantity === 0 ? 'Reorder now' : tone === 'work' ? 'Running low' : 'Healthy'}
                              />
                            </Td>
                            <Td>
                              <button onClick={() => handleStockToggle(p)} className="btn btn-ghost btn-sm">
                                {p.stockQuantity === 0 ? 'Restock 25' : 'Mark out'}
                              </button>
                            </Td>
                          </Tr>
                        );
                      })}
                      {products.length === 0 && (
                        <EmptyRow colSpan={5} title="No products in the catalog" body="Add a product to start tracking stock." />
                      )}
                    </tbody>
                  </Table>
                </Panel>
              </div>
            )}

            {/* ── CUSTOMERS ────────────────────────────────────────── */}
            {activeTab === 'customers' && (
              <Panel flush>
                <Toolbar>
                  <SearchInput
                    value={customerSearch}
                    onChange={setCustomerSearch}
                    placeholder="Search name, email or phone"
                    className="w-full sm:w-80"
                  />
                  <p className="font-mono text-[11.5px] text-slate-600 ml-auto">
                    {customers.length} registered
                  </p>
                </Toolbar>

                <Table minWidth="720px">
                  <THead>
                    <Th sortKey="name" sort={customerSort} onSort={toggleCustomerSort}>Customer</Th>
                    <Th sortKey="email" sort={customerSort} onSort={toggleCustomerSort}>Email</Th>
                    <Th>Phone</Th>
                    <Th sortKey="joined" sort={customerSort} onSort={toggleCustomerSort}>Joined</Th>
                    <Th sortKey="orders" sort={customerSort} onSort={toggleCustomerSort} align="right">Orders</Th>
                  </THead>
                  <tbody>
                    {customerPaging.slice.map((c) => {
                      const count = orderCountByCustomer.get(c.id) || 0;
                      return (
                        <Tr key={c.id} tone={count > 0 ? 'ok' : 'rest'}>
                          <Td>
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 shrink-0 grid place-items-center rounded-full bg-spruce-800 text-amber-500 font-mono text-[12px] uppercase">
                                {c.name?.[0] || '?'}
                              </span>
                              <p className="font-medium">{c.name || 'Unnamed'}</p>
                            </div>
                          </Td>
                          <Td mono className="text-[12px] text-slate-700">{c.email}</Td>
                          <Td mono className="text-[12px] text-slate-600">{c.phone || '—'}</Td>
                          <Td mono className="text-[12px] text-slate-600">{shortDate(c.created_at)}</Td>
                          <Td mono align="right" className="font-semibold">{count}</Td>
                        </Tr>
                      );
                    })}
                    {customerPaging.total === 0 && (
                      <EmptyRow
                        colSpan={5}
                        title={customers.length ? 'No customers match that search' : 'No registered customers yet'}
                        body={customers.length ? 'Try a different name or email.' : 'Guests who check out without an account are listed on their orders.'}
                      />
                    )}
                  </tbody>
                </Table>

                <Pagination
                  page={customerPaging.page}
                  pageCount={customerPaging.pageCount}
                  total={customerPaging.total}
                  start={customerPaging.start}
                  shown={customerPaging.slice.length}
                  perPage={perPage}
                  onPage={setCustomerPage}
                  onPerPage={setPerPage}
                  noun="customers"
                />
              </Panel>
            )}

            {/* ── CATEGORIES ───────────────────────────────────────── */}
            {activeTab === 'categories' && (
              <Panel
                title="Five fixed families"
                description="Categories are fixed in the catalog. Counts update as products move between them."
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {CATEGORIES.map((c) => {
                    const inFamily = products.filter((p) => p.category === c.id);
                    const short = inFamily.filter((p) => p.stockQuantity < LOW_STOCK_AT).length;
                    return (
                      <div
                        key={c.id}
                        className="card p-4 flex gap-4"
                        style={{ boxShadow: `inset 3px 0 0 var(--color-spruce-600)` }}
                      >
                        <span className="media w-14 h-14 rounded-lg shrink-0 border border-rule">
                          <img src={c.image} alt="" loading="lazy" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-display text-[15px] font-semibold">{c.name}</h3>
                            <span className="font-mono text-[11px] text-slate-600">{inFamily.length}</span>
                          </div>
                          <p className="text-[12.5px] text-slate-600 mt-0.5 line-clamp-2">{c.description}</p>
                          <button
                            onClick={() => { setCategoryFilter(c.id); setStockFilter(''); setProductSearch(''); goTab('products'); }}
                            className="mt-2 text-[12.5px] font-medium text-spruce-800 hover:text-spruce-600 underline underline-offset-2"
                          >
                            {short > 0 ? `${short} needs restocking` : 'View products'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Panel>
            )}
          </main>
        </div>
      </div>

      {/* ── Product editor ─────────────────────────────────────────── */}
      <Modal
        open={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? 'Edit product' : 'Add a product'}
        description={editingProduct ? editingProduct.name : 'It goes live on the storefront as soon as you publish.'}
      >
        <form onSubmit={handleSaveProduct}>
          <div className="grid md:grid-cols-[1.1fr_1fr] gap-5 p-5">
            {/* Details */}
            <div className="space-y-4">
              <div>
                <label htmlFor="p-name" className="field-label">Product name</label>
                <input
                  id="p-name"
                  type="text"
                  required
                  placeholder="e.g. Rosemary Root Serum"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="field"
                />
              </div>

              <div>
                <label htmlFor="p-category" className="field-label">Category</label>
                <select
                  id="p-category"
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="field cursor-pointer"
                >
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="p-price" className="field-label">Price (₹)</label>
                  <input
                    id="p-price"
                    type="number"
                    required
                    min="0"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="field font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="p-mrp" className="field-label">MRP (₹)</label>
                  <input
                    id="p-mrp"
                    type="number"
                    min="0"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                    className="field font-mono"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="p-stock" className="field-label">Units in stock</label>
                <input
                  id="p-stock"
                  type="number"
                  required
                  min="0"
                  value={productForm.stockQuantity}
                  onChange={(e) => setProductForm({ ...productForm, stockQuantity: Number(e.target.value) })}
                  className="field font-mono"
                />
                <p className="text-[11.5px] text-slate-600 mt-1.5">
                  Anything under {LOW_STOCK_AT} is flagged for restocking.
                </p>
              </div>

              <div>
                <label htmlFor="p-benefit" className="field-label">Benefit line</label>
                <input
                  id="p-benefit"
                  type="text"
                  placeholder="e.g. Reduces hair fall in 21 days"
                  value={productForm.benefitLine}
                  onChange={(e) => setProductForm({ ...productForm, benefitLine: e.target.value })}
                  className="field"
                />
                <p className="text-[11.5px] text-slate-600 mt-1.5">
                  One claim, shown under the name on the product card.
                </p>
              </div>
            </div>

            {/* Photos */}
            <div>
              <span className="field-label">Photos</span>
              <div className="grid grid-cols-3 gap-2">
                {productForm.images.map((src, idx) => (
                  <div key={src} className="media relative aspect-square rounded-lg border border-rule group">
                    <img src={src} alt="" />
                    <button
                      type="button"
                      onClick={() => removeProductImage(idx)}
                      aria-label={`Remove photo ${idx + 1}`}
                      className="absolute top-1 right-1 w-6 h-6 grid place-items-center rounded-full bg-ink-900/70 text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                    >
                      <Icon.close className="w-3.5 h-3.5" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 font-mono text-[9px] tracking-[0.1em] uppercase bg-ink-900/70 text-white px-1.5 py-0.5 rounded">
                        Cover
                      </span>
                    )}
                  </div>
                ))}

                <label className={`aspect-square rounded-lg border border-dashed border-rule grid place-items-center text-center cursor-pointer transition-colors hover:bg-mist-100 hover:border-spruce-600 ${
                  uploadingImage ? 'opacity-60 pointer-events-none' : ''
                }`}>
                  <span className="px-1">
                    <Icon.plus className="w-5 h-5 mx-auto text-slate-400" />
                    <span className="block font-mono text-[9.5px] tracking-[0.08em] uppercase text-slate-600 mt-1">
                      {uploadingImage ? 'Uploading' : 'Add'}
                    </span>
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-[11.5px] text-slate-600 mt-2">
                The first photo is the cover. Square images at 800px or larger look best.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 px-5 py-4 border-t border-rule bg-mist-100">
            <button type="button" onClick={() => setIsProductModalOpen(false)} className="btn btn-ghost btn-sm">
              Cancel
            </button>
            <button type="submit" disabled={savingProduct || uploadingImage} className="btn btn-accent btn-sm">
              {savingProduct ? 'Saving…' : editingProduct ? 'Save changes' : 'Publish product'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this product?"
        body={pendingDelete
          ? `"${pendingDelete.name}" will be removed from the catalog and the storefront. Past orders keep their record of it.`
          : ''}
        confirmLabel="Delete product"
        onConfirm={confirmDeleteProduct}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
