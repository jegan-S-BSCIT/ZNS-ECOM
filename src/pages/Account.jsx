import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data/products';
import ProductCard from '../components/ProductCard';
import SmartImage from '../components/SmartImage';
import {
  updateProfile, changePassword, changeEmail,
  saveAddress, deleteAddress, setDefaultAddress
} from '../lib/db';

const TABS = [
  { id: 'orders', label: 'Orders' },
  { id: 'saved', label: 'Saved' },
  { id: 'profile', label: 'Profile' },
  { id: 'addresses', label: 'Addresses' },
  { id: 'settings', label: 'Settings' }
];

const STATUS_TONE = {
  Delivered: 'bg-spruce-100 text-spruce-800 border-spruce-600/25',
  Cancelled: 'bg-flag-100 text-flag-600 border-flag-600/25'
};

const EMPTY_ADDRESS = {
  label: 'Home', fullName: '', phone: '', street: '',
  apartment: '', city: '', state: '', pincode: '', isDefault: false
};

function Panel({ title, description, children, footer }) {
  return (
    <section className="card overflow-hidden">
      <header className="px-6 py-5 border-b border-rule">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        {description && <p className="mt-1 text-[13.5px] text-slate-600">{description}</p>}
      </header>
      <div className="p-6">{children}</div>
      {footer && <footer className="px-6 py-4 bg-mist-100 border-t border-rule">{footer}</footer>}
    </section>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="block mt-1.5 text-[12px] text-slate-400">{hint}</span>}
    </label>
  );
}

function Toggle({ checked, onChange, title, description, disabled }) {
  return (
    <label className="flex items-start gap-4 py-4 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`mt-0.5 shrink-0 w-11 h-6 rounded-full p-0.5 transition-colors disabled:opacity-50 ${
          checked ? 'bg-spruce-700' : 'bg-mist-300'
        }`}
      >
        <span
          className={`block w-5 h-5 rounded-full bg-white shadow-card transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
      <span>
        <span className="block text-[14px] font-medium">{title}</span>
        <span className="block mt-0.5 text-[13px] text-slate-600">{description}</span>
      </span>
    </label>
  );
}

