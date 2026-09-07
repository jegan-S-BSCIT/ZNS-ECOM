import { Link } from 'react-router-dom';
import { CATEGORIES } from '../data/products';
import logo from '../assets/logo.png';

const SUPPORT = [
  ['Contact us', '/contact'],
  ['FAQ', '/faq'],
  ['Track an order', '/account?tab=orders'],
  ['Our formulation story', '/about']
];

const POLICIES = [
  ['Privacy', '/privacy-policy'],
  ['Terms', '/terms'],
  ['Shipping & delivery', '/shipping-policy'],
  ['Returns & refunds', '/return-policy']
];

function Column({ title, links }) {
  return (
    <div>
      <h3 className="eyebrow text-amber-500/70">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map(([label, to]) => (
          <li key={to}>
            <Link to={to} className="text-[13.5px] text-white/60 hover:text-white transition-colors">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-ink-900 text-white mt-auto">
      <div className="shell py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <span className="flex items-center gap-2.5">
              <img src={logo} alt="Zen Nova" className="w-8 h-8 object-contain" />
              <span className="font-display text-xl font-semibold">Zen Nova</span>
            </span>

            <p className="mt-4 text-[13.5px] leading-relaxed text-white/55">
              Formulations for hair, skin, health and wellness — every active declared
              at its stated concentration, on the label and on the page.
            </p>

            <div className="mt-5 flex gap-2">
              {['Instagram', 'Facebook', 'YouTube'].map((network) => (
                <a
                  key={network}
                  href="/"
                  onClick={(e) => e.preventDefault()}
                  aria-label={network}
                  className="w-9 h-9 grid place-items-center rounded-lg border border-rule-dark font-mono text-[11px] text-white/60 hover:border-amber-600 hover:text-amber-500 transition-colors"
                >
                  {network.slice(0, 2).toUpperCase()}
                </a>
              ))}
            </div>
          </div>

          <Column
            title="Shop"
            links={[['Everything', '/shop'], ...CATEGORIES.map((c) => [c.name, `/shop/${c.id}`])]}
          />
          <Column title="Support" links={SUPPORT} />
          <Column title="Policies" links={POLICIES} />
        </div>

        <div className="mt-12 pt-6 border-t border-rule-dark flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[11px] text-white/35">
            © {new Date().getFullYear()} Zen Nova Solutions
          </p>
          <ul className="flex flex-wrap justify-center gap-1.5">
            {['UPI', 'Visa', 'Mastercard', 'Net banking', 'COD'].map((method) => (
              <li
                key={method}
                className="px-2 py-1 rounded border border-rule-dark font-mono text-[10px] tracking-[0.08em] uppercase text-white/45"
              >
                {method}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
