import React, { useState } from 'react';
import { ShoppingBag, User, Search, Menu, X, CheckCircle, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ currentView, setView, setSelectedCategory, setSearchQuery }) {
  const { cartCount, setIsCartOpen } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleCategoryNav = (cat) => {
    setSelectedCategory(cat);
    setView('catalogue');
    setMobileMenuOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchQuery(searchTerm.trim());
      setView('catalogue');
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-veloura-cream/95 backdrop-blur-md border-b border-veloura-sand/80 transition-all">
      {/* Top Notification Banner */}
      <div className="bg-veloura-dark text-veloura-sand text-xs py-1.5 px-4 text-center font-medium tracking-wider uppercase">
        Complimentary Express Shipping Across India On Orders Above ₹999
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-veloura-dark hover:text-veloura-gold transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => setView('home')}>
            <span className="font-serif text-2xl sm:text-3xl font-bold tracking-[0.2em] text-veloura-dark uppercase">
              Veloura
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-veloura-gold ml-1.5"></span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex space-x-8 text-sm font-medium tracking-widest uppercase">
            <button
              onClick={() => setView('home')}
              className={`transition-colors py-2 ${currentView === 'home' ? 'text-veloura-gold font-semibold' : 'text-veloura-dark hover:text-veloura-gold'}`}
            >
              Home
            </button>
            <button
              onClick={() => handleCategoryNav('all')}
              className={`transition-colors py-2 ${currentView === 'catalogue' ? 'text-veloura-gold font-semibold' : 'text-veloura-dark hover:text-veloura-gold'}`}
            >
              All Garments
            </button>
            <button
              onClick={() => handleCategoryNav('men')}
              className="transition-colors py-2 text-veloura-dark hover:text-veloura-gold"
            >
              Men (30)
            </button>
            <button
              onClick={() => handleCategoryNav('women')}
              className="transition-colors py-2 text-veloura-dark hover:text-veloura-gold"
            >
              Women (30)
            </button>
            <button
              onClick={() => handleCategoryNav('kids')}
              className="transition-colors py-2 text-veloura-dark hover:text-veloura-gold"
            >
              Kids (30)
            </button>
            <button
              onClick={() => handleCategoryNav('infants')}
              className="transition-colors py-2 text-veloura-dark hover:text-veloura-gold"
            >
              Infants (30)
            </button>
          </nav>

          {/* Actions: Search, User, Cart */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-veloura-dark hover:text-veloura-gold transition"
              aria-label="Search catalogue"
            >
              <Search size={20} />
            </button>

            {/* User Account / Profile */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="p-2 text-veloura-dark hover:text-veloura-gold transition flex items-center gap-1"
                aria-label="User account"
              >
                <User size={20} />
                {isAuthenticated && (
                  <span className="hidden sm:inline-block text-xs font-semibold text-veloura-dark max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                )}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl py-2 z-50 border border-veloura-sand animate-in fade-in slide-in-from-top-2 duration-150">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Signed in as</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setView('profile');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-veloura-sand/40 flex items-center justify-between"
                      >
                        Account Profile
                      </button>
                      <button
                        onClick={() => {
                          setView('orders');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-veloura-sand/40"
                      >
                        Order History
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                          setView('home');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOut size={16} /> Log Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setView('login');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm font-medium text-gray-800 hover:bg-veloura-sand/40"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => {
                          setView('signup');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-veloura-gold hover:bg-veloura-sand/40 font-medium"
                      >
                        Create Account
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Bag Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-veloura-dark hover:text-veloura-gold transition relative"
              aria-label="View shopping bag"
            >
              <ShoppingBag size={21} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-veloura-dark text-veloura-gold font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border border-veloura-gold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Dropdown Search Bar */}
        {searchOpen && (
          <div className="py-4 border-t border-veloura-sand/60">
            <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by garment, fabric, style (e.g. Supima, Kurti, Jeans)..."
                className="w-full pl-12 pr-24 py-3 bg-white border border-veloura-sand rounded-full text-sm focus:outline-none focus:border-veloura-gold shadow-sm"
                autoFocus
              />
              <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <button
                type="submit"
                className="absolute right-2 top-2 px-4 py-1.5 bg-veloura-dark text-veloura-sand text-xs uppercase tracking-wider font-semibold rounded-full hover:bg-veloura-charcoal transition"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-veloura-cream border-b border-veloura-sand px-6 py-6 space-y-4">
          <button
            onClick={() => {
              setView('home');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 font-serif text-lg text-veloura-dark"
          >
            Home
          </button>
          <button
            onClick={() => handleCategoryNav('all')}
            className="block w-full text-left py-2 text-sm uppercase tracking-widest text-veloura-dark"
          >
            All Garments
          </button>
          <button
            onClick={() => handleCategoryNav('men')}
            className="block w-full text-left py-2 text-sm uppercase tracking-widest text-veloura-dark"
          >
            Men (30)
          </button>
          <button
            onClick={() => handleCategoryNav('women')}
            className="block w-full text-left py-2 text-sm uppercase tracking-widest text-veloura-dark"
          >
            Women (30)
          </button>
          <button
            onClick={() => handleCategoryNav('kids')}
            className="block w-full text-left py-2 text-sm uppercase tracking-widest text-veloura-dark"
          >
            Kids (30)
          </button>
          <button
            onClick={() => handleCategoryNav('infants')}
            className="block w-full text-left py-2 text-sm uppercase tracking-widest text-veloura-dark"
          >
            Infants (30)
          </button>
          <div className="pt-4 border-t border-veloura-sand flex gap-4">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    setView('profile');
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs uppercase tracking-wider font-medium text-veloura-dark"
                >
                  My Profile
                </button>
                <button
                  onClick={() => {
                    setView('orders');
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs uppercase tracking-wider font-medium text-veloura-dark"
                >
                  My Orders
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setView('login');
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs uppercase tracking-wider font-medium text-veloura-dark"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setView('signup');
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs uppercase tracking-wider font-medium text-veloura-gold"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
