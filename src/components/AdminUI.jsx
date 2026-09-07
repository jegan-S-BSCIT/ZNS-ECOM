import { Children, cloneElement, isValidElement, useEffect, useMemo, useState } from 'react';

/* ═══════════════════════════════════════════════════════════════════
   Admin UI primitives — the back-room dialect of the storefront system.

   Same tokens as the shop (ink / spruce / amber / mist), one added rule:
   state is carried on a 3px left rail on every data row, so a manager
   scanning forty rows reads condition from the edge before reading a
   word. Pills repeat it for anyone who can't rely on colour alone.
   ═══════════════════════════════════════════════════════════════════ */

/** Rail + pill tones. `crit` is reserved for cancelled / out-of-stock. */
const TONES = {
  ok:      { rail: 'var(--color-spruce-600)', pill: 'bg-spruce-100 text-spruce-800', dot: 'bg-spruce-600' },
  work:    { rail: 'var(--color-amber-600)',  pill: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-600' },
  rest:    { rail: 'var(--color-slate-400)',  pill: 'bg-mist-300 text-slate-700',    dot: 'bg-slate-400' },
  crit:    { rail: 'var(--color-flag-600)',   pill: 'bg-flag-100 text-flag-600',     dot: 'bg-flag-600' }
};

export const railStyle = (tone) =>
  tone ? { boxShadow: `inset 3px 0 0 ${TONES[tone]?.rail || TONES.rest.rail}` } : undefined;

/** Where an order sits: placed → in-flight → delivered, cancelled apart. */
export const orderTone = (status) => {
  if (status === 'Cancelled') return 'crit';
  if (status === 'Delivered') return 'ok';
  if (status === 'Order Placed') return 'rest';
  return 'work';
};

export const stockTone = (qty, threshold = 10) =>
  qty === 0 ? 'crit' : qty < threshold ? 'work' : 'ok';

/* ── Icons ────────────────────────────────────────────────────────── */
const I = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, viewBox: '0 0 24 24', strokeLinecap: 'round', strokeLinejoin: 'round' };

export const Icon = {
  grid:     (p) => <svg {...I} {...p}><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" /></svg>,
  box:      (p) => <svg {...I} {...p}><path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z" /><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" /></svg>,
  flask:    (p) => <svg {...I} {...p}><path d="M10 3h4M10.5 3v6.2L5.2 18a2 2 0 0 0 1.7 3h10.2a2 2 0 0 0 1.7-3l-5.3-8.8V3" /><path d="M7.4 14h9.2" /></svg>,
  shelf:    (p) => <svg {...I} {...p}><path d="M4 4v16M20 4v16M4 10h16M4 16h16" /></svg>,
  people:   (p) => <svg {...I} {...p}><path d="M15.5 8.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0zM4.5 20a7.5 7.5 0 0 1 15 0" /></svg>,
  tag:      (p) => <svg {...I} {...p}><path d="M3.5 11.2V4.5a1 1 0 0 1 1-1h6.7a1 1 0 0 1 .7.3l8.3 8.3a1 1 0 0 1 0 1.4l-6.7 6.7a1 1 0 0 1-1.4 0L3.8 11.9a1 1 0 0 1-.3-.7z" /><path d="M7.5 7.5h.01" /></svg>,
  search:   (p) => <svg {...I} {...p}><path d="M21 21l-4.5-4.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" /></svg>,
  download: (p) => <svg {...I} {...p}><path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M4 20h16" /></svg>,
  plus:     (p) => <svg {...I} {...p}><path d="M12 5v14M5 12h14" /></svg>,
  edit:     (p) => <svg {...I} {...p}><path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3z" /><path d="M14.5 6.5 17.5 9.5" /></svg>,
  trash:    (p) => <svg {...I} {...p}><path d="M4 7h16M9.5 7V5h5v2M6.5 7l.8 13h9.4l.8-13" /><path d="M10.5 11v5M13.5 11v5" /></svg>,
  eye:      (p) => <svg {...I} {...p}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="2.8" /></svg>,
  refresh:  (p) => <svg {...I} {...p}><path d="M20 11a8 8 0 1 0-.9 4.6" /><path d="M20 4.5V11h-6" /></svg>,
  logout:   (p) => <svg {...I} {...p}><path d="M15 4.5h3.5a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5H15M10 8l-4 4 4 4M6 12h10" /></svg>,
  store:    (p) => <svg {...I} {...p}><path d="M4 9.5V20h16V9.5M2.5 9.5 4.6 4h14.8l2.1 5.5a3 3 0 0 1-5.6 1.8 3 3 0 0 1-5.6 0 3 3 0 0 1-5.6-1.8z" /></svg>,
  chevron:  (p) => <svg {...I} {...p}><path d="m9 6 6 6-6 6" /></svg>,
  close:    (p) => <svg {...I} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>
};

