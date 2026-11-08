import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, Grid3x3, ChevronDown, MapPin, Heart, Check, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

import { getVehicleListings } from '../data/vehicleRepository';

const BuySellPage = () => {
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState('most-relevant');
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const sortRef = useRef(null);

    // Close sort dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortRef.current && !sortRef.current.contains(event.target)) {
                setIsSortOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const sortOptions = [
        { value: 'most-relevant', label: 'Most Relevant' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'newest', label: 'Newest First' }
    ];


    // Helper to parse price string to number (Dollars)
    const parsePrice = (priceStr) => {
        return parseFloat(priceStr.replace(/[Rs,]/g, ''));
    };

    const filteredAndSortedInventory = React.useMemo(() => {
        let result = [...getVehicleListings()];

        // Filter by Price Range
        if (minPrice || maxPrice) {
            result = result.filter(car => {
                const price = parsePrice(car.price);
                const min = minPrice ? parseFloat(minPrice) : 0;
                const max = maxPrice ? parseFloat(maxPrice) : Infinity;
                return price >= min && price <= max;
            });
        }

        // Sort
        if (sortBy === 'price-low') {
            result.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
        } else if (sortBy === 'price-high') {
            result.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
        }
        // Add other sort logic if needed (e.g., newest)

        return result;
    }, [sortBy, minPrice, maxPrice]);

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Hero Section */}
            <div className="category-hero">
                <div className="category-hero-bg" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=80)` }} />
                <div className="category-hero-overlay" />

                <div className="container relative z-10">
                    {/* Breadcrumb */}
                    <div className="location-badge-wrapper">
                        <div className="location-badge">
                            <div className="location-dot"></div>
                            <Link to="/" className="location-link">Home</Link>
                            <ChevronDown size={14} className="location-separator rotate-[-90deg]" />
                            <span className="location-current">Buy & Sell</span>
                        </div>
                    </div>

                    {/* Hero Content */}
                    <div className="category-hero-content">
                        <h1 className="category-hero-title">Buy & Sell</h1>
                        <p className="category-hero-desc">Explore our curated collection of verified pre-owned vehicles.</p>

                        {/* Action Bar */}
                        <div className="category-actions-bar">
                            <div className="flex flex-wrap items-center justify-between gap-4 w-full max-w-6xl mx-auto">
                                {/* Left Side: Price Range & Sort */}
                                <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 w-full lg:w-auto">
                                    {/* Premium Price Range Inputs */}
                                    <div className="group flex flex-wrap items-center gap-2 sm:gap-3 bg-zinc-900/90 backdrop-blur-md p-1.5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 shadow-lg shadow-black/20">
                                        <div className="flex items-center gap-2 px-2">
                                            <Search size={14} className="text-gray-400" />
                                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Price Range</span>
                                        </div>
                                        <div className="h-6 w-px bg-white/10"></div>
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    placeholder="Min"
                                                    value={minPrice}
                                                    onChange={(e) => setMinPrice(e.target.value)}
                                                    className="buy-sell-price-input w-14 sm:w-20 bg-transparent px-2 py-1 text-sm text-white placeholder-gray-600 focus:outline-none text-center font-medium"
                                                />
                                                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] text-gray-600 pointer-events-none">Rs</span>
                                            </div>
                                            <span className="text-gray-600 font-light">/</span>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    placeholder="Max"
                                                    value={maxPrice}
                                                    onChange={(e) => setMaxPrice(e.target.value)}
                                                    className="buy-sell-price-input w-14 sm:w-20 bg-transparent px-2 py-1 text-sm text-white placeholder-gray-600 focus:outline-none text-center font-medium"
                                                />
                                                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] text-gray-600 pointer-events-none">Rs</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-8 w-px bg-white/10 hidden md:block"></div>

                                    {/* Custom Animated Sort Dropdown */}
                                    <div className="relative w-full sm:w-auto" ref={sortRef}>
                                        <button
                                            onClick={() => setIsSortOpen(!isSortOpen)}
                                            className={`buy-sell-sort-btn flex items-center justify-between gap-3 w-full sm:w-auto px-5 py-2.5 rounded-xl border transition-all duration-300 ${isSortOpen
                                                ? 'bg-white/5 border-white/30 text-white shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                                                : 'bg-zinc-900/90 border-white/10 text-gray-300 hover:bg-white/5 hover:border-white/25 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.08)]'
                                                }`}
                                        >
                                            <span className="text-sm font-medium">
                                                {sortOptions.find(opt => opt.value === sortBy)?.label}
                                            </span>
                                            <ChevronDown
                                                size={16}
                                                className={`transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`}
                                            />
                                        </button>

                                        <AnimatePresence>
                                            {isSortOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                                    className="absolute top-full left-0 mt-2 w-full sm:w-64 bg-zinc-900/98 backdrop-blur-xl border border-white/15 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] overflow-hidden z-[9999]"
                                                >
                                                    <div className="p-2">
                                                        {sortOptions.map((option) => (
                                                            <button
                                                                key={option.value}
                                                                onClick={() => {
                                                                    setSortBy(option.value);
                                                                    setIsSortOpen(false);
                                                                }}
                                                                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${sortBy === option.value
                                                                    ? 'bg-white/15 text-white shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                                                                    : 'text-gray-300 hover:bg-white/8 hover:text-white'
                                                                    }`}
                                                            >
                                                                <span>{option.label}</span>
                                                                {sortBy === option.value && (
                                                                    <motion.div
                                                                        initial={{ scale: 0 }}
                                                                        animate={{ scale: 1 }}
                                                                        transition={{ duration: 0.15 }}
                                                                    >
                                                                        <Check size={16} className="text-white" strokeWidth={2.5} />
                                                                    </motion.div>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Right Side: Grid/List Toggle */}
                                <div className="flex items-center gap-2 bg-zinc-900/90 backdrop-blur-md p-2 rounded-xl border border-white/10 shadow-lg shadow-black/20">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`buy-sell-view-btn p-3.5 rounded-lg transition-all duration-300 ${viewMode === 'grid'
                                            ? 'bg-white/15 text-white shadow-sm'
                                            : 'text-gray-400 hover:bg-white/8 hover:text-white'
                                            }`}
                                        aria-label="Grid view"
                                    >
                                        <Grid3x3 size={24} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`buy-sell-view-btn p-3.5 rounded-lg transition-all duration-300 ${viewMode === 'list'
                                            ? 'bg-white/15 text-white shadow-sm'
                                            : 'text-gray-400 hover:bg-white/8 hover:text-white'
                                            }`}
                                        aria-label="List view"
                                    >
                                        <List size={24} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div >
            </div >

            {/* Main Content */}
            < div className="category-content" >
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={viewMode + sortBy + minPrice + maxPrice} // Force re-render on filter/sort change for smooth transition
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 p-5 lg:grid-cols-3 gap-6' : 'flex flex-col gap-6'}
                            >
                                {filteredAndSortedInventory.map((car, index) => (
                                    <motion.div
                                        layout
                                        key={car.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`group bg-zinc-950 border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(255,255,255,0.08)] ${viewMode === 'list' ? 'flex flex-col sm:flex-row' : ''
                                            }`}
                                    >
                                        <Link to={`/category/cars/used/${car.id}`} className={viewMode === 'list' ? 'flex flex-col sm:flex-row w-full' : ''}>
                                            {/* Image Section */}
                                            <div className={`relative overflow-hidden bg-zinc-900 ${viewMode === 'list' ? 'w-full sm:w-[420px] h-[220px] sm:h-[280px] shrink-0' : 'aspect-[4/3] '
                                                }`}>
                                                <img
                                                    src={car.image}
                                                    alt={car.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />

                                                {/* Badge */}
                                                {car.badge && (
                                                    <div className="absolute top-3 left-3">
                                                        <span className="px-3 py-1 text-sm font-bold rounded shadow-lg">
                                                            {car.badge}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Heart Icon */}
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }}
                                                    className="car-favorite-btn absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors"
                                                    aria-label={`Save ${car.name} to favourites`}
                                                >
                                                    <Heart size={18} />
                                                </button>
                                            </div>

                                            {/* Content Section */}
                                            <div
                                                className={`buy-sell-list-content p-5 flex-1 flex flex-col ${viewMode === 'list' ? 'justify-center pr-14 py-6 gap-2' : ''}`}
                                                style={viewMode === 'list' ? { paddingLeft: 'calc(15% - 30px)' } : {padding:"20px"}}
                                            >
                                                {/* Price */}
                                                <h3 className={`${viewMode === 'list' ? 'text-3xl' : 'text-2xl '} font-bold text-white mb-2`}>{car.price}</h3>

                                                {/* Title */}
                                                <h4 className={`${viewMode === 'list' ? 'text-xl' : 'text-lg '} font-normal text-gray-300 mb-3 line-clamp-1`}>{car.name}</h4>

                                                {/* Meta Details - Condition & Year */}
                                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                                    <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-sm text-gray-400 font-medium">
                                                        {car.condition}
                                                    </span>
                                                    <span className="text-gray-600">•</span>
                                                    <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-sm text-gray-400 font-medium">
                                                        {car.year}
                                                    </span>
                                                </div>

                                                {/* Mileage & Location */}
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-gray-500 mb-1">
                                                    <span>{car.mileage}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin size={16} />
                                                        <span className="line-clamp-1">{car.location}</span>
                                                    </span>
                                                </div>

                                                {/* Posted Time */}
                                                <p className="text-sm text-gray-600 mt-4 pt-4 border-t border-white/5">
                                                    {car.postedTime}
                                                </p>

                                                {/* View Details Button */}
                                                <button
                                                    className="product-list-view-btn w-full mt-4 py-3 px-4 bg-transparent text-white font-medium rounded-xl border border-white/30 transition-all duration-300 hover:bg-white/10 hover:text-white hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98] uppercase tracking-wider text-sm"
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div >
        </div >
    );
};

export default BuySellPage;
