import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, ShoppingBag, User, LogOut } from 'lucide-react';
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
  const searchRef = useRef(null);

  const { cartCount, toggleCart } = useCart();
  const { user, openLogin, logout } = useAuth();

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
    <nav className="navbar">
      <div className="container nav-content">
        <div className="logo">
          <Link to="/" className="block transition-all duration-700 ease-out hover:scale-110">
            <img src="/logo.png" alt="DEALS ON WHEELS" className="h-36 w-auto" />
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
          <Link
            to="/cart"
            className="btn btn-primary relative"
          >
            <span>Cart</span>
            <ShoppingBag size={16} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-black">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav >
  );
};

export default Navbar;
