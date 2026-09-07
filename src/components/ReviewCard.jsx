export default function ReviewCard({ review }) {
  return (
    <figure className="card p-5 flex flex-col h-full">
      <div className="flex items-center justify-between gap-3">
        <span className="flex text-amber-600" aria-label={`Rated ${review.rating} out of 5`}>
          {[0, 1, 2, 3, 4].map((i) => (
            <svg key={i} viewBox="0 0 20 20" className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'fill-rule'}`}>
              <path d="M10 1.6l2.5 5.4 5.6.7-4.1 3.9 1.1 5.8L10 14.6 4.9 17.4 6 11.6 1.9 7.7l5.6-.7z" />
            </svg>
          ))}
        </span>
        <time className="font-mono text-[11px] text-slate-400">{review.date}</time>
      </div>

      <blockquote className="mt-4 flex-1 text-[14px] leading-relaxed text-slate-700">
        {review.comment}
      </blockquote>

      <figcaption className="mt-5 pt-4 border-t border-rule flex items-center gap-3">
        <span className="w-8 h-8 shrink-0 grid place-items-center rounded-full bg-spruce-800 text-white font-mono text-[12px] font-medium uppercase">
          {review.author[0]}
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="text-[13px] font-semibold truncate">{review.author}</span>
            {review.verified && (
              <svg className="w-3.5 h-3.5 shrink-0 text-spruce-600" viewBox="0 0 20 20" fill="currentColor" aria-label="Verified purchase">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.7a1 1 0 00-1.4-1.4L9 10.2 7.7 8.9a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0z" clipRule="evenodd" />
              </svg>
            )}
          </span>
          {review.productChip && (
            <span className="block font-mono text-[11px] text-slate-400 truncate">{review.productChip}</span>
          )}
        </span>
      </figcaption>
    </figure>
  );
}