/* ── Orders ──────────────────────────────────────────────────────── */
function OrdersTab({ orders, onReorder, navigate }) {
  if (!orders.length) {
    return (
      <Panel title="Orders" description="Every order you place while signed in shows up here.">
        <div className="py-10 text-center">
          <p className="text-slate-600">No orders yet.</p>
          <Link to="/shop" className="btn btn-primary mt-5">Browse the formulary</Link>
        </div>
      </Panel>
    );
  }

  return (
    <Panel title="Orders" description={`${orders.length} order${orders.length === 1 ? '' : 's'} on this account.`}>
      <ul className="space-y-4">
        {orders.map((order) => (
          <li key={order.id} className="rounded-xl border border-rule overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-mist-100 border-b border-rule">
              <div>
                <p className="font-mono text-[13px] font-semibold">{order.id}</p>
                <p className="font-mono text-[11.5px] text-slate-400">{order.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-1 rounded border font-mono text-[11px] tracking-wide ${
                    STATUS_TONE[order.status] || 'bg-amber-100 text-amber-700 border-amber-600/25'
                  }`}
                >
                  {order.status}
                </span>
                <span className="font-mono text-[15px] font-semibold text-spruce-800">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 p-4">
              <ul className="flex items-center gap-2">
                {order.items?.slice(0, 5).map((item, i) => (
                  <li key={i} className="media w-12 h-12 rounded-lg border border-rule" title={item.name}>
                    <SmartImage src={item.image} alt={item.name} sizes="48px" />
                  </li>
                ))}
                {order.items?.length > 5 && (
                  <li className="font-mono text-[12px] text-slate-400">+{order.items.length - 5}</li>
                )}
              </ul>

              <div className="flex gap-2">
                <button onClick={() => onReorder(order)} className="btn btn-ghost btn-sm">Buy again</button>
                <button
                  onClick={() => navigate(`/order-tracking/${order.id}`)}
                  className="btn btn-primary btn-sm"
                >
                  Track
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ── Profile ─────────────────────────────────────────────────────── */
function ProfileTab({ profile, user, setProfile, showToast }) {
  const [form, setForm] = useState({ name: '', phone: '', dateOfBirth: '', gender: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      name: profile?.name || user?.name || '',
      phone: profile?.phone || '',
      dateOfBirth: profile?.dateOfBirth || '',
      gender: profile?.gender || ''
    });
  }, [profile, user?.name]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await updateProfile(user.id, form);
      setProfile(saved);
      showToast('Profile saved', 'success');
    } catch (err) {
      showToast(err.message || 'Could not save your profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <form onSubmit={submit}>
      <Panel
        title="Profile"
        description="Used to address your orders and personalise recommendations."
        footer={
          <div className="flex items-center justify-between gap-4">
            <p className="text-[12.5px] text-slate-400">Saved to your account, not just this device.</p>
            <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        }
      >
        <div className="grid sm:grid-cols-2 gap-5 max-w-2xl">
          <Field label="Full name">
            <input
              type="text"
              required
              value={form.name || ''}
              onChange={set('name')}
              className="field"
              autoComplete="name"
            />
          </Field>

          <Field label="Mobile number" hint="For delivery updates only.">
            <input
              type="tel"
              value={form.phone || ''}
              onChange={set('phone')}
              placeholder="+91 98765 43210"
              className="field"
              autoComplete="tel"
            />
          </Field>

          <Field label="Date of birth" hint="We send a birthday credit.">
            <input
              type="date"
              value={form.dateOfBirth || ''}
              onChange={set('dateOfBirth')}
              max={new Date().toISOString().slice(0, 10)}
              className="field"
            />
          </Field>

          <Field label="Gender">
            <select value={form.gender || ''} onChange={set('gender')} className="field">
              <option value="">Not specified</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </Field>

          <div className="sm:col-span-2">
            <Field label="Email address" hint="Change your sign-in email under Settings.">
              <input type="email" value={user?.email || ''} disabled className="field" />
            </Field>
          </div>
        </div>
      </Panel>
    </form>
  );
}

/* ── Addresses ───────────────────────────────────────────────────── */
function AddressForm({ initial, customerId, onDone, onCancel, showToast }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!/^[1-9][0-9]{5}$/.test(form.pincode.trim())) {
      setError('Enter a valid 6-digit Indian PIN code.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await saveAddress({ ...form, pincode: form.pincode.trim() }, customerId);
      showToast(initial.id ? 'Address updated' : 'Address added', 'success');
      onDone();
    } catch (err) {
      showToast(err.message || 'Could not save the address', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-xl border border-spruce-600 bg-spruce-50 p-5 space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Label">
          <select value={form.label} onChange={set('label')} className="field">
            <option value="Home">Home</option>
            <option value="Work">Work</option>
            <option value="Other">Other</option>
          </select>
        </Field>

        <Field label="Recipient name">
          <input type="text" required value={form.fullName} onChange={set('fullName')} className="field" autoComplete="name" />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Street address">
            <input type="text" required value={form.street} onChange={set('street')} className="field" autoComplete="address-line1" />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Flat, floor, landmark">
            <input type="text" value={form.apartment} onChange={set('apartment')} className="field" autoComplete="address-line2" />
          </Field>
        </div>

        <Field label="City">
          <input type="text" required value={form.city} onChange={set('city')} className="field" autoComplete="address-level2" />
        </Field>

        <Field label="State">
          <input type="text" value={form.state} onChange={set('state')} className="field" autoComplete="address-level1" />
        </Field>

        <Field label="PIN code">
          <input
            type="text"
            required
            inputMode="numeric"
            maxLength={6}
            value={form.pincode}
            onChange={set('pincode')}
            aria-invalid={!!error}
            className="field font-mono"
            autoComplete="postal-code"
          />
        </Field>

        <Field label="Phone">
          <input type="tel" value={form.phone} onChange={set('phone')} className="field" autoComplete="tel" />
        </Field>
      </div>

      {error && <p className="text-[13px] text-flag-600">{error}</p>}

      <label className="flex items-center gap-2.5 text-[13.5px]">
        <input type="checkbox" checked={form.isDefault} onChange={set('isDefault')} className="w-4 h-4 accent-spruce-700" />
        Deliver here by default
      </label>

      <div className="flex gap-2.5">
        <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
          {saving ? 'Saving…' : initial.id ? 'Update address' : 'Add address'}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-ghost btn-sm">Cancel</button>
      </div>
    </form>
  );
}

function AddressesTab({ addresses, customerId, reload, showToast }) {
  const [editing, setEditing] = useState(null);

  const done = async () => {
    setEditing(null);
    await reload();
  };

  const remove = async (address) => {
    try {
      await deleteAddress(address.id);
      await reload();
      showToast('Address removed', 'info');
    } catch (err) {
      showToast(err.message || 'Could not remove the address', 'error');
    }
  };

  const makeDefault = async (address) => {
    try {
      await setDefaultAddress(address.id, customerId);
      await reload();
      showToast(`Default set to ${address.label}`, 'success');
    } catch (err) {
      showToast(err.message || 'Could not set the default', 'error');
    }
  };

  return (
    <Panel
      title="Addresses"
      description="Saved addresses appear at checkout, so you only type them once."
    >
      <div className="space-y-4">
        {editing && (
          <AddressForm
            key={editing.id || 'new'}
            initial={editing}
            customerId={customerId}
            onDone={done}
            onCancel={() => setEditing(null)}
            showToast={showToast}
          />
        )}

        {!addresses.length && !editing && (
          <div className="py-10 text-center">
            <p className="text-slate-600">No addresses saved yet.</p>
          </div>
        )}

        <ul className="grid sm:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <li key={address.id} className="rounded-xl border border-rule p-4 flex flex-col">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-slate-600">
                  {address.label}
                </span>
                {address.isDefault && (
                  <span className="px-2 py-0.5 rounded bg-spruce-100 text-spruce-800 font-mono text-[10px] tracking-wide uppercase">
                    Default
                  </span>
                )}
              </div>

              <address className="mt-2.5 not-italic text-[13.5px] leading-relaxed text-slate-700">
                <span className="block font-medium text-ink-800">{address.fullName}</span>
                {address.street}
                {address.apartment && `, ${address.apartment}`}
                <br />
                {address.city}
                {address.state && `, ${address.state}`}{' '}
                <span className="font-mono">{address.pincode}</span>
                {address.phone && (
                  <>
                    <br />
                    <span className="font-mono text-[12.5px] text-slate-400">{address.phone}</span>
                  </>
                )}
              </address>

              <div className="mt-4 pt-3 border-t border-rule flex flex-wrap gap-x-4 gap-y-2 text-[12.5px]">
                <button onClick={() => setEditing(address)} className="text-spruce-800 hover:underline">Edit</button>
                {!address.isDefault && (
                  <button onClick={() => makeDefault(address)} className="text-spruce-800 hover:underline">
                    Set as default
                  </button>
                )}
                <button onClick={() => remove(address)} className="ml-auto text-slate-400 hover:text-flag-600">
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>

        {!editing && (
          <button onClick={() => setEditing({ ...EMPTY_ADDRESS })} className="btn btn-ghost">
            Add an address
          </button>
        )}
      </div>
    </Panel>
  );
}

/* ── Settings ────────────────────────────────────────────────────── */
function SettingsTab({ profile, user, setProfile, showToast, signOut }) {
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [password, setPassword] = useState({ next: '', confirm: '' });
  const [newEmail, setNewEmail] = useState('');
  const [busy, setBusy] = useState('');

  const savePref = async (key, value) => {
    setPrefsSaving(true);
    // Reflect the switch immediately; the write is small and reverts on failure.
    const previous = profile;
    setProfile({ ...profile, [key]: value });
    try {
      const saved = await updateProfile(user.id, { [key]: value });
      setProfile(saved);
    } catch (err) {
      setProfile(previous);
      showToast(err.message || 'Could not save that preference', 'error');
    } finally {
      setPrefsSaving(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (password.next.length < 8) {
      showToast('Use at least 8 characters.', 'error');
      return;
    }
    if (password.next !== password.confirm) {
      showToast('The two passwords do not match.', 'error');
      return;
    }
    setBusy('password');
    try {
      await changePassword(password.next);
      setPassword({ next: '', confirm: '' });
      showToast('Password changed', 'success');
    } catch (err) {
      showToast(err.message || 'Could not change the password', 'error');
    } finally {
      setBusy('');
    }
  };

  const submitEmail = async (e) => {
    e.preventDefault();
    setBusy('email');
    try {
      await changeEmail(newEmail);
      setNewEmail('');
      showToast('Confirm the change from the link sent to your new address.', 'info');
    } catch (err) {
      showToast(err.message || 'Could not change the email', 'error');
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="space-y-6">
      <Panel title="Notifications" description="Applies to every device you sign in on.">
        <div className="divide-y divide-rule -my-4">
          <Toggle
            checked={profile?.notifyOrders ?? true}
            disabled={prefsSaving}
            onChange={(v) => savePref('notifyOrders', v)}
            title="Order and delivery updates"
            description="Dispatch, out-for-delivery and delivered alerts by email and SMS."
          />
          <Toggle
            checked={profile?.notifyMarketing ?? true}
            disabled={prefsSaving}
            onChange={(v) => savePref('notifyMarketing', v)}
            title="The dispensary letter"
            description="One formulation note a month. Reformulations, restocks, nothing else."
          />
        </div>
      </Panel>

      <form onSubmit={submitPassword}>
        <Panel
          title="Password"
          description="Choose something at least 8 characters long."
          footer={
            <button type="submit" disabled={busy === 'password'} className="btn btn-primary btn-sm">
              {busy === 'password' ? 'Changing…' : 'Change password'}
            </button>
          }
        >
          <div className="grid sm:grid-cols-2 gap-5 max-w-xl">
            <Field label="New password">
              <input
                type="password"
                required
                minLength={8}
                value={password.next}
                onChange={(e) => setPassword((p) => ({ ...p, next: e.target.value }))}
                className="field"
                autoComplete="new-password"
              />
            </Field>
            <Field label="Confirm new password">
              <input
                type="password"
                required
                minLength={8}
                value={password.confirm}
                onChange={(e) => setPassword((p) => ({ ...p, confirm: e.target.value }))}
                className="field"
                autoComplete="new-password"
              />
            </Field>
          </div>
        </Panel>
      </form>

      <form onSubmit={submitEmail}>
        <Panel
          title="Sign-in email"
          description={`Currently ${user?.email}. We email a confirmation link before the change takes effect.`}
          footer={
            <button type="submit" disabled={busy === 'email'} className="btn btn-primary btn-sm">
              {busy === 'email' ? 'Sending…' : 'Change email'}
            </button>
          }
        >
          <div className="max-w-md">
            <Field label="New email address">
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="you@example.com"
                className="field"
                autoComplete="email"
              />
            </Field>
          </div>
        </Panel>
      </form>

      <Panel title="Session" description="Sign out of this browser.">
        <button onClick={signOut} className="btn btn-ghost">Sign out</button>
      </Panel>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────── */
export default function Account() {
  const {
    user, profile, setProfile, addresses, reloadAddresses,
    wishlist, orders, addToCart, showToast, signOut, authLoading, products
  } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const requested = searchParams.get('tab');
  const activeTab = TABS.some((t) => t.id === requested) ? requested : 'orders';

  useEffect(() => {
    if (!authLoading && !user) navigate('/login?next=/account', { replace: true });
  }, [authLoading, user, navigate]);

  const savedProducts = useMemo(
    () => wishlist.map((id) => products.find((p) => p.id === id)).filter(Boolean),
    [wishlist, products]
  );

  const reorder = (order) => {
    order.items?.forEach((item) => addToCart(item, item.quantity));
    showToast(`Added ${order.items.length} item${order.items.length === 1 ? '' : 's'} from ${order.id}`, 'success');
  };

  if (authLoading || !user) {
    return (
      <div className="shell py-20" role="status" aria-label="Loading your account">
        <div className="skeleton h-9 w-56 rounded-md" />
        <div className="skeleton h-64 w-full rounded-xl mt-8" />
      </div>
    );
  }

  return (
    <div className="shell py-10 lg:py-14">
      <header className="flex flex-wrap items-center gap-4 pb-6 border-b border-rule">
        <span className="w-14 h-14 shrink-0 grid place-items-center rounded-full bg-spruce-800 text-amber-500 font-mono text-xl uppercase">
          {user.name?.[0] || 'A'}
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-[clamp(1.6rem,3vw,2.1rem)] font-semibold leading-tight">
            {user.name}
          </h1>
          <p className="font-mono text-[12.5px] text-slate-600 truncate">{user.email}</p>
        </div>
        <button onClick={signOut} className="btn btn-ghost btn-sm ml-auto">Sign out</button>
      </header>

      <div className="grid lg:grid-cols-[13rem_1fr] gap-8 mt-8 items-start">
        <nav aria-label="Account sections" className="lg:sticky lg:top-32">
          <ul className="flex lg:flex-col gap-1 overflow-x-auto hide-scrollbar">
            {TABS.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <li key={tab.id} className="shrink-0">
                  <button
                    onClick={() => setSearchParams({ tab: tab.id })}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-[14px] font-medium transition-colors ${
                      isActive
                        ? 'bg-ink-800 text-white'
                        : 'text-slate-700 hover:bg-mist-300'
                    }`}
                  >
                    {tab.label}
                    {tab.id === 'saved' && wishlist.length > 0 && (
                      <span className={`ml-2 font-mono text-[11px] ${isActive ? 'text-amber-500' : 'text-slate-400'}`}>
                        {wishlist.length}
                      </span>
                    )}
                    {tab.id === 'orders' && orders.length > 0 && (
                      <span className={`ml-2 font-mono text-[11px] ${isActive ? 'text-amber-500' : 'text-slate-400'}`}>
                        {orders.length}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div>
          {activeTab === 'orders' && (
            <OrdersTab orders={orders} onReorder={reorder} navigate={navigate} />
          )}

          {activeTab === 'saved' && (
            <Panel
              title="Saved"
              description="Saved to your account, so it follows you to any device you sign in on."
            >
              {savedProducts.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-slate-600">Nothing saved yet.</p>
                  <Link to="/shop" className="btn btn-primary mt-5">Find something</Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} showBenefit={false} />
                  ))}
                </div>
              )}
            </Panel>
          )}

          {activeTab === 'profile' && (
            <ProfileTab profile={profile} user={user} setProfile={setProfile} showToast={showToast} />
          )}

          {activeTab === 'addresses' && (
            <AddressesTab
              addresses={addresses}
              customerId={user.id}
              reload={reloadAddresses}
              showToast={showToast}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              profile={profile}
              user={user}
              setProfile={setProfile}
              showToast={showToast}
              signOut={signOut}
            />
          )}
        </div>
      </div>
    </div>
  );
}
