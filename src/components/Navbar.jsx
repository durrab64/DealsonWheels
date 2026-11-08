import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronDown, ShoppingBag, User, LogOut, Menu, X } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { categories } from '../data/categories.jsx';
import SearchResults from './SearchResults';

const Navbar = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);
  const mobileMenuCloseRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const { cartCount, isCartOpen, toggleCart } = useCart();
  const { user, openLogin, logout, isAuthModalOpen } = useAuth();

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
    window.setTimeout(() => mobileMenuButtonRef.current?.focus?.(), 0);
  }, []);

  // Lock background scrolling while the mobile drawer is open. A body class is
  // used instead of inline styles so the auth modal's own scroll lock keeps
  // working when it is opened from inside the mobile menu.
  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    document.body.classList.add('mobile-menu-open');
    return () => document.body.classList.remove('mobile-menu-open');
  }, [isMobileMenuOpen]);

  // Move focus into the drawer when it opens.
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    mobileMenuCloseRef.current?.focus?.();
  }, [isMobileMenuOpen]);

  // Escape closes the drawer, but not while the auth modal is layered above it
  // (the auth modal handles its own Escape and focus restoration).
  useEffect(() => {
    if (!isMobileMenuOpen || isAuthModalOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMobileMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen, isAuthModalOpen, closeMobileMenu]);

  // Contain keyboard focus inside the drawer while it is open. The auth modal
  // is rendered outside the drawer and owns its own focus trap, so this trap
  // stands down while the auth modal is layered above the drawer.
  useEffect(() => {
    if (!isMobileMenuOpen || isAuthModalOpen) return undefined;

    const container = mobileMenuRef.current;
    if (!container) return undefined;

    const getFocusable = () => Array.from(
      container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => element.getClientRects().length > 0);

    const handleKeyDown = (event) => {
      if (event.key !== 'Tab') return;

      const focusable = getFocusable();
      if (focusable.length === 0) {
        event.preventDefault();
        container.focus?.();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const isInside = container.contains(active);

      if (event.shiftKey && (active === first || !isInside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !isInside)) {
        event.preventDefault();
        first.focus();
      }
    };

    // Pull focus back into the drawer if anything moves it outside, so
    // background content cannot receive keyboard focus while the menu is open.
    const handleFocusIn = (event) => {
      if (!container.contains(event.target)) {
        const focusable = getFocusable();
        (focusable[0] || container).focus?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('focusin', handleFocusIn, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('focusin', handleFocusIn, true);
    };
  }, [isMobileMenuOpen, isAuthModalOpen]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    if (value.trim()) {
      setSearchParams({ q: value });
      performSearch(value);
      setIsSearchOpen(true);
    } else {
      setSearchParams({});
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  };

  const performSearch = (query) => {
    const results = [];
    const lowerQuery = query.toLowerCase();

    Object.keys(categories).forEach((categoryType) => {
      const category = categories[categoryType];
      category.items.forEach((item) => {
        if (
          item.name.toLowerCase().includes(lowerQuery) ||
          item.description.toLowerCase().includes(lowerQuery)
        ) {
          results.push({
            ...item,
            categoryType,
            categoryTitle: category.title,
            childId: item.id,
            childName: item.name
          });
        }
      });
    });

    setSearchResults(results);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    {
      name: 'Exterior',
      path: '/category/exterior',
      items: [
        { name: 'Wheels & Rims', id: 'wheels' },
        { name: 'Bumpers & Body Kits', id: 'bumpers' },
        { name: 'Headlights', id: 'headlights' },
        { name: 'Taillights', id: 'taillights' },
        { name: 'Vinyl Wraps & Paint', id: 'wraps' },
        { name: 'Spoilers & Wings', id: 'spoilers' }
      ]
    },
    {
      name: 'Interior',
      path: '/category/interior',
      items: [
        { name: 'Racing Seats', id: 'seats' },
        { name: 'Steering Wheels', id: 'steering' },
        { name: 'Ambient Lighting', id: 'lighting' },
        { name: 'Floor Mats & Liners', id: 'mats' }
      ]
    },
    {
      name: 'Tech Upgrades',
      path: '/category/tech',
      items: [
        { name: 'Car Audio Systems', id: 'audio' },
        { name: 'Infotainment Screens', id: 'screens' },
        { name: 'Dash Cams & Security', id: 'dashcams' },
        { name: 'Performance Tuning', id: 'tuning' }
      ]
    }
  ];

  return (
    <>
      <nav className="navbar">
        <div className="container nav-content">
          <div className="logo">
            <Link to="/" className="block transition-all duration-700 ease-out hover:scale-110">
              <img src="/logo.png" alt="DEALS ON WHEELS" className="w-auto" />
            </Link>
          </div>

          <div className="search-bar" ref={searchRef}>
            <input
              type="text"
              placeholder="Search for upgrades..."
              className="search-input"
              value={searchValue}
              onChange={handleSearch}
              onFocus={() => searchValue && setIsSearchOpen(true)}
            />
            <Search className="search-icon" />
            <SearchResults
              results={searchResults}
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              searchQuery={searchValue}
            />
          </div>

          {/* Desktop Navigation */}
          <div className="nav-links">
            <div className="nav-item">
              <Link to="/">Home</Link>
            </div>
            <div className="nav-item">
              <Link to="/buy-sell">Buy & Sell</Link>
            </div>

            {navItems.map((category) => (
              <div
                key={category.name}
                className="nav-item"
                onMouseEnter={() => setActiveDropdown(category.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link to={category.path} className="flex items-center gap-1 py-2">
                  {category.name}
                  <ChevronDown size={16} className={`transition-transform duration-300 ${activeDropdown === category.name ? 'rotate-180' : ''}`} />
                </Link>

                <AnimatePresence>
                  {activeDropdown === category.name && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{
                        duration: 0.3,
                        ease: [0.4, 0, 0.2, 1]
                      }}
                      className="dropdown-menu origin-top"
                    >
                      {category.items.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay: index * 0.05,
                            duration: 0.3,
                            ease: [0.4, 0, 0.2, 1]
                          }}
                        >
                          <Link
                            to={`${category.path}/${item.id}`}
                            className="dropdown-item"
                          >
                            <span className="dropdown-item-text">{item.name}</span>
                            <div className="dropdown-item-arrow">
                              →
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* User Menu */}
            <div className="relative">
              <button
                className="btn btn-icon"
                onClick={() => user ? setIsUserMenuOpen(!isUserMenuOpen) : openLogin()}
                onBlur={() => setTimeout(() => setIsUserMenuOpen(false), 200)}
              >
                {user ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-white/20" />
                ) : (
                  <User size={20} />
                )}
              </button>

              <AnimatePresence>
                {isUserMenuOpen && user && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-white/10">
                      <p className="text-white font-medium truncate">{user.name}</p>
                      <p className="text-gray-400 text-xs truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-red-400 hover:bg-white/5 flex items-center gap-2 transition-colors"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart Button */}
            <button
              type="button"
              onClick={toggleCart}
              className="btn btn-primary relative"
              aria-label="Open cart"
              aria-haspopup="dialog"
              aria-expanded={isCartOpen}
              aria-controls="cart-drawer"
            >
              <span>Cart</span>
              <ShoppingBag size={16} aria-hidden="true" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-black">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            ref={mobileMenuButtonRef}
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mobile-menu-overlay"
              onClick={closeMobileMenu}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              ref={mobileMenuRef}
              className="mobile-menu"
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
            >
              <div className="mobile-menu-header">
                <div className="logo">
                  <Link to="/" onClick={closeMobileMenu}>
                    <img src="/logo.png" alt="DEALS ON WHEELS" className="w-auto" />
                  </Link>
                </div>
                <button
                  ref={mobileMenuCloseRef}
                  onClick={closeMobileMenu}
                  className="mobile-menu-close"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mobile-menu-content">
                {/* Mobile Search */}
                <div className="mobile-search">
                  <input
                    type="text"
                    placeholder="Search for upgrades..."
                    className="search-input"
                    value={searchValue}
                    onChange={handleSearch}
                  />
                  <Search className="search-icon" />
                  <SearchResults
                    results={searchResults}
                    isOpen={isSearchOpen}
                    onClose={() => {
                      setIsSearchOpen(false);
                      closeMobileMenu();
                    }}
                    searchQuery={searchValue}
                  />
                </div>

                {/* Mobile Nav Links */}
                <div className="mobile-nav-links">
                  <Link
                    to="/"
                    className="mobile-nav-item"
                    onClick={closeMobileMenu}
                  >
                    Home
                  </Link>
                  <Link
                    to="/buy-sell"
                    className="mobile-nav-item"
                    onClick={closeMobileMenu}
                  >
                    Buy & Sell
                  </Link>

                  {navItems.map((category) => (
                    <div key={category.name} className="mobile-nav-category">
                      <button
                        className="mobile-nav-item mobile-nav-category-btn"
                        onClick={() => setActiveDropdown(activeDropdown === category.name ? null : category.name)}
                      >
                        <span>{category.name}</span>
                        <ChevronDown
                          size={20}
                          className={`transition-transform duration-300 ${activeDropdown === category.name ? 'rotate-180' : ''}`}
                        />
                      </button>
                      <AnimatePresence>
                        {activeDropdown === category.name && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mobile-dropdown"
                          >
                            {category.items.map((item) => (
                              <Link
                                key={item.id}
                                to={`${category.path}/${item.id}`}
                                className="mobile-dropdown-item"
                                onClick={closeMobileMenu}
                              >
                                {item.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {/* Mobile User & Cart */}
                <div className="mobile-menu-footer">
                  {user ? (
                    <div className="mobile-user-info">
                      <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg mb-3">
                        <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full border border-white/20" />
                        <div className="flex-1">
                          <p className="text-white font-medium">{user.name}</p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          closeMobileMenu();
                        }}
                        className="w-full text-left px-4 py-3 text-red-400 hover:bg-white/5 flex items-center gap-2 transition-colors rounded-lg"
                      >
                        <LogOut size={20} />
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={openLogin}
                      className="w-full btn btn-outline flex items-center justify-center gap-2"
                    >
                      <User size={20} />
                      Sign In
                    </button>
                  )}

                  <Link
                    to="/cart"
                    className="btn btn-primary w-full mt-3 relative"
                    onClick={closeMobileMenu}
                  >
                    <span>Cart</span>
                    <ShoppingBag size={20} />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-black">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
