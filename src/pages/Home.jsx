import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import HeroFormulary from '../components/HeroFormulary';
import CategoryCard from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';
import ReviewCard from '../components/ReviewCard';
import SmartImage from '../components/SmartImage';
import useReveal from '../hooks/useReveal';
import { CATEGORIES, CONCERNS } from '../data/products';
import { useCart } from '../context/CartContext';

// A real sequence, so it earns its numbering.
const PROCESS = [
  {
    step: 'Source',
    body: 'Actives are bought on certificate of analysis, not on a supplier’s word. Every batch arrives with its assay.'
  },
  {
    step: 'Formulate',
    body: 'We fix the concentration first and build the base around it — no trace-dose actives added for the label.'
  },
  {
    step: 'Declare',
    body: 'The full INCI list, the percentage of each hero active, and the shelf life ship on the pack and on the page.'
  }
];

const REVIEWS = [
  {
    id: 'r101',
    author: 'Dr. Sunita Rao',
    rating: 5,
    date: '14 Aug 2026',
    comment:
      'I recommend few retail brands to patients, but the 10% niacinamide here is stable and honestly declared. The pH is where it should be.',
    productChip: '10% Niacinamide Serum',
    verified: true
  },
  {
    id: 'r102',
    author: 'Vikram Sethi',
    rating: 5,
    date: '02 Aug 2026',
    comment:
      'Three weeks of the rosemary oil and the shedding dropped noticeably. It also does not leave my pillow greasy, which every other oil did.',
    productChip: 'Rosemary & Biotin Oil',
    verified: true
  },
  {
    id: 'r103',
    author: 'Meenakshi K.',
    rating: 5,
    date: '28 Jul 2026',
    comment:
      'I read the full ingredient list before ordering — that alone is rare. The barrier cream calmed a flare in about four days.',
    productChip: 'Ceramide Barrier Cream',
    verified: true
  }
];

function SectionHead({ eyebrow, title, blurb, action, tone = 'light' }) {
  const muted = tone === 'dark' ? 'text-white/60' : 'text-slate-600';
  const accent = tone === 'dark' ? 'text-amber-500' : 'text-amber-700';
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-9">
      <div className="max-w-lg reveal">
        <p className={`eyebrow ${accent}`}>{eyebrow}</p>
        <h2 className="font-display text-[clamp(1.7rem,3.4vw,2.5rem)] leading-tight font-semibold mt-3">
          {title}
        </h2>
        {blurb && <p className={`mt-3 text-[14.5px] leading-relaxed ${muted}`}>{blurb}</p>}
      </div>
      {action && (
        <Link
          to={action.to}
          className={`reveal shrink-0 inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.1em] uppercase group ${
            tone === 'dark' ? 'text-amber-500 hover:text-amber-400' : 'text-spruce-800 hover:text-spruce-600'
          } transition-colors`}
        >
          {action.label}
          <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      )}
    </div>
  );
}

