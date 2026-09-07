import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data/products';
import SmartImage from './SmartImage';

function Stepper({ item, onChange }) {
  const atMax = item.quantity >= (item.stockQuantity ?? 50);
  return (
    <div className="inline-flex items-center rounded-lg border border-rule overflow-hidden">
      <button
        onClick={() => onChange(item.id, item.quantity - 1)}
        className="w-8 h-8 grid place-items-center text-slate-600 hover:bg-mist-200 transition-colors"
        aria-label={`Decrease quantity of ${item.name}`}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" d="M5 12h14" />
        </svg>
      </button>
      <span className="w-8 text-center font-mono text-[13px] font-medium" aria-live="polite">
        {item.quantity}
      </span>
      <button
        onClick={() => onChange(item.id, item.quantity + 1)}
        disabled={atMax}
        className="w-8 h-8 grid place-items-center text-slate-600 hover:bg-mist-200 disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
        aria-label={`Increase quantity of ${item.name}`}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
}

export default function MiniCartDrawer() {
  const {
    cart, cartSubtotal, cartCount,
    isFreeShipping, amountNeededForFreeShipping, freeShippingThreshold,
    updateQuantity, removeFromCart,
    isMiniCartOpen, setIsMiniCartOpen
  } = useCart();

  // Escape closes; the page behind must not scroll while the drawer is open.
  useEffect(() => {
    if (!isMiniCartOpen) return;
    const onKey = (e) => e.key === 'Escape' && setIsMiniCartOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isMiniCartOpen, setIsMiniCartOpen]);

  if (!isMiniCartOpen) return null;

  const progress = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Shopping bag">
      <button
        className="absolute inset-0 bg-ink-900/60 backdrop-blur-[2px] animate-fade"
        onClick={() => setIsMiniCartOpen(false)}
        aria-label="Close bag"
      />

      <div className="absolute inset-y-0 right-0 w-full max-w-[26rem] bg-mist-100 flex flex-col animate-slide-in shadow-lift">
        <div className="flex items-center justify-between px-5 h-16 bg-ink-800 text-white shrink-0">
          <h2 className="font-display text-lg font-semibold">
            Your bag
            <span className="ml-2 font-mono text-[13px] font-normal text-amber-500">{cartCount}</span>
          </h2>
          <button
            onClick={() => setIsMiniCartOpen(false)}
            className="p-2 -mr-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Close bag"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {cart.length > 0 && (
          <div className="px-5 py-4 bg-paper border-b border-rule shrink-0">
            <p className="text-[13px]">
              {isFreeShipping ? (
                <span className="font-medium text-spruce-700">Delivery is on us.</span>
              ) : (
                <>
                  <span className="font-mono font-semibold text-spruce-800">
                    {formatPrice(amountNeededForFreeShipping)}
                  </span>{' '}
                  <span className="text-slate-600">more for free delivery</span>
                </>
              )}
            </p>
            <div
              className="mt-2 h-1.5 rounded-full bg-mist-300 overflow-hidden"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progress to free delivery"
            >
              <div
                className={`h-full rounded-full transition-[width] duration-500 ${isFreeShipping ? 'bg-spruce-600' : 'bg-amber-600'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="h-full grid place-content-center text-center px-8">
              <span className="w-14 h-14 mx-auto grid place-items-center rounded-full bg-spruce-50 border border-spruce-100 text-spruce-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 9V6.5a4 4 0 118 0V9M4.8 9h14.4l1 11.5H3.8z" />
                </svg>
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">Nothing in the bag yet</h3>
              <p className="mt-1.5 text-[13px] text-slate-600">
                Start with a concern and we will match the formulation.
              </p>
              <Link to="/shop" onClick={() => setIsMiniCartOpen(false)} className="btn btn-primary mt-5">
                Browse the formulary
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-rule">
              {cart.map((item) => (
                <li key={item.id} className="flex gap-3.5 p-5 bg-paper">
                  <Link
                    to={`/product/${item.slug || item.id}`}
                    onClick={() => setIsMiniCartOpen(false)}
                    className="media w-[68px] h-[68px] rounded-lg border border-rule shrink-0"
                  >
                    <SmartImage src={item.image} alt="" sizes="68px" />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-[13.5px] font-medium leading-snug line-clamp-2">
                      <Link to={`/product/${item.slug || item.id}`} onClick={() => setIsMiniCartOpen(false)}>
                        {item.name}
                      </Link>
                    </h3>
                    <p className="mt-0.5 font-mono text-[13px] font-semibold text-spruce-800">
                      {formatPrice(item.price * item.quantity)}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <Stepper item={item} onChange={updateQuantity} />
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[12px] text-slate-400 hover:text-flag-600 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-5 bg-paper border-t border-rule shrink-0 space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] text-slate-600">Subtotal</span>
              <span className="font-mono text-[19px] font-semibold text-spruce-800">
                {formatPrice(cartSubtotal)}
              </span>
            </div>
            <p className="text-[12px] text-slate-400 -mt-2">Shipping and taxes calculated at checkout.</p>
            <div className="grid grid-cols-2 gap-2.5">
              <Link to="/cart" onClick={() => setIsMiniCartOpen(false)} className="btn btn-ghost">
                View bag
              </Link>
              <Link to="/checkout" onClick={() => setIsMiniCartOpen(false)} className="btn btn-primary">
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
