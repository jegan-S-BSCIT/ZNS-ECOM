import { useId, useState } from 'react';
import { formatPrice } from '../data/products';
import { ALL_STATUSES, CANCELLED } from '../lib/orderStats';

// ── Palette ──────────────────────────────────────────────────────────────────
// Two single-series charts, so each gets one hue — no categorical ramp to
// validate. The status funnel is an *ordinal* ramp (pipeline order), validated
// light→dark on a white surface with dataviz/scripts/validate_palette.js
// --ordinal: monotone lightness, ΔL ≥ 0.06, light end 2.23:1, hue spread 7°.
const PLUM = '#6E2A45';
const ORANGE = '#C1662E';
const STAGE_RAMP = ['#D69EB6', '#C4829F', '#B26686', '#9E4C6E', '#883A59', '#6E2A45', '#501E32'];
const CRITICAL = '#A8402F'; // status token — reserved for Cancelled, never a series
const INK = '#2A2420';
const MUTED = '#8E857E';
const GRID = '#EFE7DA';

const statusColor = (status) =>
  status === CANCELLED ? CRITICAL : STAGE_RAMP[ALL_STATUSES.indexOf(status)] || PLUM;

const compact = (n) => (n >= 1000 ? `${Math.round(n / 100) / 10}k` : String(Math.round(n)));

// A flat series still needs a sane axis, and an all-zero one must not divide by 0.
const niceMax = (values) => {
  const peak = Math.max(0, ...values);
  if (peak === 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(peak));
  return Math.ceil(peak / magnitude) * magnitude;
};