export default function Home() {
  const reveal = useReveal();
  const { showToast, products } = useCart();
  const [email, setEmail] = useState('');

  const featured = useMemo(() => products.filter((p) => p.isFeatured).slice(0, 8), [products]);
  const bestSellers = useMemo(() => products.filter((p) => p.isBestSeller).slice(0, 4), [products]);

  const countBy = useMemo(() => {
    const byCategory = {};
    const byConcern = {};
    for (const p of products) {
      byCategory[p.category] = (byCategory[p.category] || 0) + 1;
      for (const c of p.concerns || []) byConcern[c] = (byConcern[c] || 0) + 1;
    }
    return { byCategory, byConcern };
  }, [products]);

  const subscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    showToast(`Discount code sent to ${email}`, 'success');
    setEmail('');
  };

  return (
    <div ref={reveal}>
      <HeroFormulary />

      {/* Categories */}
      <section className="shell py-16 lg:py-20">
        <SectionHead
          eyebrow="Five families"
          title="Shop by category"
          blurb="Hair, skin, colour, health and wellness — formulated to be layered together rather than sold as separate routines."
          action={{ label: 'All products', to: '/shop' }}
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((category, i) => (
            <div key={category.id} className="reveal" style={{ '--i': i }}>
              <CategoryCard category={category} count={countBy.byCategory[category.id]} />
            </div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="border-y border-rule bg-paper">
        <div className="shell py-16 lg:py-20">
          <SectionHead
            eyebrow="Curated"
            title="Featured formulations"
            blurb="The formulas we would put in our own bathroom cabinet, each one built around a declared hero active."
            action={{ label: 'Full catalog', to: '/shop' }}
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {featured.map((product, i) => (
              <div key={product.id} className="reveal" style={{ '--i': i % 4 }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Concerns — dark band, because this is the other way in */}
      <section className="bg-ink-800 text-white">
        <div className="shell py-16 lg:py-20">
          <SectionHead
            eyebrow="Targeted"
            title="Or start with the concern"
            blurb="Skip the category tree. Tell us the symptom and we will show only the formulations that address it."
            tone="dark"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CONCERNS.map((concern, i) => (
              <div key={concern.id} className="reveal" style={{ '--i': i % 3 }}>
                <Link
                  to={`/concern/${concern.tag}`}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-rule-dark bg-ink-700 hover:border-amber-600 transition-colors h-full"
                >
                  <span className="w-11 h-11 shrink-0 grid place-items-center rounded-lg bg-ink-600 text-lg" aria-hidden="true">
                    {concern.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14.5px] font-semibold">{concern.name}</span>
                    <span className="block text-[12.5px] text-white/50 line-clamp-1">{concern.description}</span>
                  </span>
                  <span className="font-mono text-[11px] text-amber-500/70 shrink-0">
                    {countBy.byConcern[concern.tag] || 0}
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best sellers */}
      <section className="shell py-16 lg:py-20">
        <SectionHead
          eyebrow="Most reordered"
          title="Best sellers"
          blurb="Ranked by repeat purchases, not by margin."
          action={{ label: 'See all', to: '/shop?sort=best-selling' }}
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {bestSellers.map((product, i) => (
            <div key={product.id} className="reveal" style={{ '--i': i }}>
              <ProductCard product={product} showBenefit={false} />
            </div>
          ))}
        </div>
      </section>

      {/* How we formulate */}
      <section className="border-y border-rule bg-paper">
        <div className="shell py-16 lg:py-20 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="reveal">
            <span className="media block aspect-[4/3] rounded-xl border border-rule">
              <SmartImage
                src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80"
                alt="Formulation bench with measured actives"
                sizes="(min-width: 1024px) 45vw, 100vw"
              />
            </span>
          </div>

          <div>
            <p className="eyebrow text-amber-700 reveal">Our method</p>
            <h2 className="font-display text-[clamp(1.7rem,3.4vw,2.5rem)] leading-tight font-semibold mt-3 reveal">
              Three steps, and none of them is marketing.
            </h2>

            <ol className="mt-8 space-y-6">
              {PROCESS.map((item, i) => (
                <li key={item.step} className="reveal flex gap-5" style={{ '--i': i }}>
                  <span className="font-mono text-[13px] font-medium text-amber-700 pt-0.5 shrink-0 w-7">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="border-l border-rule pl-5">
                    <span className="block text-[15px] font-semibold">{item.step}</span>
                    <span className="block mt-1.5 text-[14px] leading-relaxed text-slate-600">{item.body}</span>
                  </span>
                </li>
              ))}
            </ol>

            <Link to="/about" className="btn btn-primary mt-9 reveal">Read the full standard</Link>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="shell py-16 lg:py-20">
        <SectionHead
          eyebrow="Verified purchases"
          title="What people report back"
          blurb="Reviews are only shown from accounts with a matching delivered order."
        />
        <div className="grid md:grid-cols-3 gap-5">
          {REVIEWS.map((review, i) => (
            <div key={review.id} className="reveal" style={{ '--i': i }}>
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="shell pb-20">
        <div className="reveal rounded-2xl bg-spruce-800 text-white p-8 sm:p-12 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <p className="eyebrow text-amber-500">The dispensary letter</p>
            <h2 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] font-semibold leading-tight mt-3">
              One formulation note a month.
            </h2>
            <p className="mt-3 text-[14.5px] leading-relaxed text-white/65 max-w-md">
              What we reformulated and why, plus 15% off your first order. No countdown
              timers, no daily sends.
            </p>
          </div>

          <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-2.5 lg:justify-self-end w-full max-w-md">
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field flex-1 bg-white/95 border-transparent"
            />
            <button type="submit" className="btn btn-accent">Get the letter</button>
          </form>
        </div>
      </section>
    </div>
  );
}
