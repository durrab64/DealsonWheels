import React, { useRef, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ChevronRight, Grid3x3, List, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CategoryGrid from '../components/CategoryGrid';
import { getCategory } from '../data/catalogRepository';

const CategoryPage = () => {
    const { type } = useParams();
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('q') || '';

    const categoryData = getCategory(type);

    // Filter items based on search query
    const filteredItems = (categoryData?.items || []).filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get a representative image for the hero
    const heroImage = categoryData?.items[0]?.image || '';

    const [viewMode, setViewMode] = React.useState('grid');
    const [sortOption, setSortOption] = React.useState('featured');
    const [isSortOpen, setIsSortOpen] = React.useState(false);
    const sortRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortRef.current && !sortRef.current.contains(event.target)) {
                setIsSortOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // All hooks run before this point so hook order stays stable across route changes.
    if (!categoryData) {
        return <div className="p-8 text-center">Category not found</div>;
    }

    // Sort items
    const sortedItems = [...filteredItems].sort((a, b) => {
        if (sortOption === 'name-asc') {
            return a.name.localeCompare(b.name);
        }
        if (sortOption === 'name-desc') {
            return b.name.localeCompare(a.name);
        }
        return 0; // 'featured' keeps original order
    });

    const sortOptions = [
        { id: 'featured', label: 'Featured' },
        { id: 'name-asc', label: 'Name (A-Z)' },
        { id: 'name-desc', label: 'Name (Z-A)' }
    ];

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Hero Section */}
            <div className="category-hero">
                <div className="category-hero-bg" style={{ backgroundImage: `url(${heroImage})` }} />
                <div className="category-hero-overlay" />

                <div className="container relative z-10">
                    {/* Location Badge (Breadcrumb) */}
                    <div className="location-badge-wrapper">
                        <div className="location-badge">
                            <div className="location-dot"></div>
                            <Link to="/" className="location-link">Home</Link>
                            <ChevronRight size={14} className="location-separator" />
                            <span className="location-current">{categoryData.title}</span>
                        </div>
                    </div>

                    {/* Hero Content */}
                    <div className="category-hero-content">
                        <h1 className="category-hero-title">{categoryData.title}</h1>
                        <p className="category-hero-desc">{categoryData.description}</p>

                        {/* Action Bar */}
                        <div className="category-actions-bar">
                            <div className="flex items-center justify-between w-full max-w-6xl mx-auto">
                                {/* Sort Dropdown */}
                                <div className="relative" ref={sortRef}>
                                    <button
                                        onClick={() => setIsSortOpen(!isSortOpen)}
                                        className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border transition-all duration-300 ${isSortOpen
                                            ? 'bg-white/5 border-white/30 text-white shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                                            : 'bg-zinc-900/90 border-white/10 text-gray-300 hover:bg-white/5 hover:border-white/25 hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.08)]'
                                            }`}
                                    >
                                        <span className="text-sm font-medium">
                                            {sortOptions.find(o => o.id === sortOption)?.label}
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
                                                className="absolute top-full left-0 mt-2 w-64 bg-zinc-900/98 backdrop-blur-xl border border-white/15 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] overflow-hidden z-[9999]"
                                            >
                                                <div className="p-2">
                                                    {sortOptions.map((option) => (
                                                        <button
                                                            key={option.id}
                                                            onClick={() => {
                                                                setSortOption(option.id);
                                                                setIsSortOpen(false);
                                                            }}
                                                            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${sortOption === option.id
                                                                ? 'bg-white/15 text-white shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                                                                : 'text-gray-300 hover:bg-white/8 hover:text-white'
                                                                }`}
                                                        >
                                                            <span>{option.label}</span>
                                                            {sortOption === option.id && (
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

                                <div className="view-toggle">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                        aria-label="Grid view"
                                    >
                                        <Grid3x3 size={20} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                                        aria-label="List view"
                                    >
                                        <List size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="category-content">
                <div className="container">
                    {searchQuery && (
                        <div className="search-results-header">
                            <p>Showing results for: <strong>"{searchQuery}"</strong></p>
                            <p className="text-gray-400">{filteredItems.length} items found</p>
                        </div>
                    )}

                    <CategoryGrid
                        items={sortedItems}
                        title=""
                        description=""
                        viewMode={viewMode}
                    />
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;
