import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import HomePage from './pages/HomePage';
import CataloguePage from './pages/CataloguePage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import OtpPage from './pages/OtpPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

function StoreApp() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  const handleSelectProduct = (productId) => {
    setSelectedProductId(productId);
    setCurrentView('product');
  };

  const handleOrderSuccess = (order) => {
    setLastPlacedOrder(order);
    setCurrentView('order_confirmation');
  };

  return (
    <div className="min-h-screen flex flex-col bg-veloura-cream text-veloura-dark">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        setView={setCurrentView}
        setSelectedCategory={setSelectedCategory}
        setSearchQuery={setSearchQuery}
      />

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        onCheckout={() => setCurrentView('checkout')}
        onViewCatalogue={() => {
          setSelectedCategory('all');
          setCurrentView('catalogue');
        }}
      />

      {/* Main Dynamic View */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            setView={setCurrentView}
            setSelectedCategory={setSelectedCategory}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'catalogue' && (
          <CataloguePage
            category={selectedCategory}
            setCategory={setSelectedCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentView === 'product' && (
          <ProductDetailsPage
            productId={selectedProductId}
            onBack={() => setCurrentView('catalogue')}
            onSelectProduct={handleSelectProduct}
            onBuyNow={() => setCurrentView('checkout')}
          />
        )}

        {currentView === 'signup' && (
          <SignupPage
            setView={setCurrentView}
            setOtpEmail={setOtpEmail}
          />
        )}

        {currentView === 'login' && (
          <LoginPage
            setView={setCurrentView}
            setOtpEmail={setOtpEmail}
            onSuccessRedirect="profile"
          />
        )}

        {currentView === 'otp' && (
          <OtpPage
            email={otpEmail}
            setView={setCurrentView}
            onSuccessRedirect="profile"
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutPage
            onOrderSuccess={handleOrderSuccess}
            onViewCatalogue={() => {
              setSelectedCategory('all');
              setCurrentView('catalogue');
            }}
          />
        )}

        {currentView === 'order_confirmation' && (
          <OrderConfirmationPage
            order={lastPlacedOrder}
            onViewOrders={() => setCurrentView('profile')}
            onContinueShopping={() => {
              setSelectedCategory('all');
              setCurrentView('catalogue');
            }}
          />
        )}

        {(currentView === 'profile' || currentView === 'orders') && (
          <ProfilePage
            setView={setCurrentView}
            onViewCatalogue={() => {
              setSelectedCategory('all');
              setCurrentView('catalogue');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        setView={setCurrentView}
        setSelectedCategory={setSelectedCategory}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <StoreApp />
      </CartProvider>
    </AuthProvider>
  );
}
