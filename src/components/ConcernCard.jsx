import { Link } from 'react-router-dom';

export default function ConcernCard({ concern, count }) {
  return (
    <Link
      to={`/concern/${concern.tag}`}
      className="card group flex items-center gap-4 p-4 transition-colors hover:border-spruce-600 hover:bg-spruce-50"
    >
      <span
        className="w-11 h-11 shrink-0 grid place-items-center rounded-lg bg-spruce-50 border border-spruce-100 text-lg group-hover:bg-paper transition-colors"
        aria-hidden="true"
      >
        {concern.icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-semibold">{concern.name}</span>
        <span className="block text-[12.5px] text-slate-600 line-clamp-1">{concern.description}</span>
      </span>

      {count != null && (
        <span className="font-mono text-[11px] text-slate-400 shrink-0">{count}</span>
      )}

      <svg
        className="w-4 h-4 shrink-0 text-slate-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-spruce-700"
        fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </Link>
  );
}
