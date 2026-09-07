import { useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

export default function ProductRail({ title, seeAllText, seeAllLink, products }) {
  const railRef = useRef(null);

  const scroll = (direction) => {
    if (railRef.current) {
      const scrollAmount = direction === 'left' ? -600 : 600;
      railRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="bg-white p-4 my-3 rounded shadow-sm relative group">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-3 border-b border-gray-100 pb-2">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
          {title}
        </h2>
        {seeAllLink && seeAllText && (
          <Link
            to={seeAllLink}
            className="text-xs sm:text-sm font-semibold text-[#007185] hover:text-[#C7511F] hover:underline"
          >
            {seeAllText} →
          </Link>
        )}
      </div>

      {/* Rail Container */}
      <div className="relative">
        {/* Left Arrow Button */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white border border-gray-300 shadow-md p-2 rounded-r opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center h-20 w-9 text-gray-800"
          aria-label="Scroll left"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Scrollable Products List */}
        <div
          ref={railRef}
          className="flex gap-3 overflow-x-auto hide-scrollbar rail-scroll py-1"
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white border border-gray-300 shadow-md p-2 rounded-l opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center h-20 w-9 text-gray-800"
          aria-label="Scroll right"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
}
