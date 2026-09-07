import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data/products';
import { saveAddress } from '../lib/db';

export default function Checkout() {
  const { cart, cartSubtotal, isFreeShipping, placeOrder, user, showToast, addresses, reloadAddresses } = useCart();
  const navigate = useNavigate();
  const [placingOrder, setPlacingOrder] = useState(false);

  // Form State
  const [customerInfo, setCustomerInfo] = useState({
    email: user ? user.email || '' : '',
    phone: user ? user.phone || '' : '',
    isGuest: !user
  });

  const [address, setAddress] = useState({
    fullName: user ? user.name || '' : '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const fillFromSaved = (a) => {
    setSelectedAddressId(a.id);
    setAddress({ fullName: a.fullName, street: a.street, apartment: a.apartment, city: a.city, state: a.state, pincode: a.pincode });
    if (a.phone) setCustomerInfo((c) => ({ ...c, phone: c.phone || a.phone }));
  };

  const startNewAddress = () => {
    setSelectedAddressId(null);
    setAddress({ fullName: user ? user.name || '' : '', street: '', apartment: '', city: '', state: '', pincode: '' });
  };

  // Prefill from the account's default saved address, once — so a returning
  // customer doesn't retype what they already saved on the Addresses tab.
  const prefilled = useRef(false);
  useEffect(() => {
    if (prefilled.current || !addresses.length) return;
    prefilled.current = true;
    fillFromSaved(addresses.find((a) => a.isDefault) || addresses[0]);
  }, [addresses]);

  const [shippingMethod, setShippingMethod] = useState('standard'); // 'standard' or 'express'
  const [paymentOption, setPaymentOption] = useState('upi'); // 'upi', 'card', 'netbanking', 'cod'
  const [upiId, setUpiId] = useState('');
  const [bank, setBank] = useState('HDFC Bank');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });

  const shippingCost = isFreeShipping ? 0 : (shippingMethod === 'express' ? 120 : 70);
  const codFee = paymentOption === 'cod' ? 40 : 0;
  const finalTotal = cartSubtotal + shippingCost + codFee;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!address.fullName || !address.street || !address.city || !address.pincode) {
      alert('Please fill in all required delivery address fields.');
      return;
    }

    setPlacingOrder(true);
    try {
      if (user) {
        try {
          const saved = await saveAddress({ ...address, id: selectedAddressId, phone: customerInfo.phone }, user.id);
          setSelectedAddressId(saved.id);
          await reloadAddresses();
        } catch (err) {
          console.error('Could not save address to account:', err);
        }
      }

      const orderObj = await placeOrder({
        customer: {
          name: address.fullName,
          email: customerInfo.email || 'guest@example.com',
          phone: customerInfo.phone || '+91 9876543210',
          isGuest: customerInfo.isGuest
        },
        address,
        items: cart,
        subtotal: cartSubtotal,
        shipping: shippingCost,
        discount: 0,
        total: finalTotal,
        paymentMethod: paymentOption.toUpperCase(),
        paymentStatus: paymentOption === 'cod' ? 'Pending' : 'Paid'
      });

      navigate('/order-confirmation', { state: { order: orderObj } });
    } catch (err) {
      showToast(err.message || 'Failed to place order', 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-[#6E2A45] mb-2">Your cart is empty</h2>
        <Link to="/shop" className="text-xs font-semibold text-[#C1662E] underline">
          Return to Shop &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header & Lock Indicator */}
      <div className="flex items-center justify-between border-b border-[#E7DECF] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#6E2A45]">Checkout</h1>
          <p className="text-xs text-[#574F49]">Complete your order in 3 simple steps</p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#4F7A5B] font-semibold bg-[#EEF4F0] px-3 py-1.5 rounded-full border border-[#4F7A5B]/20">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          256-Bit SSL Secure Checkout
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Steps (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* STEP 1: Customer Information */}
          <div className="bg-white p-6 rounded-2xl border border-[#E7DECF] shadow-zen space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E7DECF] pb-3">
              <span className="w-7 h-7 rounded-full bg-[#6E2A45] text-white text-xs font-bold flex items-center justify-center">1</span>
              <h2 className="text-base font-bold text-[#2A2420]">Customer Contact Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium mb-1 text-[#2A2420]">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  className="w-full p-2.5 border border-[#E7DECF] rounded-lg outline-none focus:ring-1 focus:ring-[#C1662E]"
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-[#2A2420]">Mobile Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  className="w-full p-2.5 border border-[#E7DECF] rounded-lg outline-none focus:ring-1 focus:ring-[#C1662E]"
                />
              </div>
            </div>
          </div>

          {/* STEP 2: Delivery Address */}
          <div className="bg-white p-6 rounded-2xl border border-[#E7DECF] shadow-zen space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E7DECF] pb-3">
              <span className="w-7 h-7 rounded-full bg-[#6E2A45] text-white text-xs font-bold flex items-center justify-center">2</span>
              <h2 className="text-base font-bold text-[#2A2420]">Shipping & Delivery Address</h2>
            </div>

            {user && addresses.length > 0 && (
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                {addresses.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => fillFromSaved(a)}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      selectedAddressId === a.id
                        ? 'border-[#C1662E] bg-[#FDF3EC] ring-1 ring-[#C1662E]'
                        : 'border-[#E7DECF] bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#2A2420]">{a.label}</span>
                      {a.isDefault && <span className="text-[10px] text-[#4F7A5B] font-semibold">Default</span>}
                    </div>
                    <p className="mt-1 text-[#574F49]">
                      {a.fullName}<br />
                      {a.street}{a.apartment && `, ${a.apartment}`}<br />
                      {a.city}{a.state && `, ${a.state}`} <span className="font-mono">{a.pincode}</span>
                    </p>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={startNewAddress}
                  className={`text-left p-3 rounded-xl border border-dashed transition-all ${
                    selectedAddressId === null ? 'border-[#C1662E] bg-[#FDF3EC]' : 'border-[#E7DECF] bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className="font-bold text-[#2A2420]">+ Deliver to a new address</span>
                </button>
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-medium mb-1 text-[#2A2420]">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter receiver's full name"
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  className="w-full p-2.5 border border-[#E7DECF] rounded-lg outline-none focus:ring-1 focus:ring-[#C1662E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1 text-[#2A2420]">Street Address / House No. *</label>
                  <input
                    type="text"
                    required
                    placeholder="Flat No, Building, Street"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    className="w-full p-2.5 border border-[#E7DECF] rounded-lg outline-none focus:ring-1 focus:ring-[#C1662E]"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-[#2A2420]">Landmark / Suite (Optional)</label>
                  <input
                    type="text"
                    placeholder="Near Park, Landmark"
                    value={address.apartment}
                    onChange={(e) => setAddress({ ...address, apartment: e.target.value })}
                    className="w-full p-2.5 border border-[#E7DECF] rounded-lg outline-none focus:ring-1 focus:ring-[#C1662E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium mb-1 text-[#2A2420]">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="Mumbai"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full p-2.5 border border-[#E7DECF] rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-[#2A2420]">State *</label>
                  <input
                    type="text"
                    required
                    placeholder="Maharashtra"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full p-2.5 border border-[#E7DECF] rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-[#2A2420]">Pincode *</label>
                  <input
                    type="text"
                    required
                    placeholder="400001"
                    maxLength={6}
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    className="w-full p-2.5 border border-[#E7DECF] rounded-lg outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3 & 4: Payment Options (UPI, Card, NetBanking, COD) */}
          <div className="bg-white p-6 rounded-2xl border border-[#E7DECF] shadow-zen space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E7DECF] pb-3">
              <span className="w-7 h-7 rounded-full bg-[#6E2A45] text-white text-xs font-bold flex items-center justify-center">3</span>
              <h2 className="text-base font-bold text-[#2A2420]">Payment Method</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {[
                { id: 'upi', name: 'UPI / QR', desc: 'GPay, PhonePe, Paytm' },
                { id: 'card', name: 'Card', desc: 'Credit / Debit' },
                { id: 'netbanking', name: 'NetBanking', desc: 'All Indian Banks' },
                { id: 'cod', name: 'Cash on Delivery', desc: 'Pay at Doorstep' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPaymentOption(opt.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    paymentOption === opt.id
                      ? 'border-[#C1662E] bg-[#FDF3EC] ring-1 ring-[#C1662E]'
                      : 'border-[#E7DECF] bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="font-bold text-[#2A2420]">{opt.name}</div>
                  <div className="text-[10px] text-[#8E857E] mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>

            {/* Dynamic Payment Option Forms */}
            {paymentOption === 'upi' && (
              <div className="p-4 bg-[#FBF8F4] rounded-xl border border-[#E7DECF] text-xs space-y-2">
                <label className="block font-medium">Enter VPA / UPI ID</label>
                <input
                  type="text"
                  placeholder="username@okaxis or mobile@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#E7DECF] rounded-lg outline-none"
                />
                <p className="text-[11px] text-[#8E857E]">A payment request will be sent to your UPI App.</p>
              </div>
            )}

            {paymentOption === 'card' && (
              <div className="p-4 bg-[#FBF8F4] rounded-xl border border-[#E7DECF] text-xs space-y-3">
                <div>
                  <label className="block font-medium mb-1">Card Number</label>
                  <input
                    type="text"
                    placeholder="4532 •••• •••• 8921"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#E7DECF] rounded-lg outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      placeholder="08/28"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      className="w-full p-2.5 bg-white border border-[#E7DECF] rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">CVV</label>
                    <input
                      type="password"
                      placeholder="•••"
                      maxLength={4}
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                      className="w-full p-2.5 bg-white border border-[#E7DECF] rounded-lg outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentOption === 'netbanking' && (
              <div className="p-4 bg-[#FBF8F4] rounded-xl border border-[#E7DECF] text-xs space-y-2">
                <label className="block font-medium">Select Your Bank</label>
                <select
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#E7DECF] rounded-lg outline-none"
                >
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="State Bank of India">State Bank of India (SBI)</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra">Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            {paymentOption === 'cod' && (
              <div className="p-4 bg-[#FDF3EC] rounded-xl border border-[#C1662E]/30 text-xs text-[#A35021]">
                <strong>Cash on Delivery:</strong> Nominal handling fee of ₹40 applies for COD orders. Pay cash or UPI at delivery.
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={placingOrder}
            className="w-full bg-[#C1662E] hover:bg-[#A35021] text-white py-4 rounded-xl font-bold text-sm sm:text-base transition-colors shadow-lg disabled:opacity-60"
          >
            {placingOrder ? 'Placing Order…' : <>Place Order ({formatPrice(finalTotal)}) &rarr;</>}
          </button>
        </div>

        {/* Right Sticky Order Summary (4 Cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#E7DECF] shadow-zen space-y-4 sticky top-24">
          <h3 className="font-bold text-sm text-[#6E2A45] pb-3 border-b border-[#E7DECF]">Order Items ({cart.length})</h3>

          <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-[#E7DECF]/50 pr-1">
            {cart.map((item) => (
              <div key={item.id} className="pt-2 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-md border border-[#E7DECF]" />
                  <div>
                    <p className="font-bold text-[#2A2420] line-clamp-1 max-w-[140px]">{item.name}</p>
                    <p className="text-[11px] text-[#8E857E]">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-bold text-[#6E2A45]">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-[#E7DECF] pt-4 space-y-2 text-xs text-[#574F49]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatPrice(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>{shippingCost === 0 ? <span className="text-[#4F7A5B] font-bold">FREE</span> : formatPrice(shippingCost)}</span>
            </div>
            {codFee > 0 && (
              <div className="flex justify-between text-[#A35021]">
                <span>COD Handling Fee:</span>
                <span>{formatPrice(codFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-[#6E2A45] pt-2 border-t border-[#E7DECF]">
              <span>Final Total:</span>
              <span>{formatPrice(finalTotal)}</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
