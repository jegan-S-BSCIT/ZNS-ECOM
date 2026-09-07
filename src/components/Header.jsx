import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CATEGORIES, CONCERNS, formatPrice } from '../data/products';
import SmartImage from './SmartImage';
import logo from '../assets/logo.png';

function Mark({ className = 'w-9 h-9' }) {
  return <img src={logo} alt="Zen Nova" className={`${className} shrink-0 object-contain`} />;
}

export default function Header() {
  const { cartCount, wishlist, user, admin, setIsMiniCartOpen, products } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  const searchRef = useRef(null);

  const suggestions = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (term.length < 2) return [];
    return products
      .filter((p) =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.benefitLine?.toLowerCase().includes(term) ||
        p.concerns?.some((c) => c.toLowerCase().includes(term))
      )
      .slice(0, 5);
  }, [query, products]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => setIsNavOpen(false), [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isNavOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isNavOpen]);

  const submitSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setShowSuggestions(false);
    setIsNavOpen(false);
    navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  const navLinkClass = ({ isActive }) =>
    `relative py-3 text-[13px] font-medium transition-colors ${
      isActive ? 'text-amber-500' : 'text-white/75 hover:text-white'
    } after:absolute after:left-0 after:right-0 after:bottom-0 after:h-px after:bg-amber-500 after:origin-left after:transition-transform ${
      isActive ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'
    }`;

  return (
    <header className="sticky top-0 z-40">
      {/* Promise bar — the two things a first-time visitor needs to know. */}
      <div className="bg-ink-900 text-white/70">
        <div className="shell flex items-center justify-center gap-x-6 gap-y-1 py-2 flex-wrap font-mono text-[10.5px] tracking-[0.14em] uppercase">
          <span className="text-amber-500">Free delivery over {formatPrice(499)}</span>
          <span className="hidden sm:inline text-white/25">/</span>
          <span className="hidden sm:inline">Full INCI on every label</span>
          <span className="hidden md:inline text-white/25">/</span>
          <span className="hidden md:inline">Dermatologist tested</span>
        </div>
      </div>

      <div className="bg-ink-800 text-white border-b border-rule-dark">
        <div className="shell flex items-center gap-2 sm:gap-4 h-[68px]">
          <button
            onClick={() => setIsNavOpen(true)}
            className="lg:hidden -ml-1 p-2 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
            aria-label="Open menu"
            aria-expanded={isNavOpen}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0 min-w-0">
            <Mark className="w-8 h-8 sm:w-9 sm:h-9 transition-transform duration-300 group-hover:-rotate-6" />
            <span className="flex flex-col leading-none min-w-0">
              <span className="font-display text-[17px] sm:text-[21px] font-semibold tracking-tight truncate">Zen Nova</span>
              <span className="hidden sm:block font-mono text-[9px] tracking-[0.22em] uppercase text-amber-500/80 mt-1">
                Formulary
              </span>
            </span>
          </Link>

          {/* Search */}
          <div ref={searchRef} className="hidden md:block flex-1 max-w-xl relative">
            <form onSubmit={submitSearch} className="relative">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none"
                fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" d="M21 21l-4.5-4.5M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Search a product, active or concern"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                aria-label="Search products"
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-ink-700 border border-rule-dark text-[13px] text-white placeholder:text-white/35 outline-none focus:border-spruce-600 focus:bg-ink-600 transition-colors"
              />
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-12 inset-x-0 card overflow-hidden shadow-lift animate-fade text-ink-800">
                <p className="px-4 py-2.5 font-mono text-[10px] tracking-[0.14em] uppercase text-slate-600 bg-mist-200 border-b border-rule">
                  {suggestions.length} match{suggestions.length === 1 ? '' : 'es'}
                </p>
                <ul className="divide-y divide-rule">
                  {suggestions.map((item) => (
                    <li key={item.id}>
                      <Link
                        to={`/product/${item.slug || item.id}`}
                        onClick={() => setShowSuggestions(false)}
                        className="flex items-center gap-3 p-3 hover:bg-spruce-50 transition-colors"
                      >
                        <span className="media w-11 h-11 rounded-md shrink-0">
                          <SmartImage src={item.images?.[0]} alt="" sizes="44px" />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-[13px] font-medium line-clamp-1">{item.name}</span>
                          <span className="block font-mono text-[11px] text-slate-600 capitalize">
                            {item.category.replace('-', ' ')}
                          </span>
                        </span>
                        <span className="font-mono text-[13px] font-semibold text-spruce-800">
                          {formatPrice(item.price)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  to={`/shop?q=${encodeURIComponent(query)}`}
                  onClick={() => setShowSuggestions(false)}
                  className="block p-3 text-center text-[12px] font-semibold text-spruce-800 bg-mist-100 hover:bg-spruce-100 transition-colors"
                >
                  See all results for “{query}”
                </Link>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 sm:gap-1 ml-auto">
            <Link
              to="/shop"
              className="md:hidden p-2 sm:p-2.5 rounded-lg text-white/80 hover:bg-white/10 transition-colors"
              aria-label="Search products"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M21 21l-4.5-4.5M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>

            <Link
              to="/account?tab=saved"
              className="relative p-2 sm:p-2.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              aria-label={`Saved items, ${wishlist.length} saved`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.5l-7.1-7.2a4.4 4.4 0 116.2-6.2l.9.9.9-.9a4.4 4.4 0 116.2 6.2z" />
              </svg>
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-amber-600 text-ink-900 font-mono text-[10px] font-semibold grid place-items-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsMiniCartOpen(true)}
              className="relative p-2 sm:p-2.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              aria-label={`Bag, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 9V6.5a4 4 0 118 0V9M4.8 9h14.4l1 11.5H3.8z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-amber-600 text-ink-900 font-mono text-[10px] font-semibold grid place-items-center">
                  {cartCount}
                </span>
              )}
            </button>

            {admin && (
              <Link
                to="/admin"
                className="ml-1 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-ink-900 text-[12.5px] font-semibold hover:bg-amber-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
                Admin Panel
              </Link>
            )}

            <Link
              to={user ? '/account' : '/login'}
              className="ml-1 flex items-center gap-2 pl-1.5 pr-1.5 sm:pr-3 py-1.5 rounded-lg text-white/85 hover:bg-white/10 hover:text-white transition-colors"
            >
              {user ? (
                <span className="w-7 h-7 rounded-full bg-amber-600 text-ink-900 font-mono text-[12px] font-semibold grid place-items-center uppercase">
                  {user.name?.[0] || 'A'}
                </span>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 8a4 4 0 11-8 0 4 4 0 018 0zM4.5 20.5a7.5 7.5 0 0115 0" />
                </svg>
              )}
              <span className="hidden lg:block text-[13px] font-medium max-w-[92px] truncate">
                {user ? user.name : 'Sign in'}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Category rail */}
      <nav className="hidden lg:block bg-ink-700 border-b border-rule-dark" aria-label="Categories">
        <div className="shell flex items-center justify-between gap-8">
          <div className="flex items-center gap-7">
            <NavLink to="/shop" end className={navLinkClass}>Everything</NavLink>
            {CATEGORIES.map((cat) => (
              <NavLink key={cat.id} to={`/shop/${cat.id}`} className={navLinkClass}>
                {cat.name}
              </NavLink>
            ))}
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px] text-white/45">
            <span className="tracking-[0.14em] uppercase">By concern</span>
            {CONCERNS.slice(0, 4).map((c) => (
              <Link key={c.id} to={`/concern/${c.tag}`} className="hover:text-amber-500 transition-colors">
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {isNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            className="absolute inset-0 bg-ink-900/70 animate-fade"
            onClick={() => setIsNavOpen(false)}
            aria-label="Close menu"
          />
          <div className="absolute inset-y-0 left-0 w-[86%] max-w-sm bg-ink-800 text-white overflow-y-auto animate-slide-in">
            <div className="flex items-center justify-between p-4 border-b border-rule-dark">
              <span className="flex items-center gap-2.5">
                <Mark className="w-8 h-8" />
                <span className="font-display text-lg font-semibold">Zen Nova</span>
              </span>
              <button
                onClick={() => setIsNavOpen(false)}
                className="p-2 rounded-lg text-white/70 hover:bg-white/10"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <form onSubmit={submitSearch} className="p-4 border-b border-rule-dark">
              <input
                type="search"
                placeholder="Search products"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search products"
                className="w-full h-11 px-4 rounded-lg bg-ink-700 border border-rule-dark text-sm text-white placeholder:text-white/35 outline-none focus:border-spruce-600"
              />
            </form>

            <nav className="p-4 space-y-6">
              <div>
                <p className="eyebrow text-amber-500/70 mb-3">Categories</p>
                <div className="flex flex-col">
                  <Link to="/shop" className="py-2.5 text-[15px] border-b border-white/5">Everything</Link>
                  {CATEGORIES.map((cat) => (
                    <Link key={cat.id} to={`/shop/${cat.id}`} className="py-2.5 text-[15px] text-white/80 border-b border-white/5">
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="eyebrow text-amber-500/70 mb-3">By concern</p>
                <div className="grid grid-cols-2 gap-2">
                  {CONCERNS.map((c) => (
                    <Link
                      key={c.id}
                      to={`/concern/${c.tag}`}
                      className="px-3 py-2.5 rounded-lg bg-ink-700 text-[13px] text-white/80"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>

              {admin && (
                <Link to="/admin" className="btn w-full bg-amber-600 text-ink-900 hover:bg-amber-500">
                  Admin Panel
                </Link>
              )}

              <Link to={user ? '/account' : '/login'} className="btn btn-accent w-full">
                {user ? 'My account' : 'Sign in'}
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
