import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import MiniCartDrawer from './components/MiniCartDrawer';
import Toast from './components/Toast';
import Home from './pages/Home';

// Everything past the landing page is split out, so a first visit no longer
// downloads the admin dashboard and seven policy pages.
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));
const Account = lazy(() => import('./pages/Account'));
const Login = lazy(() => import('./pages/Login'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

const AboutUs = lazy(() => import('./pages/policies/AboutUs'));
const ContactUs = lazy(() => import('./pages/policies/ContactUs'));
const FAQ = lazy(() => import('./pages/policies/FAQ'));
const PrivacyPolicy = lazy(() => import('./pages/policies/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/policies/Terms'));
const ShippingPolicy = lazy(() => import('./pages/policies/ShippingPolicy'));
const ReturnPolicy = lazy(() => import('./pages/policies/ReturnPolicy'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function RouteFallback() {
  return (
    <div className="shell py-20" role="status" aria-label="Loading">
      <div className="skeleton h-8 w-52 rounded-md" />
      <div className="skeleton h-4 w-80 max-w-full rounded mt-4" />
      <div className="mt-10 grid gap-5 grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton aspect-[3/4] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="shell py-24 text-center max-w-md">
      <p className="eyebrow justify-center text-amber-700">Error 404</p>
      <h1 className="font-display text-4xl font-semibold mt-4">This page isn’t on the shelf</h1>
      <p className="mt-3 text-slate-600">
        The link may be out of date. The full catalog is still one click away.
      </p>
      <div className="mt-7 flex justify-center gap-3">
        <Link to="/shop" className="btn btn-primary">Browse the formulary</Link>
        <Link to="/" className="btn btn-ghost">Go home</Link>
      </div>
    </div>
  );
}

export default function App() {
  const isAdminPage = useLocation().pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Toast />
      <MiniCartDrawer />

      <a href="#main" className="skip-link">Skip to content</a>
      {!isAdminPage && <Header />}

      <main id="main" className="flex-1">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:category" element={<Shop />} />
            <Route path="/concern/:slug" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
            <Route path="/account" element={<Account />} />
            <Route path="/login" element={<Login />} />

            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />

            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/shipping-policy" element={<ShippingPolicy />} />
            <Route path="/return-policy" element={<ReturnPolicy />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      {!isAdminPage && <Footer />}
    </div>
  );
}
