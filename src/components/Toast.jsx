import { useCart } from '../context/CartContext';

const TONE = {
  success: { bar: 'bg-spruce-600', icon: 'M5 13l4 4L19 7' },
  error: { bar: 'bg-flag-600', icon: 'M12 9v4m0 4h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z' },
  info: { bar: 'bg-amber-600', icon: 'M12 16v-4m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
};

export default function Toast() {
  const { toast, dismissToast } = useCart();
  if (!toast) return null;

  const tone = TONE[toast.type] || TONE.info;

  return (
    <div
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[70] w-[calc(100%-2rem)] max-w-sm px-4 sm:px-0"
      role="status"
      aria-live="polite"
    >
      <div key={toast.key} className="animate-toast flex items-stretch overflow-hidden rounded-xl bg-ink-800 text-white shadow-lift">
        <span className={`w-1 shrink-0 ${tone.bar}`} aria-hidden="true" />
        <div className="flex items-center gap-3 p-3.5 flex-1 min-w-0">
          <svg className="w-[18px] h-[18px] shrink-0 text-white/70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d={tone.icon} />
          </svg>
          <p className="flex-1 text-[13px] leading-snug min-w-0">{toast.message}</p>

          {toast.action && (
            <button
              onClick={() => { toast.action.onClick(); dismissToast(); }}
              className="shrink-0 font-mono text-[11px] tracking-[0.1em] uppercase text-amber-500 hover:text-amber-400 transition-colors"
            >
              {toast.action.label}
            </button>
          )}

          <button
            onClick={dismissToast}
            className="shrink-0 p-1 -m-1 text-white/40 hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
