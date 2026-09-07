import { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../data/products';
import { useCart } from '../context/CartContext';
import SmartImage from './SmartImage';

const CYCLE_MS = 4600;

// The index is built from the catalog itself: one row per hero active that a
// real product actually declares, so the list is never marketing filler.
function buildIndex(products) {
  const seen = new Set();
  const rows = [];
  for (const product of products) {
    const active = product.ingredients?.heroIngredients?.[0];
    if (!active || seen.has(active.name)) continue;
    seen.add(active.name);
    rows.push({
      active: active.name,
      role: active.benefit,
      product
    });
    if (rows.length === 6) break;
  }
  return rows;
}

export default function HeroFormulary() {
  const { products } = useCart();
  const rows = useMemo(() => buildIndex(products), [products]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (paused || reduced.current || rows.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % rows.length), CYCLE_MS);
    return () => clearInterval(id);
  }, [paused, rows.length]);

  const current = rows[index];
  if (!current) return null;

  return (
    <section
      className="bg-ink-800 text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Featured actives"
    >
      <div className="shell grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 py-14 lg:py-20 items-center">
        {/* Thesis */}
        <div className="max-w-xl">
          <p className="eyebrow text-amber-500 animate-fade" style={{ '--i': 0 }}>
            Index of actives
          </p>

          <h1
            className="font-display text-[clamp(2.4rem,6.2vw,4.15rem)] leading-[0.98] font-semibold mt-5 animate-rise"
            style={{ '--i': 1 }}
          >
            Every percentage,
            <span className="block text-amber-500 italic">on the front</span>
            of the label.
          </h1>

          <p
            className="mt-6 text-[15px] leading-relaxed text-white/65 max-w-md animate-rise"
            style={{ '--i': 2 }}
          >
            Hair, skin and health formulations built around declared actives at
            stated concentrations. Read the whole ingredient list before you buy,
            not after.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 animate-rise" style={{ '--i': 3 }}>
            <Link to="/shop" className="btn btn-accent">Shop the formulary</Link>
            <Link to="/about" className="btn btn-on-dark">How we formulate</Link>
          </div>

          <dl
            className="mt-10 pt-8 border-t border-rule-dark grid grid-cols-3 gap-4 max-w-md animate-fade"
            style={{ '--i': 4 }}
          >
            {[
              ['32', 'Formulations'],
              ['100%', 'INCI declared'],
              ['0', 'Undisclosed fragrance']
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="font-mono text-[22px] font-medium text-amber-500 leading-none">{value}</dt>
                <dd className="mt-2 text-[11px] leading-snug text-white/45 uppercase tracking-[0.1em] font-mono">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Signature: the index itself */}
        <div className="animate-rise" style={{ '--i': 2 }}>
          <div className="relative overflow-hidden rounded-xl border border-rule-dark bg-ink-700">
            <Link to={`/product/${current.product.slug}`} className="block group">
              <span className="media aspect-[16/10] block">
                <SmartImage
                  key={current.product.id}
                  src={current.product.images?.[0]}
                  alt={current.product.name}
                  sizes="(min-width: 1024px) 46vw, 100vw"
                  priority
                  className="animate-fade transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </span>
              <span className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-ink-900 via-ink-900/80 to-transparent">
                <span className="block font-display text-lg font-semibold leading-snug">
                  {current.product.name}
                </span>
                <span className="mt-1 flex items-center gap-3 font-mono text-[13px]">
                  <span className="text-amber-500 font-medium">{formatPrice(current.product.price)}</span>
                  <span className="text-white/40 capitalize">
                    {current.product.category.replace('-', ' ')}
                  </span>
                </span>
              </span>
            </Link>
          </div>

          <ul className="mt-4 border-t border-rule-dark">
            {rows.map((row, i) => {
              const isActive = i === index;
              return (
                <li key={row.active} className="border-b border-rule-dark">
                  <button
                    onMouseEnter={() => setIndex(i)}
                    onFocus={() => { setIndex(i); setPaused(true); }}
                    onBlur={() => setPaused(false)}
                    onClick={() => setIndex(i)}
                    aria-current={isActive}
                    className="w-full flex items-baseline gap-4 py-3 text-left group"
                  >
                    <span
                      className={`h-px shrink-0 transition-all duration-500 ${
                        isActive ? 'w-8 bg-amber-500' : 'w-3 bg-white/25 group-hover:w-6'
                      }`}
                      aria-hidden="true"
                    />
                    <span
                      className={`text-[15px] font-medium transition-colors ${
                        isActive ? 'text-amber-500' : 'text-white/80 group-hover:text-white'
                      }`}
                    >
                      {row.active}
                    </span>
                    <span className="ml-auto font-mono text-[10.5px] tracking-[0.14em] uppercase text-white/35 shrink-0">
                      {row.product.category.replace('-care', '').replace('-', ' ')}
                    </span>
                  </button>

                  {/* The active row explains itself; the rest stay quiet. */}
                  <p
                    className={`overflow-hidden text-[13px] leading-relaxed text-white/55 transition-all duration-500 ${
                      isActive ? 'max-h-24 pb-3.5 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    {row.role}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
