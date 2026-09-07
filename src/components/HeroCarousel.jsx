import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HERO_SLIDES from '../data/heroSlides';

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div
      className="relative bg-[#46192B] text-white overflow-hidden shadow-zen rounded-2xl my-4 max-w-7xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative min-h-[360px] sm:min-h-[420px] flex items-center">
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Slide Background Image */}
              <img
                src={slide.bgImage}
                alt={slide.headline}
                className="w-full h-full object-cover object-center"
              />
              {/* Dark Editorial Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#46192B]/95 via-[#46192B]/75 to-transparent" />

              {/* Slide Content */}
              <div className="relative z-20 h-full max-w-2xl px-6 sm:px-12 flex flex-col justify-center py-10">
                {slide.badge && (
                  <span className="inline-block bg-[#B8934A] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 w-fit shadow-xs">
                    {slide.badge}
                  </span>
                )}
                <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight mb-3">
                  {slide.headline}
                </h1>
                <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed mb-6 max-w-lg">
                  {slide.subline}
                </p>
                <div>
                  <Link
                    to={slide.ctaLink}
                    className="inline-block bg-[#C1662E] text-white font-semibold text-xs sm:text-sm px-7 py-3 rounded-lg hover:bg-[#A35021] transition-all shadow-lg hover:scale-105"
                  >
                    {slide.ctaText} &rarr;
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-6 sm:left-12 z-30 flex items-center gap-2">
        {HERO_SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide ? 'w-8 bg-[#C1662E]' : 'w-2 bg-white/50 hover:bg-white'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
