import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data/products';

export default function OrderTracking() {
  const { orderId } = useParams();
  const { orders, addToCart, showToast } = useCart();

  const order = orders.find(o => o.id === orderId) || orders[0] || {
    id: "ZNS-9042",
    date: "04 Sep 2026",
    status: "Shipped",
    trackingNumber: "ZNS-TRK-882194",
    items: [],
    total: 1248,
    statusHistory: [
      { stage: "Order Placed", date: "04 Sep 2026 10:15 AM", completed: true },
      { stage: "Confirmed", date: "04 Sep 2026 10:16 AM", completed: true },
      { stage: "Processing", date: "04 Sep 2026 11:30 AM", completed: true },
      { stage: "Packed", date: "04 Sep 2026 03:00 PM", completed: true },
      { stage: "Shipped", date: "05 Sep 2026 09:00 AM", completed: true, current: true },
      { stage: "Out for Delivery", date: "Pending", completed: false },
      { stage: "Delivered", date: "Pending", completed: false }
    ]
  };

  const stages = [
    "Order Placed",
    "Confirmed",
    "Processing",
    "Packed",
    "Shipped",
    "Out for Delivery",
    "Delivered"
  ];

  const currentStageIndex = stages.indexOf(order.status) !== -1 ? stages.indexOf(order.status) : 4;

  const handleReorder = () => {
    order.items?.forEach(item => addToCart(item, item.quantity));
    showToast(`Items from Order ${order.id} re-added to cart!`, 'success');
  };

  const handleDownloadInvoice = () => {
    showToast(`Downloading Tax Invoice for ${order.id}...`, 'info');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between border-b border-[#E7DECF] pb-4">
        <div>
          <nav className="text-xs text-[#8E857E] flex items-center gap-2 mb-1">
            <Link to="/account" className="hover:text-[#6E2A45]">My Account</Link>
            <span>/</span>
            <Link to="/account?tab=orders" className="hover:text-[#6E2A45]">My Orders</Link>
            <span>/</span>
            <span className="text-[#2A2420] font-semibold">{order.id}</span>
          </nav>
          <h1 className="text-2xl font-bold text-[#6E2A45]">Order Tracker</h1>
        </div>

        <button
          onClick={handleDownloadInvoice}
          className="text-xs font-bold text-[#6E2A45] border border-[#6E2A45] px-3.5 py-2 rounded-lg hover:bg-[#F6EFF2] transition-colors"
        >
          📄 Download Invoice
        </button>
      </div>

      {/* Main Order Timeline Card */}
      <div className="bg-white rounded-2xl border border-[#E7DECF] p-6 sm:p-8 shadow-zen space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FBF8F4] p-4 rounded-xl border border-[#E7DECF]">
          <div>
            <span className="text-[11px] text-[#8E857E] uppercase font-bold tracking-wider">Current Live Status</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C1662E] animate-ping" />
              <h2 className="text-lg font-bold text-[#C1662E]">{order.status}</h2>
            </div>
          </div>
          {order.trackingNumber && (
            <div className="text-xs text-[#574F49]">
              <span className="block text-[10px] text-[#8E857E]">Carrier Tracking No:</span>
              <span className="font-mono font-bold text-[#2A2420]">{order.trackingNumber}</span>
            </div>
          )}
        </div>

        {/* 7-Stage Interactive Stepper (Section 22 requirement) */}
        <div className="py-4">
          <div className="relative flex items-center justify-between">
            {/* Background Connecting Line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#E7DECF] -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-1 bg-[#4F7A5B] -translate-y-1/2 z-0 transition-all duration-500"
              style={{ width: `${(currentStageIndex / (stages.length - 1)) * 100}%` }}
            />

            {/* Stepper Dots */}
            {stages.map((stage, idx) => {
              const isCompleted = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div key={stage} className="relative z-10 flex flex-col items-center group">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                      isCurrent
                        ? 'bg-[#C1662E] text-white ring-4 ring-[#C1662E]/20 scale-110'
                        : isCompleted
                        ? 'bg-[#4F7A5B] text-white'
                        : 'bg-[#E7DECF] text-[#8E857E]'
                    }`}
                  >
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`text-[10px] font-semibold mt-2 text-center max-w-[70px] hidden sm:block ${
                      isCurrent ? 'text-[#C1662E]' : isCompleted ? 'text-[#4F7A5B]' : 'text-[#8E857E]'
                    }`}
                  >
                    {stage}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="sm:hidden text-center text-xs font-bold text-[#C1662E] mt-4">
            Current Stage: {order.status} ({currentStageIndex + 1} of 7)
          </div>
        </div>

        {/* Order Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#E7DECF]">
          <button
            onClick={handleReorder}
            className="bg-[#C1662E] text-white text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-[#A35021] transition-colors"
          >
            Reorder Items
          </button>
          <Link
            to="/contact"
            className="border border-[#E7DECF] text-[#2A2420] text-xs font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50"
          >
            Contact Support
          </Link>
          {currentStageIndex <= 2 && (
            <button
              onClick={() => showToast('Cancellation request submitted to support', 'info')}
              className="text-xs text-[#A8402F] font-semibold hover:underline ml-auto"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
