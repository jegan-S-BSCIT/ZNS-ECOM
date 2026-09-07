import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data/products';
import SmartImage from './SmartImage';

function Stars({ rating = 5, count }) {
  const filled = Math.round(rating);
  return (
    <span className="flex items-center gap-1.5" aria-label={`Rated ${rating} out of 5`}>
      <span className="flex text-amber-600" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <svg key={i} viewBox="0 0 20 20" className={`w-3 h-3 ${i < filled ? 'fill-current' : 'fill-rule'}`}>
            <path d="M10 1.6l2.5 5.4 5.6.7-4.1 3.9 1.1 5.8L10 14.6 4.9 17.4 6 11.6 1.9 7.7l5.6-.7z" />
          </svg>
        ))}
      </span>
      {count > 0 && <span className="font-mono text-[11px] text-slate-400">{count}</span>}
    </span>
  );
}

function ProductCard({ product, showBenefit = true, priority = false }) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const saved = isInWishlist(product.id);
  const outOfStock = product.stockQuantity === 0;
  const lowStock = !outOfStock && product.stockQuantity > 0 && product.stockQuantity <= 10;
  const discount =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const href = `/product/${product.slug || product.id}`;
  const actives = product.ingredients?.heroIngredients?.slice(0, 2) ?? [];

  return (
    <article className="tile card group flex flex-col overflow-hidden">
      <div className="relative">
        <Link to={href} tabIndex={-1} aria-hidden="true" className="tile-media media aspect-square block">
          <SmartImage src={product.images?.[0] || product.image} alt="" priority={priority} />
        </Link>

        <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1.5">
          {discount > 0 && (
            <span className="px-2 py-1 rounded bg-flag-600 text-white font-mono text-[10px] font-semibold tracking-wide">
              −{discount}%
            </span>
          )}
          {product.isBestSeller && (
            <span className="px-2 py-1 rounded bg-ink-800/90 text-amber-500 font-mono text-[10px] tracking-[0.1em] uppercase backdrop-blur-sm">
              Best seller
            </span>
          )}
        </div>

        <button
          onClick={() => toggleWishlist(product)}
          aria-label={saved ? `Remove ${product.name} from saved` : `Save ${product.name}`}
          aria-pressed={saved}
          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-paper/90 backdrop-blur-sm text-slate-600 hover:text-spruce-800 shadow-card transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            className={`w-[18px] h-[18px] ${saved ? 'fill-spruce-800 stroke-spruce-800' : 'fill-none stroke-current'}`}
            strokeWidth="1.7"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.5l-7.1-7.2a4.4 4.4 0 116.2-6.2l.9.9.9-.9a4.4 4.4 0 116.2 6.2z" />
          </svg>
        </button>

        {outOfStock && (
          <div className="absolute inset-0 grid place-items-center bg-paper/75 backdrop-blur-[1px]">
            <span className="px-3 py-1.5 rounded bg-ink-800 text-white font-mono text-[11px] tracking-[0.1em] uppercase">
              Out of stock
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4">
        <Stars rating={product.rating} count={product.reviewCount} />

        <h3 className="mt-2 text-[14px] font-semibold leading-snug line-clamp-2">
          <Link to={href} className="hover:text-spruce-700 transition-colors">
            {product.name}
          </Link>
        </h3>

        {showBenefit && product.benefitLine && (
          <p className="mt-1.5 text-[12.5px] leading-snug text-slate-600 line-clamp-2">
            {product.benefitLine}
          </p>
        )}

        {/* The actives are the point of the brand, so they sit on the card. */}
        {actives.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {actives.map((a) => (
              <li
                key={a.name}
                className="px-2 py-0.5 rounded bg-spruce-50 border border-spruce-100 font-mono text-[10.5px] text-spruce-700"
              >
                {a.name}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto pt-4 flex items-end justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[17px] font-semibold text-spruce-800">
                {formatPrice(product.price)}
              </span>
              {discount > 0 && (
                <span className="font-mono text-[12px] text-slate-400 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            {lowStock && (
              <p className="mt-1 font-mono text-[11px] text-flag-600">
                {product.stockQuantity} left
              </p>
            )}
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            disabled={outOfStock}
            className="btn btn-primary btn-sm relative z-10"
          >
            {outOfStock ? 'Sold out' : 'Add'}
          </button>
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);
