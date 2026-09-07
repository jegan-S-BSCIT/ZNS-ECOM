import { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { CATEGORIES, CONCERNS } from '../data/products';
import { useCart } from '../context/CartContext';

export default function Shop() {
  const { products: allProducts, productsLoading } = useCart();
  const { category: urlCategory, slug: urlConcern } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const querySearch = searchParams.get('q') || '';
  const queryConcern = urlConcern || searchParams.get('concern') || '';
  const querySort = searchParams.get('sort') || 'relevance';

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState(() => {
    return urlCategory ? [urlCategory] : [];
  });
  const [selectedConcerns, setSelectedConcerns] = useState(() => {
    return queryConcern ? [queryConcern] : [];
  });
  const [maxPrice, setMaxPrice] = useState(2000);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState(querySort);

  // Re-seed filters from the URL whenever the route/query changes — nav links
  // (category rail, concern links) reuse this same route element, so the
  // component never remounts and the useState initializers won't re-run.
  useEffect(() => {
    setSelectedCategories(urlCategory ? [urlCategory] : []);
    setSelectedConcerns(queryConcern ? [queryConcern] : []);
    setSortBy(querySort);
  }, [urlCategory, queryConcern, querySort]);

  // Mobile/Tablet Filter Drawer State
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = allProducts.slice();

    // Text search query
    if (querySearch.trim()) {
      const q = querySearch.trim().toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.benefitLine.toLowerCase().includes(q) ||
        (p.concerns && p.concerns.some(c => c.toLowerCase().includes(q)))
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }

    // Concern filter
    if (selectedConcerns.length > 0) {
      result = result.filter(p => p.concerns && p.concerns.some(c => selectedConcerns.includes(c)));
    }

    // Price filter
    result = result.filter(p => p.price <= maxPrice);

    // Rating filter
    if (minRating > 0) {
      result = result.filter(p => p.rating >= minRating);
    }

    // Stock availability
    if (inStockOnly) {
      result = result.filter(p => p.stockQuantity > 0);
    }

    // Sort Options
    if (sortBy === 'newest') {
      result.sort((a, b) => b.id.localeCompare(a.id));
    } else if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'best-selling') {
      result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    } else if (sortBy === 'top-rated') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [allProducts, querySearch, selectedCategories, selectedConcerns, maxPrice, minRating, inStockOnly, sortBy]);

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedConcerns([]);
    setMaxPrice(2000);
    setMinRating(0);
    setInStockOnly(false);
    setSortBy('relevance');
    setSearchParams({});
  };

  const handleCategoryToggle = (catId) => {
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter(c => c !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const handleConcernToggle = (cTag) => {
    if (selectedConcerns.includes(cTag)) {
      setSelectedConcerns(selectedConcerns.filter(c => c !== cTag));
    } else {
      setSelectedConcerns([...selectedConcerns, cTag]);
    }
  };

  const activeCategoryObj = CATEGORIES.find(c => c.id === urlCategory);
  const activeConcernObj = CONCERNS.find(c => c.tag === urlConcern);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 1. Breadcrumb */}
      <nav className="text-xs text-[#8E857E] flex items-center gap-2">
        <Link to="/" className="hover:text-[#6E2A45] transition-colors">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-[#6E2A45] transition-colors">Shop</Link>
        {(activeCategoryObj || activeConcernObj) && (
          <>
            <span>/</span>
            <span className="text-[#2A2420] font-semibold">{activeCategoryObj?.name || activeConcernObj?.name}</span>
          </>
        )}
      </nav>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7DECF] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#6E2A45]">
            {activeCategoryObj ? activeCategoryObj.name : activeConcernObj ? activeConcernObj.name : querySearch ? `Search: "${querySearch}"` : 'All Formulations'}
          </h1>
          <p className="text-xs text-[#574F49] mt-1">
            {activeCategoryObj ? activeCategoryObj.description : activeConcernObj ? activeConcernObj.description : 'Explore clean beauty, targeted skin care, and health care rituals.'}
          </p>
        </div>

        {/* 4. Product Count & Sort Bar */}
        <div className="flex items-center justify-between sm:justify-end gap-4 text-xs">
          <span className="text-[#8E857E]">Showing {filteredProducts.length} of {allProducts.length} products</span>
          
          {/* Desktop Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-[#574F49] font-medium hidden sm:inline">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-[#E7DECF] rounded-lg px-3 py-1.5 text-xs text-[#2A2420] outline-none cursor-pointer focus:ring-1 focus:ring-[#C1662E]"
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="best-selling">Best Selling</option>
              <option value="top-rated">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Filter Trigger Button */}
      <div className="lg:hidden flex items-center justify-between bg-white p-3 rounded-xl border border-[#E7DECF] shadow-xs">
        <button
          onClick={() => setIsFilterDrawerOpen(true)}
          className="flex items-center gap-2 text-xs font-bold text-[#6E2A45]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filter Products ({(selectedCategories.length + selectedConcerns.length + (inStockOnly ? 1 : 0))})
        </button>
        {(selectedCategories.length > 0 || selectedConcerns.length > 0 || inStockOnly) && (
          <button onClick={resetFilters} className="text-xs text-[#C1662E] font-semibold underline">
            Clear All
          </button>
        )}
      </div>

      {/* Main PLP Layout: Sidebar (Desktop) + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop 240px Persistent Filter Sidebar */}
        <aside className="hidden lg:block bg-white p-5 rounded-xl border border-[#E7DECF] shadow-zen space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7DECF]">
            <h3 className="font-bold text-sm text-[#6E2A45]">Filter Catalog</h3>
            <button onClick={resetFilters} className="text-[11px] text-[#C1662E] font-medium hover:underline">
              Reset Filters
            </button>
          </div>

          {/* Filter 1: Categories */}
          <div>
            <h4 className="text-xs font-bold text-[#2A2420] uppercase tracking-wider mb-2.5">Category</h4>
            <div className="space-y-2 text-xs text-[#574F49]">
              {CATEGORIES.map(cat => (
                <label key={cat.id} className="flex items-center gap-2 cursor-pointer hover:text-[#6E2A45]">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.id)}
                    onChange={() => handleCategoryToggle(cat.id)}
                    className="rounded border-[#E7DECF] text-[#C1662E] focus:ring-[#C1662E]"
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filter 2: Shop by Concern */}
          <div className="pt-3 border-t border-[#E7DECF]/60">
            <h4 className="text-xs font-bold text-[#2A2420] uppercase tracking-wider mb-2.5">Skin & Hair Concern</h4>
            <div className="space-y-2 text-xs text-[#574F49]">
              {CONCERNS.map(con => (
                <label key={con.id} className="flex items-center gap-2 cursor-pointer hover:text-[#6E2A45]">
                  <input
                    type="checkbox"
                    checked={selectedConcerns.includes(con.tag)}
                    onChange={() => handleConcernToggle(con.tag)}
                    className="rounded border-[#E7DECF] text-[#C1662E] focus:ring-[#C1662E]"
                  />
                  <span>{con.icon} {con.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filter 3: Price Range */}
          <div className="pt-3 border-t border-[#E7DECF]/60">
            <h4 className="text-xs font-bold text-[#2A2420] uppercase tracking-wider mb-2">Max Price: ₹{maxPrice}</h4>
            <input
              type="range"
              min="300"
              max="2000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#C1662E]"
            />
            <div className="flex justify-between text-[10px] text-[#8E857E] mt-1">
              <span>₹300</span>
              <span>₹2,000</span>
            </div>
          </div>

          {/* Filter 4: Rating */}
          <div className="pt-3 border-t border-[#E7DECF]/60">
            <h4 className="text-xs font-bold text-[#2A2420] uppercase tracking-wider mb-2">Minimum Rating</h4>
            <div className="space-y-1.5 text-xs">
              {[4, 4.5, 4.8].map(r => (
                <button
                  key={r}
                  onClick={() => setMinRating(minRating === r ? 0 : r)}
                  className={`w-full text-left px-2 py-1 rounded text-xs transition-colors flex items-center justify-between ${
                    minRating === r ? 'bg-[#F6EFF2] text-[#6E2A45] font-bold' : 'text-[#574F49] hover:bg-gray-50'
                  }`}
                >
                  <span>{r}★ & up</span>
                  {minRating === r && <span>✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Filter 5: Availability */}
          <div className="pt-3 border-t border-[#E7DECF]/60">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#2A2420] font-medium">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-[#E7DECF] text-[#C1662E]"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton aspect-[3/4] rounded-xl" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            /* Empty Result State (per Section 07 requirement) */
            <div className="bg-white rounded-xl border border-[#E7DECF] p-12 text-center shadow-zen">
              <div className="w-16 h-16 rounded-full bg-[#F6EFF2] text-[#6E2A45] flex items-center justify-center mx-auto mb-4 text-2xl">
                🔍
              </div>
              <h3 className="text-lg font-bold text-[#2A2420] mb-2">No matching formulations found</h3>
              <p className="text-xs text-[#8E857E] max-w-md mx-auto mb-6">
                Try resetting your filters or widening your price/category criteria to see available products.
              </p>
              <button
                onClick={resetFilters}
                className="bg-[#C1662E] text-white text-xs font-semibold px-6 py-2.5 rounded-lg hover:bg-[#A35021] transition-colors"
              >
                Clear All Filters
              </button>

              {/* Fallback Suggested Products Grid */}
              <div className="mt-12 text-left pt-8 border-t border-[#E7DECF]">
                <h4 className="text-sm font-bold text-[#6E2A45] mb-4">Suggested Best Sellers:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {allProducts.slice(0, 4).map((p) => (
                    <ProductCard key={p.id} product={p} showBenefit={false} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile/Tablet Filter Drawer Modal */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setIsFilterDrawerOpen(false)} />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#E7DECF] mb-6">
                  <h3 className="text-lg font-bold text-[#6E2A45]">Filter Formulations</h3>
                  <button onClick={() => setIsFilterDrawerOpen(false)} className="text-gray-500 hover:text-black">
                    ✕
                  </button>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-[#2A2420] uppercase tracking-wider mb-3">Categories</h4>
                  <div className="space-y-2 text-xs">
                    {CATEGORIES.map(cat => (
                      <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.id)}
                          onChange={() => handleCategoryToggle(cat.id)}
                          className="rounded border-[#E7DECF] text-[#C1662E]"
                        />
                        <span>{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Concerns */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-[#2A2420] uppercase tracking-wider mb-3">Concerns</h4>
                  <div className="space-y-2 text-xs">
                    {CONCERNS.map(con => (
                      <label key={con.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedConcerns.includes(con.tag)}
                          onChange={() => handleConcernToggle(con.tag)}
                          className="rounded border-[#E7DECF] text-[#C1662E]"
                        />
                        <span>{con.icon} {con.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E7DECF]">
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="w-full bg-[#C1662E] text-white py-3 font-semibold text-xs rounded-lg"
                >
                  Apply Filters ({filteredProducts.length} Results)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
