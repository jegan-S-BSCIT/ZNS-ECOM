import { Link } from 'react-router-dom';
import SmartImage from './SmartImage';

export default function CategoryCard({ category, count }) {
  return (
    <Link
      to={`/shop/${category.id}`}
      className="tile card group relative block overflow-hidden"
    >
      <span className="tile-media media aspect-[4/5] block">
        <SmartImage
          src={category.image}
          alt=""
          sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/35 to-transparent" />
      </span>

      <span className="absolute inset-x-0 bottom-0 p-4 text-white">
        <span className="flex items-baseline justify-between gap-2">
          <span className="font-display text-[17px] font-semibold leading-tight">{category.name}</span>
          {count != null && (
            <span className="font-mono text-[11px] text-amber-500 shrink-0">{count}</span>
          )}
        </span>
        <span className="mt-1.5 flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.12em] uppercase text-white/60 group-hover:text-amber-500 transition-colors">
          Browse
          <svg className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </span>
    </Link>
  );
}