function ChartCard({ title, subtitle, children, table }) {
  const [showTable, setShowTable] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-[#E7DECF] p-5 shadow-zen">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-bold text-sm text-[#2A2420]">{title}</h3>
          {subtitle && <p className="text-[11px] text-[#8E857E] mt-0.5">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-[#8E857E] hover:text-[#6E2A45] border border-[#E7DECF] rounded-md px-2 py-1"
          aria-expanded={showTable}
        >
          {showTable ? 'Chart' : 'Table'}
        </button>
      </div>
      {showTable ? <div className="overflow-x-auto max-h-72">{table}</div> : children}
    </div>
  );
}

function DataTable({ head, rows }) {
  return (
    <table className="w-full text-left text-[11px] tabular-nums">
      <thead className="text-[#8E857E] font-bold uppercase text-[10px]">
        <tr>{head.map((h) => <th key={h} className="py-1.5 pr-3">{h}</th>)}</tr>
      </thead>
      <tbody className="divide-y divide-[#F3EDE3]">
        {rows.map((r, i) => (
          <tr key={i}>{r.map((c, j) => <td key={j} className="py-1.5 pr-3 text-[#574F49]">{c}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Revenue trend — area + 2px line, one hue, one y-axis. Deliberately NOT
 * combined with the order-count chart: two measures on two scales in one plot
 * invents a correlation that isn't in the data.
 */
export function RevenueTrendChart({ data }) {
  const gradientId = useId();
  const [hover, setHover] = useState(null);
  const W = 720, H = 200, PAD_L = 46, PAD_R = 12, PAD_T = 12, PAD_B = 26;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const max = niceMax(data.map((d) => d.revenue));
  // A single point has no width to spread across; pin it to the middle.
  const x = (i) => (data.length === 1 ? PAD_L + plotW / 2 : PAD_L + (i / (data.length - 1)) * plotW);
  const y = (v) => PAD_T + plotH - (v / max) * plotH;

  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(d.revenue).toFixed(1)}`).join(' ');
  const area = `${line} L${x(data.length - 1).toFixed(1)},${PAD_T + plotH} L${x(0).toFixed(1)},${PAD_T + plotH} Z`;
  const ticks = [0, 0.5, 1].map((f) => f * max);
  const peakIdx = data.reduce((best, d, i) => (d.revenue > data[best].revenue ? i : best), 0);
  const active = hover != null ? data[hover] : null;

  return (
    <ChartCard
      title="Revenue trend"
      subtitle="Gross revenue per day, excluding cancelled orders"
      table={<DataTable head={['Date', 'Revenue']} rows={data.map((d) => [d.label, formatPrice(d.revenue)])} />}
    >
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[200px]" role="img" aria-label="Revenue per day">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PLUM} stopOpacity="0.18" />
              <stop offset="100%" stopColor={PLUM} stopOpacity="0" />
            </linearGradient>
          </defs>

          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD_L} x2={W - PAD_R} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth="1" />
              <text x={PAD_L - 8} y={y(t) + 3} textAnchor="end" fontSize="9" fill={MUTED} className="tabular-nums">
                ₹{compact(t)}
              </text>
            </g>
          ))}

          <path d={area} fill={`url(#${gradientId})`} />
          <path d={line} fill="none" stroke={PLUM} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

          {/* Direct-label the peak only — a number on every point goes unread. */}
          {max > 0 && data[peakIdx].revenue > 0 && (
            <text x={x(peakIdx)} y={y(data[peakIdx].revenue) - 8} textAnchor="middle" fontSize="10" fontWeight="700" fill={INK}>
              {formatPrice(data[peakIdx].revenue)}
            </text>
          )}

          {active && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={PAD_T} y2={PAD_T + plotH} stroke={PLUM} strokeWidth="1" strokeOpacity="0.35" />
              <circle cx={x(hover)} cy={y(active.revenue)} r="4.5" fill={PLUM} stroke="#fff" strokeWidth="2" />
            </g>
          )}

          {data.map((d, i) => (
            <rect
              key={d.date}
              x={x(i) - plotW / Math.max(data.length, 1) / 2}
              y={PAD_T}
              width={Math.max(plotW / Math.max(data.length, 1), 12)}
              height={plotH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <title>{`${d.label}: ${formatPrice(d.revenue)}`}</title>
            </rect>
          ))}

          {data.map((d, i) =>
            i % Math.ceil(data.length / 6) === 0 ? (
              <text key={d.date} x={x(i)} y={H - 8} textAnchor="middle" fontSize="9" fill={MUTED}>
                {d.label}
              </text>
            ) : null
          )}
        </svg>

        {active && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full bg-[#2A2420] text-white text-[10px] font-semibold rounded-md px-2 py-1 shadow-lg whitespace-nowrap"
            style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(active.revenue) / H) * 100 - 4}%` }}
          >
            {active.label} · {formatPrice(active.revenue)}
          </div>
        )}
      </div>
    </ChartCard>
  );
}

/** Order volume per day — its own chart, its own axis. */
export function OrderVolumeChart({ data }) {
  const [hover, setHover] = useState(null);
  const W = 720, H = 180, PAD_L = 34, PAD_R = 12, PAD_T = 14, PAD_B = 26;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const max = niceMax(data.map((d) => d.orders));
  const slot = plotW / Math.max(data.length, 1);
  const barW = Math.max(slot - 2, 2); // 2px surface gap between adjacent bars
  const y = (v) => PAD_T + plotH - (v / max) * plotH;
  const total = data.reduce((n, d) => n + d.orders, 0);

  return (
    <ChartCard
      title="Order volume"
      subtitle={`${total} order${total === 1 ? '' : 's'} placed in this window`}
      table={<DataTable head={['Date', 'Orders']} rows={data.map((d) => [d.label, d.orders])} />}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[180px]" role="img" aria-label="Orders per day">
        {[0, max].map((t) => (
          <g key={t}>
            <line x1={PAD_L} x2={W - PAD_R} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth="1" />
            <text x={PAD_L - 8} y={y(t) + 3} textAnchor="end" fontSize="9" fill={MUTED} className="tabular-nums">
              {compact(t)}
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const h = (d.orders / max) * plotH;
          return (
            <g key={d.date} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              {/* Full-height hit area so a 1-order bar isn't a pinpoint target. */}
              <rect x={PAD_L + i * slot} y={PAD_T} width={slot} height={plotH} fill="transparent" />
              <rect
                x={PAD_L + i * slot + (slot - barW) / 2}
                y={y(d.orders)}
                width={barW}
                height={Math.max(h, d.orders > 0 ? 2 : 0)}
                rx="2"
                fill={ORANGE}
                fillOpacity={hover == null || hover === i ? 1 : 0.35}
              >
                <title>{`${d.label}: ${d.orders} order${d.orders === 1 ? '' : 's'}`}</title>
              </rect>
              {hover === i && d.orders > 0 && (
                <text x={PAD_L + i * slot + slot / 2} y={y(d.orders) - 5} textAnchor="middle" fontSize="10" fontWeight="700" fill={INK}>
                  {d.orders}
                </text>
              )}
            </g>
          );
        })}

        {data.map((d, i) =>
          i % Math.ceil(data.length / 6) === 0 ? (
            <text key={d.date} x={PAD_L + i * slot + slot / 2} y={H - 8} textAnchor="middle" fontSize="9" fill={MUTED}>
              {d.label}
            </text>
          ) : null
        )}
      </svg>
    </ChartCard>
  );
}

/** Where orders currently sit in the pipeline — horizontal ordinal bars. */
export function StatusFunnelChart({ data, onSelect, selected }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((n, d) => n + d.count, 0);

  return (
    <ChartCard
      title="Orders by status"
      subtitle="Click a stage to filter the order list"
      table={<DataTable head={['Status', 'Orders', 'Share']} rows={data.map((d) => [d.status, d.count, total ? `${Math.round((d.count / total) * 100)}%` : '0%'])} />}
    >
      <div className="space-y-2">
        {data.map((d) => {
          const isActive = selected === d.status;
          return (
            <button
              key={d.status}
              type="button"
              onClick={() => onSelect?.(isActive ? '' : d.status)}
              aria-pressed={isActive}
              className={`w-full flex items-center gap-3 text-left rounded-lg px-2 py-1.5 transition-colors ${
                isActive ? 'bg-[#FBF8F4] ring-1 ring-[#6E2A45]' : 'hover:bg-[#FBF8F4]'
              }`}
            >
              <span className="w-28 shrink-0 text-[11px] font-semibold text-[#574F49] truncate">
                {d.status === CANCELLED ? '⚠ ' : ''}{d.status}
              </span>
              <span className="flex-1 h-3 bg-[#F5F0E8] rounded-full overflow-hidden">
                <span
                  className="block h-full rounded-full transition-[width] duration-300"
                  style={{ width: `${(d.count / max) * 100}%`, background: statusColor(d.status) }}
                />
              </span>
              <span className="w-8 shrink-0 text-right text-[11px] font-bold text-[#2A2420] tabular-nums">{d.count}</span>
            </button>
          );
        })}
      </div>
    </ChartCard>
  );
}

/** Best sellers in the window — one hue, ranked; length carries the magnitude. */
export function TopProductsChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.revenue));
  if (!data.length) {
    return (
      <ChartCard title="Top products" subtitle="By revenue in this window" table={<DataTable head={['Product']} rows={[['No sales yet']]} />}>
        <p className="text-xs text-[#8E857E] py-8 text-center">No sales in this window yet.</p>
      </ChartCard>
    );
  }
  return (
    <ChartCard
      title="Top products"
      subtitle="By revenue in this window"
      table={<DataTable head={['Product', 'Units', 'Revenue']} rows={data.map((d) => [d.name, d.units, formatPrice(d.revenue)])} />}
    >
      <div className="space-y-2.5">
        {data.map((d) => (
          <div key={d.id} className="flex items-center gap-3">
            <span className="w-32 shrink-0 text-[11px] font-semibold text-[#574F49] truncate" title={d.name}>{d.name}</span>
            <span className="flex-1 h-3 bg-[#F5F0E8] rounded-full overflow-hidden">
              <span className="block h-full rounded-full" style={{ width: `${(d.revenue / max) * 100}%`, background: PLUM }} />
            </span>
            <span className="w-20 shrink-0 text-right text-[11px] font-bold text-[#2A2420] tabular-nums">{formatPrice(d.revenue)}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

/** KPI tile. `delta` is a percentage, or null when there is no baseline. */
export function StatTile({ label, value, delta, tone = 'default' }) {
  const tones = {
    default: 'bg-white border-[#E7DECF] text-[#2A2420]',
    brand: 'bg-white border-[#E7DECF] text-[#6E2A45]',
    accent: 'bg-white border-[#E7DECF] text-[#C1662E]',
    alert: 'bg-[#FBF0EE] border-[#A8402F]/30 text-[#A8402F]'
  };
  return (
    <div className={`p-5 rounded-2xl border shadow-zen ${tones[tone]}`}>
      <span className="block text-[10px] font-bold uppercase tracking-wider text-[#8E857E]">{label}</span>
      <div className="text-2xl font-extrabold mt-1">{value}</div>
      {delta != null && (
        <div className={`text-[10px] font-bold mt-1 ${delta >= 0 ? 'text-[#4F7A5B]' : 'text-[#A8402F]'}`}>
          {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(0)}% vs previous period
        </div>
      )}
    </div>
  );
}

/** One filter row above every chart it scopes — never per-chart controls. */
export function RangeFilter({ value, onChange, options = [7, 30, 90] }) {
  return (
    <div className="inline-flex rounded-lg border border-[#E7DECF] bg-white p-0.5" role="group" aria-label="Date range">
      {options.map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => onChange(d)}
          aria-pressed={value === d}
          className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-colors ${
            value === d ? 'bg-[#6E2A45] text-white' : 'text-[#574F49] hover:bg-[#FBF8F4]'
          }`}
        >
          {d}D
        </button>
      ))}
    </div>
  );
}