/* ── Nav rail ─────────────────────────────────────────────────────── */
/** Sections stack on desktop, scroll horizontally on phones — the same
    shape the storefront account nav uses, so the two read as one app. */
export function NavRail({ items, active, onSelect }) {
  return (
    <nav aria-label="Admin sections" className="lg:sticky lg:top-32">
      <ul className="flex lg:flex-col gap-1 overflow-x-auto hide-scrollbar pb-1 lg:pb-0">
        {items.map((item) => {
          const isActive = item.id === active;
          const Glyph = item.icon;
          return (
            <li key={item.id} className="shrink-0">
              <button
                onClick={() => onSelect(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-[13.5px] font-medium whitespace-nowrap transition-colors ${
                  isActive ? 'bg-ink-800 text-white' : 'text-slate-700 hover:bg-mist-300'
                }`}
              >
                <Glyph className={`w-[17px] h-[17px] shrink-0 ${isActive ? 'text-amber-500' : 'text-slate-400'}`} />
                {item.label}
                {item.count != null && (
                  <span className={`ml-auto font-mono text-[11px] ${isActive ? 'text-amber-500' : 'text-slate-400'}`}>
                    {item.count}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ── Panels ───────────────────────────────────────────────────────── */
export function Panel({ title, description, actions, children, flush = false }) {
  return (
    <section className="card overflow-hidden">
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 border-b border-rule bg-mist-100">
          <div className="min-w-0">
            <h2 className="font-display text-[17px] font-semibold leading-tight">{title}</h2>
            {description && <p className="text-[12.5px] text-slate-600 mt-0.5">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </header>
      )}
      <div className={flush ? '' : 'p-5'}>{children}</div>
    </section>
  );
}

/** KPI tile. Value is mono — measured facts always look measured. */
export function StatCard({ label, value, delta, hint, icon: Glyph, tone = 'default' }) {
  const accent = {
    default: 'bg-mist-200 text-slate-600',
    brand:   'bg-spruce-100 text-spruce-800',
    accent:  'bg-amber-100 text-amber-700',
    alert:   'bg-flag-100 text-flag-600'
  }[tone];

  return (
    <div className="card p-4 sm:p-5" style={tone === 'alert' ? railStyle('crit') : undefined}>
      <div className="flex items-start justify-between gap-3">
        <span className="eyebrow text-slate-600 before:hidden">{label}</span>
        {Glyph && (
          <span className={`w-8 h-8 shrink-0 grid place-items-center rounded-lg ${accent}`} aria-hidden="true">
            <Glyph className="w-4 h-4" />
          </span>
        )}
      </div>
      <p className="font-mono text-[26px] leading-none font-semibold mt-3 tabular-nums">{value}</p>
      {delta != null && (
        <p className={`text-[11.5px] font-medium mt-2 ${delta >= 0 ? 'text-spruce-700' : 'text-flag-600'}`}>
          {delta >= 0 ? '↗' : '↘'} {Math.abs(delta).toFixed(0)}% vs previous period
        </p>
      )}
      {delta == null && hint && <p className="text-[11.5px] text-slate-600 mt-2">{hint}</p>}
    </div>
  );
}

/* ── Controls ─────────────────────────────────────────────────────── */
export function Toolbar({ children }) {
  return <div className="flex flex-wrap items-center gap-2 px-5 py-3.5 border-b border-rule bg-mist-100">{children}</div>;
}

export function SearchInput({ value, onChange, placeholder = 'Search', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Icon.search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="field pl-9 py-2 text-[13px]"
      />
    </div>
  );
}

export function FilterSelect({ label, value, onChange, options, allLabel = 'All' }) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field py-2 pr-8 text-[13px] appearance-none cursor-pointer"
      >
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
        ))}
      </select>
      <Icon.chevron className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rotate-90 text-slate-400 pointer-events-none" />
    </label>
  );
}

export function IconButton({ label, onClick, tone = 'default', icon: Glyph, disabled }) {
  const tones = {
    default: 'text-slate-600 hover:text-ink-800 hover:bg-mist-300',
    danger:  'text-slate-600 hover:text-flag-600 hover:bg-flag-100'
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`p-1.5 rounded-md transition-colors disabled:opacity-40 ${tones[tone]}`}
    >
      <Glyph className="w-[17px] h-[17px]" />
    </button>
  );
}

/* ── Status ───────────────────────────────────────────────────────── */
export function StatusPill({ label, tone = 'rest' }) {
  const t = TONES[tone] || TONES.rest;
  return (
    <span className={`inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full font-mono text-[10.5px] font-medium tracking-[0.06em] uppercase ${t.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}

/** Stock read as a shelf: fill against the reorder threshold, not a bare
    integer. Anything under the line is visibly short before it's read. */
export function StockMeter({ qty, threshold = 10, full = 60 }) {
  const tone = stockTone(qty, threshold);
  const pct = Math.min(100, (qty / full) * 100);
  return (
    <div className="min-w-[104px]">
      <div className="flex items-baseline justify-between gap-2">
        <span className={`font-mono text-[13px] font-semibold tabular-nums ${
          tone === 'crit' ? 'text-flag-600' : tone === 'work' ? 'text-amber-700' : 'text-ink-800'
        }`}>
          {qty}
        </span>
        <span className="font-mono text-[10px] text-slate-400">/ {full}</span>
      </div>
      <div className="relative h-1.5 mt-1.5 rounded-full bg-mist-300 overflow-hidden">
        <span
          className="block h-full rounded-full transition-[width] duration-300"
          style={{ width: `${pct}%`, background: TONES[tone].rail }}
        />
        {/* The reorder line, so "low" is a place on the bar, not a judgement. */}
        <span
          className="absolute top-0 bottom-0 w-px bg-ink-800/35"
          style={{ left: `${(threshold / full) * 100}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

/* ── Table ────────────────────────────────────────────────────────── */
export function Table({ children, minWidth = '860px' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[13px]" style={{ minWidth }}>{children}</table>
    </div>
  );
}

export function Th({ children, sort, sortKey, onSort, align = 'left', width }) {
  const active = sort?.key === sortKey;
  const sortable = Boolean(sortKey && onSort);
  const content = (
    <span className="inline-flex items-center gap-1.5">
      {children}
      {sortable && (
        <span className={`font-mono text-[9px] leading-none ${active ? 'text-amber-500' : 'text-white/30'}`} aria-hidden="true">
          {active && sort.dir === 'asc' ? '▲' : active ? '▼' : '⇅'}
        </span>
      )}
    </span>
  );
  return (
    <th
      scope="col"
      style={{ width }}
      aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : sortable ? 'none' : undefined}
      className={`px-4 py-2.5 font-mono text-[10px] font-medium tracking-[0.12em] uppercase text-white/70 ${
        align === 'right' ? 'text-right' : ''
      }`}
    >
      {sortable ? (
        <button type="button" onClick={() => onSort(sortKey)} className="hover:text-white transition-colors">
          {content}
        </button>
      ) : content}
    </th>
  );
}

export function THead({ children }) {
  return <thead className="bg-ink-800"><tr>{children}</tr></thead>;
}

export function Td({ children, className = '', mono = false, align, ...rest }) {
  return (
    <td
      className={`px-4 py-3 align-middle ${mono ? 'font-mono tabular-nums' : ''} ${align === 'right' ? 'text-right' : ''} ${className}`}
      {...rest}
    >
      {children}
    </td>
  );
}

/** Rows carry their state on the left rail: the first cell gets an inset
    shadow, which survives border-collapse where a tr box-shadow doesn't. */
export function Tr({ tone, children, className = '' }) {
  const cells = Children.toArray(children);
  return (
    <tr className={`border-b border-rule last:border-0 hover:bg-mist-100 transition-colors ${className}`}>
      {tone && isValidElement(cells[0])
        ? [
            cloneElement(cells[0], { style: { ...cells[0].props.style, ...railStyle(tone) } }),
            ...cells.slice(1)
          ]
        : cells}
    </tr>
  );
}

export function EmptyRow({ colSpan, title, body }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-14 text-center">
        <p className="font-display text-[15px] font-semibold">{title}</p>
        {body && <p className="text-[13px] text-slate-600 mt-1">{body}</p>}
      </td>
    </tr>
  );
}

/* ── Pagination ───────────────────────────────────────────────────── */
/** Paging is local: the whole set is already in memory, so this only
    decides what's painted. Returns the slice plus a clamped page. */
export function usePaged(rows, page, perPage) {
  return useMemo(() => {
    const pageCount = Math.max(1, Math.ceil(rows.length / perPage));
    const safe = Math.min(page, pageCount);
    const start = (safe - 1) * perPage;
    return { slice: rows.slice(start, start + perPage), pageCount, page: safe, start, total: rows.length };
  }, [rows, page, perPage]);
}

export function Pagination({ page, pageCount, total, start, shown, perPage, onPage, onPerPage, noun = 'rows' }) {
  const btn = 'w-8 h-8 grid place-items-center rounded-md font-mono text-[12px] transition-colors disabled:opacity-35 disabled:cursor-not-allowed';
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-t border-rule bg-mist-100">
      <p className="font-mono text-[11.5px] text-slate-600 tabular-nums">
        {total === 0 ? `No ${noun}` : `${start + 1}–${start + shown} of ${total} ${noun}`}
      </p>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-[12px] text-slate-600">
          Rows
          <select
            value={perPage}
            onChange={(e) => onPerPage(Number(e.target.value))}
            className="field py-1 px-2 text-[12px] font-mono w-auto cursor-pointer"
          >
            {[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>

        <div className="flex items-center gap-1">
          <button type="button" onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Previous page"
            className={`${btn} text-slate-600 hover:bg-mist-300`}>‹</button>
          <span className="font-mono text-[12px] text-slate-700 tabular-nums px-2">{page} / {pageCount}</span>
          <button type="button" onClick={() => onPage(page + 1)} disabled={page >= pageCount} aria-label="Next page"
            className={`${btn} text-slate-600 hover:bg-mist-300`}>›</button>
        </div>
      </div>
    </div>
  );
}

/* ── Overlays ─────────────────────────────────────────────────────── */
export function Modal({ open, onClose, title, description, children, width = 'max-w-2xl' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      <button className="fixed inset-0 bg-ink-900/60 animate-fade" onClick={onClose} aria-label="Close" tabIndex={-1} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full ${width} my-auto card shadow-lift animate-fade overflow-hidden`}
      >
        <header className="flex items-start justify-between gap-4 px-5 py-4 border-b border-rule bg-mist-100">
          <div>
            <h2 className="font-display text-[17px] font-semibold leading-tight">{title}</h2>
            {description && <p className="text-[12.5px] text-slate-600 mt-0.5">{description}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1.5 -m-1 rounded-md text-slate-600 hover:bg-mist-300">
            <Icon.close className="w-4.5 h-4.5" />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

/** Replaces window.confirm — destructive work states what it removes. */
export function ConfirmDialog({ open, title, body, confirmLabel = 'Delete', onConfirm, onCancel }) {
  return (
    <Modal open={open} onClose={onCancel} title={title} width="max-w-md">
      <div className="p-5">
        <p className="text-[13.5px] text-slate-700 leading-relaxed">{body}</p>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onCancel} className="btn btn-ghost btn-sm">Keep it</button>
          <button
            onClick={onConfirm}
            className="btn btn-sm bg-flag-600 text-white hover:bg-[#9A3624]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ── Sorting ──────────────────────────────────────────────────────── */
/** One sort state for a table. Clicking the active column flips it. */
export function useSort(initialKey, initialDir = 'desc') {
  const [sort, setSort] = useState({ key: initialKey, dir: initialDir });
  const toggle = (key) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
  return [sort, toggle];
}

/** Sorts a copy. `pick` maps a row to its comparable value. */
export function sortRows(rows, sort, pick) {
  const value = pick[sort.key];
  if (!value) return rows;
  return [...rows].sort((a, b) => {
    const av = value(a), bv = value(b);
    const cmp = typeof av === 'string' ? av.localeCompare(bv) : (av ?? 0) - (bv ?? 0);
    return sort.dir === 'asc' ? cmp : -cmp;
  });
}
