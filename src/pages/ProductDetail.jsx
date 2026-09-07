import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../data/products';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist, showToast, products: allProducts, productsLoading } = useCart();

  const product = allProducts.find((p) => p.slug === id || p.id === id);

  // Hooks must run unconditionally every render, so they're declared before the
  // not-found/loading early-return below rather than gated behind `product`.
  const images = product?.images?.length ? product.images : (product?.image ? [product.image] : []);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('ingredients'); // Default to ingredients/description

  // Delivery check state
  const [pincode, setPincode] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState(null);

  // Write Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', name: '' });

  // Frequently bought together items
  const fbtItems = product
    ? allProducts.filter(p => p.id !== product.id && p.category === product.category).slice(0, 2)
    : [];
  const [selectedFbt, setSelectedFbt] = useState(fbtItems.map(p => p.id));

  if (!product) {
    if (productsLoading) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8" role="status" aria-label="Loading">
          <div className="skeleton h-8 w-52 rounded-md" />
          <div className="mt-6 grid lg:grid-cols-2 gap-8">
            <div className="skeleton aspect-square rounded-2xl" />
            <div className="space-y-4">
              <div className="skeleton h-6 w-3/4 rounded" />
              <div className="skeleton h-4 w-1/2 rounded" />
              <div className="skeleton h-40 rounded-xl" />
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-[#6E2A45] mb-2">Product not found</h2>
        <Link to="/shop" className="text-xs font-semibold text-[#C1662E] underline">
          Return to Shop &rarr;
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (pincode.length === 6) {
      setDeliveryStatus({
        valid: true,
        date: "Delivery in 2-4 Days (Free Shipping)",
        cod: true
      });
    } else {
      setDeliveryStatus({
        valid: false,
        message: "Please enter a valid 6-digit Pincode"
      });
    }
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleAddFbtToCart = () => {
    addToCart(product, 1);
    fbtItems.forEach(item => {
      if (selectedFbt.includes(item.id)) {
        addToCart(item, 1);
      }
    });
    showToast('Bundle added to cart successfully!', 'success');
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    showToast('Thank you! Your review has been submitted for moderation.', 'success');
    setIsReviewModalOpen(false);
    setNewReview({ rating: 5, comment: '', name: '' });
  };

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const fbtTotal = product.price + fbtItems
    .filter(item => selectedFbt.includes(item.id))
    .reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-[#8E857E] flex items-center gap-2">
        <Link to="/" className="hover:text-[#6E2A45]">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-[#6E2A45]">Shop</Link>
        <span>/</span>
        <Link to={`/shop/${product.category}`} className="hover:text-[#6E2A45] capitalize">
          {product.category.replace('-', ' ')}
        </Link>
        <span>/</span>
        <span className="text-[#2A2420] font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Above the Fold: Gallery (Left) + Purchase Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left — Image Gallery (5 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square bg-[#FBF8F4] rounded-2xl border border-[#E7DECF] overflow-hidden shadow-zen relative group">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-[#C1662E] text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                Save {discount}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-xl border-2 overflow-hidden shrink-0 transition-all ${
                    selectedImage === idx ? 'border-[#C1662E] ring-2 ring-[#C1662E]/20' : 'border-[#E7DECF] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right — Purchase Panel (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#B8934A]">
                {product.category.replace('-', ' ')}
              </span>
              <button
                onClick={() => toggleWishlist(product)}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
                  inWishlist ? 'border-[#6E2A45] bg-[#F6EFF2] text-[#6E2A45]' : 'border-[#E7DECF] text-[#574F49] hover:bg-gray-50'
                }`}
              >
                <svg className={`w-4 h-4 ${inWishlist ? 'fill-[#6E2A45]' : 'fill-none stroke-currentColor'}`} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.684a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {inWishlist ? 'Saved in Wishlist' : 'Save to Wishlist'}
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#2A2420] mt-2 leading-tight">
              {product.name}
            </h1>

            {/* Star Rating & Review Count Link */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex text-[#B8934A]">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-4 h-4 ${i < Math.floor(product.rating || 5) ? 'fill-current' : 'text-gray-300 fill-current'}`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs font-bold text-[#2A2420]">{product.rating}</span>
              <a href="#reviews" onClick={() => setActiveTab('reviews')} className="text-xs text-[#6E2A45] hover:underline font-medium">
                ({product.reviewCount} customer reviews)
              </a>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-[#FBF8F4] p-4 rounded-xl border border-[#E7DECF] flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-bold text-[#6E2A45]">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-[#8E857E] line-through font-normal">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#4F7A5B] font-medium mt-0.5">Inclusive of all taxes • Free Shipping above ₹499</p>
            </div>
            {product.stockQuantity < 10 && (
              <span className="bg-[#FBF0EE] text-[#A8402F] text-[11px] font-bold px-3 py-1 rounded-full border border-[#A8402F]/20">
                Only {product.stockQuantity} left in stock
              </span>
            )}
          </div>

          {/* Fast-Read Benefit Bullets */}
          {product.shortBullets && (
            <div className="space-y-2 py-2 border-y border-[#E7DECF]/60">
              <h4 className="text-xs font-bold text-[#2A2420] uppercase tracking-wider">Fast-Read Highlights:</h4>
              <ul className="space-y-1 text-xs text-[#574F49]">
                {product.shortBullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#4F7A5B] font-bold">✓</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quantity Selector & Action Buttons (Side by Side) */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-[#2A2420]">Quantity:</span>
              <div className="flex items-center border border-[#E7DECF] rounded-lg bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-sm font-semibold hover:bg-gray-100 text-[#2A2420]"
                >
                  -
                </button>
                <span className="px-4 text-xs font-bold text-[#2A2420]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-sm font-semibold hover:bg-gray-100 text-[#2A2420]"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Add to Cart (Secondary style plum outline) */}
              <button
                onClick={() => addToCart(product, quantity)}
                className="w-full border-2 border-[#6E2A45] text-[#6E2A45] hover:bg-[#F6EFF2] py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-colors shadow-xs"
              >
                Add to Cart
              </button>

              {/* Buy Now (Primary style terracotta fill) */}
              <button
                onClick={handleBuyNow}
                className="w-full bg-[#C1662E] hover:bg-[#A35021] text-white py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-colors shadow-md"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Pincode & Delivery Availability Check */}
          <div className="bg-white p-4 rounded-xl border border-[#E7DECF] space-y-3">
            <h4 className="text-xs font-bold text-[#2A2420] flex items-center gap-2">
              <svg className="w-4 h-4 text-[#C1662E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Check Delivery & Cash on Delivery (COD)
            </h4>
            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit Pincode (e.g. 400001)"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="flex-1 px-3 py-2 text-xs border border-[#E7DECF] rounded-lg outline-none focus:ring-1 focus:ring-[#C1662E]"
              />
              <button type="submit" className="bg-[#6E2A45] text-white px-4 py-2 text-xs font-semibold rounded-lg hover:bg-[#5C2239]">
                Check
              </button>
            </form>

            {deliveryStatus && (
              <div className="text-xs pt-1">
                {deliveryStatus.valid ? (
                  <p className="text-[#4F7A5B] font-medium">✓ {deliveryStatus.date} • COD Available</p>
                ) : (
                  <p className="text-[#A8402F] font-medium">{deliveryStatus.message}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Information Tabs / Accordion Sections (Mandatory PDF Specification) */}
      <div id="reviews" className="bg-white rounded-2xl border border-[#E7DECF] shadow-zen overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-[#E7DECF] bg-[#FBF8F4] overflow-x-auto hide-scrollbar">
          {[
            { id: 'ingredients', label: 'Ingredients (INCI)' },
            { id: 'how-to-use', label: 'How to Use' },
            { id: 'description', label: 'Description & Story' },
            { id: 'specifications', label: 'Specifications' },
            { id: 'reviews', label: `Reviews (${product.reviewCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#6E2A45] text-[#6E2A45] bg-white'
                  : 'border-transparent text-[#574F49] hover:text-[#2A2420]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="p-6 sm:p-8 text-xs sm:text-sm text-[#574F49] leading-relaxed">
          {/* Tab 1: Ingredients (Non-negotiable trust builder) */}
          {activeTab === 'ingredients' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#6E2A45] mb-2">Hero Active Ingredients</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                  {product.ingredients?.heroIngredients?.map((hero, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#F6EFF2] border border-[#6E2A45]/20">
                      <h4 className="font-bold text-[#6E2A45] text-xs mb-1">{hero.name}</h4>
                      <p className="text-xs text-[#574F49]">{hero.benefit}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#2A2420] mb-2">Full INCI Composition</h3>
                <p className="p-4 bg-[#FBF8F4] rounded-xl border border-[#E7DECF] text-xs font-mono text-[#2A2420] leading-relaxed">
                  {product.ingredients?.inci}
                </p>
                <p className="text-[11px] text-[#8E857E] mt-2 italic">
                  Free from parabens, mineral oils, sulfates, phthalates, and synthetic fragrance.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: How to Use */}
          {activeTab === 'how-to-use' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#6E2A45] mb-3">Step-by-Step Directions</h3>
              <ol className="space-y-3">
                {product.howToUse?.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-[#FBF8F4] p-3 rounded-lg border border-[#E7DECF]">
                    <span className="w-6 h-6 rounded-full bg-[#6E2A45] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs text-[#2A2420] pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>

              <div className="p-3 bg-[#FDF3EC] rounded-lg border border-[#C1662E]/30 text-xs text-[#A35021]">
                <strong>Patch Test Warning:</strong> We recommend conducting a patch test on your inner forearm 24 hours prior to first full application.
              </div>
            </div>
          )}

          {/* Tab 3: Description */}
          {activeTab === 'description' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#6E2A45]">Product Story & Clinical Rationale</h3>
              <p>{product.description}</p>
              <p className="pt-2 text-xs text-[#2A2420] font-medium">{product.expandedBenefits}</p>
            </div>
          )}

          {/* Tab 4: Specifications */}
          {activeTab === 'specifications' && (
            <div className="max-w-md divide-y divide-[#E7DECF] border border-[#E7DECF] rounded-xl overflow-hidden">
              <div className="flex justify-between p-3 bg-[#FBF8F4]">
                <span className="font-semibold text-[#574F49]">Volume / Size:</span>
                <span className="font-bold text-[#2A2420]">{product.specifications?.size}</span>
              </div>
              <div className="flex justify-between p-3 bg-white">
                <span className="font-semibold text-[#574F49]">Shelf Life:</span>
                <span className="font-bold text-[#2A2420]">{product.specifications?.shelfLife}</span>
              </div>
              <div className="flex justify-between p-3 bg-[#FBF8F4]">
                <span className="font-semibold text-[#574F49]">Country of Origin:</span>
                <span className="font-bold text-[#2A2420]">{product.specifications?.countryOfOrigin}</span>
              </div>
              <div className="flex justify-between p-3 bg-white">
                <span className="font-semibold text-[#574F49]">Formulation Type:</span>
                <span className="font-bold text-[#2A2420]">{product.specifications?.form}</span>
              </div>
            </div>
          )}

          {/* Tab 5: Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-[#FBF8F4] rounded-xl border border-[#E7DECF]">
                <div className="text-center sm:text-left">
                  <div className="text-4xl font-extrabold text-[#6E2A45]">{product.rating}</div>
                  <div className="text-xs text-[#8E857E] mt-1">Based on {product.reviewCount} reviews</div>
                </div>

                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="bg-[#C1662E] text-white px-6 py-2.5 text-xs font-bold rounded-lg hover:bg-[#A35021] transition-colors"
                >
                  Write a Review
                </button>
              </div>

              {/* Review Cards List */}
              <div className="space-y-4">
                {product.reviewsList?.map((rev) => (
                  <div key={rev.id} className="p-4 bg-white rounded-xl border border-[#E7DECF]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#2A2420]">{rev.author}</span>
                        {rev.verified && (
                          <span className="text-[10px] bg-[#EEF4F0] text-[#4F7A5B] font-semibold px-2 py-0.5 rounded-full">
                            Verified
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#8E857E]">{rev.date}</span>
                    </div>
                    <p className="text-xs text-[#574F49] italic">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Frequently Bought Together (Direct AOV Lever per Section 08 requirement) */}
      {fbtItems.length > 0 && (
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7DECF] shadow-zen">
          <h3 className="text-lg font-bold text-[#6E2A45] mb-2">Frequently Bought Together</h3>
          <p className="text-xs text-[#574F49] mb-6">Complete your routine with these complementary formulas.</p>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Main Product */}
              <div className="flex items-center gap-3">
                <img src={images[0]} alt={product.name} className="w-16 h-16 object-cover rounded-lg border border-[#E7DECF]" />
                <div className="text-xs">
                  <p className="font-bold text-[#2A2420] max-w-[150px] truncate">{product.name}</p>
                  <p className="text-[#C1662E] font-bold">{formatPrice(product.price)}</p>
                </div>
              </div>

              {/* FBT Items */}
              {fbtItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <span className="text-gray-400 font-bold text-lg">+</span>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFbt.includes(item.id)}
                      onChange={() => {
                        if (selectedFbt.includes(item.id)) {
                          setSelectedFbt(selectedFbt.filter(id => id !== item.id));
                        } else {
                          setSelectedFbt([...selectedFbt, item.id]);
                        }
                      }}
                      className="rounded border-[#E7DECF] text-[#C1662E]"
                    />
                    <img src={item.images ? item.images[0] : item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg border border-[#E7DECF]" />
                    <div className="text-xs">
                      <p className="font-bold text-[#2A2420] max-w-[150px] truncate">{item.name}</p>
                      <p className="text-[#C1662E] font-bold">{formatPrice(item.price)}</p>
                    </div>
                  </label>
                </div>
              ))}
            </div>

            {/* Total & Action */}
            <div className="bg-[#FBF8F4] p-4 rounded-xl border border-[#E7DECF] text-center lg:text-right shrink-0 w-full lg:w-auto">
              <div className="text-xs text-[#574F49]">Combined Bundle Price:</div>
              <div className="text-xl font-bold text-[#6E2A45] my-1">{formatPrice(fbtTotal)}</div>
              <button
                onClick={handleAddFbtToCart}
                className="w-full lg:w-auto bg-[#C1662E] text-white px-6 py-2.5 text-xs font-bold rounded-lg hover:bg-[#A35021] transition-colors"
              >
                Add All Selected to Cart
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Related Products Grid */}
      <section>
        <h3 className="text-xl font-bold text-[#6E2A45] mb-6">Related Formulations</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {allProducts.filter(p => p.id !== product.id).slice(0, 4).map(p => (
            <ProductCard key={p.id} product={p} showBenefit={false} />
          ))}
        </div>
      </section>

      {/* Write Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-[#6E2A45]">Write a Review for {product.name}</h3>
            <form onSubmit={handleAddReview} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={newReview.name}
                  onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                  className="w-full p-2.5 border border-[#E7DECF] rounded-lg outline-none focus:ring-1 focus:ring-[#C1662E]"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Star Rating</label>
                <select
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                  className="w-full p-2.5 border border-[#E7DECF] rounded-lg outline-none"
                >
                  <option value={5}>5 Stars — Excellent</option>
                  <option value={4}>4 Stars — Very Good</option>
                  <option value={3}>3 Stars — Average</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Your Honest Review</label>
                <textarea
                  rows="3"
                  required
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="w-full p-2.5 border border-[#E7DECF] rounded-lg outline-none focus:ring-1 focus:ring-[#C1662E]"
                ></textarea>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 border border-[#E7DECF] text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#C1662E] text-white text-xs font-semibold rounded-lg"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
