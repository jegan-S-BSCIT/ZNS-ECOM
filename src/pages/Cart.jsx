import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data/products';

export default function Cart() {
  const {
    cart,
    cartSubtotal,
    cartCount,
    isFreeShipping,
    amountNeededForFreeShipping,
    freeShippingThreshold,
    updateQuantity,
    removeFromCart,
    toggleWishlist,
    showToast
  } = useCart();

  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedCouponName, setAppliedCouponName] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const code = couponCode.trim().toUpperCase();
    if (code === 'ZEN15' || code === 'FIRST15') {
      const disc = Math.round(cartSubtotal * 0.15);
      setAppliedDiscount(disc);
      setAppliedCouponName(code);
      showToast(`Coupon "${code}" applied! You saved 15%`, 'success');
    } else {
      showToast('Invalid coupon code. Try "ZEN15"', 'error');
    }
  };

  const shippingCost = isFreeShipping ? 0 : 70;
  const finalTotal = Math.max(0, cartSubtotal - appliedDiscount + shippingCost);
  const progressPct = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white p-10 sm:p-16 rounded-2xl border border-[#E7DECF] shadow-zen space-y-4">
          <div className="w-20 h-20 bg-[#F6EFF2] text-[#6E2A45] rounded-full flex items-center justify-center mx-auto text-3xl">
            🛍️
          </div>
          <h1 className="text-2xl font-bold text-[#2A2420]">Your cart is empty — let's fix that</h1>
          <p className="text-xs sm:text-sm text-[#8E857E] max-w-md mx-auto">
            Discover our clean hair care, skin care barrier serums, and daily wellness rituals.
          </p>
          <div className="pt-4">
            <Link
              to="/shop"
              className="inline-block bg-[#C1662E] text-white px-8 py-3 rounded-xl font-bold text-xs sm:text-sm hover:bg-[#A35021] transition-colors shadow-md"
            >
              Explore Formulations &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex items-center justify-between border-b border-[#E7DECF] pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#6E2A45]">
          Your Shopping Cart ({cartCount} {cartCount === 1 ? 'Item' : 'Items'})
        </h1>
        <Link to="/shop" className="text-xs font-semibold text-[#C1662E] hover:underline">
          &larr; Continue Shopping
        </Link>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="bg-[#FBF8F4] p-4 rounded-xl border border-[#E7DECF]">
        {isFreeShipping ? (
          <p className="text-xs font-bold text-[#4F7A5B] flex items-center gap-1.5">
            ✓ Congratulations! Your order qualifies for FREE Express Shipping!
          </p>
        ) : (
          <p className="text-xs text-[#2A2420]">
            Add <span className="font-bold text-[#C1662E]">{formatPrice(amountNeededForFreeShipping)}</span> more to unlock <span className="font-bold">FREE Shipping</span>
          </p>
        )}
        <div className="w-full bg-[#E7DECF] h-2 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-[#C1662E] h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Line Items (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E7DECF] shadow-zen overflow-hidden divide-y divide-[#E7DECF]">
            {cart.map((item) => (
              <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex gap-4 items-center flex-1">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl border border-[#E7DECF] shrink-0"
                  />
                  <div>
                    <Link to={`/product/${item.id}`} className="text-sm font-bold text-[#2A2420] hover:text-[#6E2A45] line-clamp-2">
                      {item.name}
                    </Link>
                    <p className="text-xs font-bold text-[#C1662E] mt-1">{formatPrice(item.price)}</p>
                  </div>
                </div>

                {/* Stepper + Total + Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E7DECF]/50">
                  {/* Stepper */}
                  <div className="flex items-center border border-[#E7DECF] rounded-lg bg-white">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1 text-xs font-bold text-[#2A2420] hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-bold text-[#2A2420]">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-1 text-xs font-bold text-[#2A2420] hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#6E2A45]">{formatPrice(item.price * item.quantity)}</span>
                  </div>

                  {/* Action Dropdown */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        toggleWishlist({ id: item.id, name: item.name });
                        removeFromCart(item.id);
                      }}
                      className="text-xs text-[#574F49] hover:text-[#6E2A45] underline"
                    >
                      Move to Wishlist
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-xs text-[#A8402F] font-semibold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary Panel (4 Cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#E7DECF] shadow-zen space-y-6">
          <h2 className="text-lg font-bold text-[#6E2A45] pb-3 border-b border-[#E7DECF]">Order Summary</h2>

          {/* Coupon Code Input */}
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <input
              type="text"
              placeholder="Promo Code (e.g. ZEN15)"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border border-[#E7DECF] rounded-lg outline-none uppercase focus:ring-1 focus:ring-[#C1662E]"
            />
            <button
              type="submit"
              className="bg-[#6E2A45] text-white px-4 py-2 text-xs font-bold rounded-lg hover:bg-[#5C2239]"
            >
              Apply
            </button>
          </form>

          {/* Totals Breakdown */}
          <div className="space-y-3 text-xs text-[#574F49] pt-2">
            <div className="flex justify-between">
              <span>Bag Subtotal:</span>
              <span className="font-semibold text-[#2A2420]">{formatPrice(cartSubtotal)}</span>
            </div>

            {appliedDiscount > 0 && (
              <div className="flex justify-between text-[#4F7A5B] font-semibold">
                <span>Discount ({appliedCouponName}):</span>
                <span>-{formatPrice(appliedDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Estimated Shipping:</span>
              <span className="font-semibold text-[#2A2420]">
                {isFreeShipping ? <span className="text-[#4F7A5B]">FREE</span> : formatPrice(shippingCost)}
              </span>
            </div>

            <div className="flex justify-between text-base font-bold text-[#6E2A45] pt-3 border-t border-[#E7DECF]">
              <span>Total Amount:</span>
              <span>{formatPrice(finalTotal)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-[#C1662E] text-white py-3.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-[#A35021] transition-colors shadow-md text-center block"
          >
            Proceed to Checkout &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
