import { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../data/products';
import { useCart } from '../context/CartContext';

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast, signUpUser } = useCart();

  const order = location.state?.order || {
    id: "ZNS-9042",
    date: new Date().toLocaleDateString('en-IN'),
    customer: { name: "Valued Customer", email: "customer@example.com", isGuest: true },
    address: { fullName: "Valued Customer", street: "42 Park Street", city: "Mumbai", pincode: "400001" },
    items: [],
    total: 1248,
    paymentMethod: "UPI"
  };

  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Order ID copied to clipboard', 'info');
  };

  const handleCreateAccountInline = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;
    try {
      await signUpUser(order.customer.name, order.customer.email, password);
    } catch (err) {
      showToast(err.message || 'Account creation failed', 'error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      {/* Success Visual Banner */}
      <div className="bg-white rounded-2xl border border-[#E7DECF] p-8 text-center shadow-zen space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#EEF4F0] text-[#4F7A5B] flex items-center justify-center mx-auto text-3xl shadow-sm">
          ✓
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#6E2A45]">Order Placed Successfully!</h1>
        <p className="text-xs sm:text-sm text-[#574F49]">
          Thank you for shopping with Zen Nova Solutions. A confirmation email has been sent to{' '}
          <span className="font-semibold text-[#2A2420]">{order.customer?.email}</span>.
        </p>

        {/* Copyable Order ID Badge */}
        <div className="inline-flex items-center gap-3 bg-[#FBF8F4] px-4 py-2 rounded-xl border border-[#E7DECF] text-xs font-mono">
          <span className="text-[#8E857E]">Order ID:</span>
          <span className="font-bold text-[#6E2A45]">{order.id}</span>
          <button
            onClick={copyOrderId}
            className="text-[11px] font-sans text-[#C1662E] font-bold hover:underline"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Purchased Items & Delivery Summary */}
      <div className="bg-white rounded-2xl border border-[#E7DECF] p-6 shadow-zen space-y-6">
        <h3 className="font-bold text-sm text-[#6E2A45] pb-3 border-b border-[#E7DECF]">Order Details & Summary</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-[#574F49]">
          <div>
            <h4 className="font-bold text-[#2A2420] mb-1">Delivery Address</h4>
            <p className="font-semibold">{order.address?.fullName || order.customer?.name}</p>
            <p>{order.address?.street}, {order.address?.apartment}</p>
            <p>{order.address?.city}, {order.address?.state} - {order.address?.pincode}</p>
          </div>

          <div>
            <h4 className="font-bold text-[#2A2420] mb-1">Estimated Delivery</h4>
            <p className="text-[#4F7A5B] font-bold">2-4 Business Days</p>
            <p className="mt-2 font-bold text-[#2A2420]">Payment Method</p>
            <p>{order.paymentMethod} ({order.paymentStatus || 'Paid'})</p>
          </div>
        </div>

        {/* Line Items */}
        <div className="divide-y divide-[#E7DECF]/50 pt-2 border-t border-[#E7DECF]">
          {order.items?.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg border border-[#E7DECF]" />
                <div>
                  <h5 className="font-bold text-[#2A2420] line-clamp-1">{item.name}</h5>
                  <p className="text-[11px] text-[#8E857E]">Qty: {item.quantity}</p>
                </div>
              </div>
              <span className="font-bold text-[#6E2A45]">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-[#E7DECF] text-sm font-bold text-[#6E2A45]">
          <span>Total Order Value:</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      {/* Guest Account Creation Prompt */}
      {order.customer?.isGuest && (
        <div className="bg-[#F6EFF2] p-6 rounded-2xl border border-[#6E2A45]/20 space-y-3">
          <h4 className="font-bold text-xs text-[#6E2A45] uppercase tracking-wider">Fast-Track Future Orders</h4>
          <p className="text-xs text-[#574F49]">
            Create a password to save your delivery address, track live order status, and reorder formulas with one click.
          </p>
          <form onSubmit={handleCreateAccountInline} className="flex gap-2 max-w-md">
            <input
              type="password"
              placeholder="Set a secure password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border border-[#E7DECF] rounded-lg outline-none bg-white"
              required
            />
            <button type="submit" className="bg-[#6E2A45] text-white px-4 py-2 text-xs font-bold rounded-lg hover:bg-[#5C2239]">
              Create Account
            </button>
          </form>
        </div>
      )}

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => navigate(`/order-tracking/${order.id}`)}
          className="flex-1 bg-[#C1662E] text-white text-xs font-bold py-3.5 rounded-xl hover:bg-[#A35021] text-center shadow-md"
        >
          Track Live Order Status &rarr;
        </button>
        <Link
          to="/shop"
          className="flex-1 border border-[#6E2A45] text-[#6E2A45] text-xs font-bold py-3.5 rounded-xl hover:bg-[#F6EFF2] text-center"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
