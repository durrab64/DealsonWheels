import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Grid3x3, List } from 'lucide-react';
import CategoryGrid from '../components/CategoryGrid';
import {
    getCategory,
    getChildCategory,
    getGeneratedProducts
} from '../data/catalogRepository';
import { useCart } from '../context/CartContext';

// Generated product data and images live in the catalog repository.

const ChildCategoryPage = () => {
    const { type, childId } = useParams();
    const categoryData = getCategory(type);
    const childItem = getChildCategory(type, childId);

    const { addToCart } = useCart();

    // Generated demo products are produced by the catalog repository.
    const productItems = useMemo(
        () => getGeneratedProducts(type, childId),
        [type, childId]
    );

    const [viewMode, setViewMode] = useState('grid');
    const [sortOption, setSortOption] = useState('featured');
    const [isSortOpen, setIsSortOpen] = useState(false);

    // Sort items
    const sortedItems = useMemo(() => {
        let sorted = [...productItems];
        if (sortOption === 'name-asc') {
            sorted.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortOption === 'name-desc') {
            sorted.sort((a, b) => b.name.localeCompare(a.name));
        }
        return sorted;
    }, [productItems, sortOption]);

    // All hooks run before this point so hook order stays stable across route changes.
    if (!childItem) {
        return <div className="p-8 text-center text-white">Category not found</div>;
    }

    const sortOptions = [
        { id: 'featured', label: 'Featured' },
        { id: 'name-asc', label: 'Name (A-Z)' },
        { id: 'name-desc', label: 'Name (Z-A)' }
    ];

    // Get hero image
    const heroImage = childItem.image || '';

    return (
        <div className="min-h-screen bg-black text-white" >
            {/* Hero Section */}
            < div className="category-hero" >
                <div className="category-hero-bg" style={{ backgroundImage: `url(${heroImage})` }} />
                <div className="category-hero-overlay" />

                <div className="container relative z-10">
                    {/* Location Badge (Breadcrumb) */}
                    <div className="location-badge-wrapper">
                        <div className="location-badge">
                            <div className="location-dot"></div>
                            <Link to="/" className="location-link">Home</Link>
                            <ChevronRight size={14} className="location-separator" />
                            <Link to={`/category/${type}`} className="location-link">{categoryData.title}</Link>
                            <ChevronRight size={14} className="location-separator" />
                            <span className="location-current">{childItem.name}</span>
                        </div>
                    </div>

                    {/* Hero Content */}
                    <div className="category-hero-content">
                        <h1 className="category-hero-title">{childItem.name}</h1>
                        <p className="category-hero-desc">{childItem.description}</p>

                        {/* Action Bar */}
                        <div className="category-actions-bar">
                            <div className="flex items-center gap-6">
                                <button className="action-btn">
                                    <span className="font-medium">Filter</span>
                                </button>

                                {/* Sort Dropdown */}
                                <div className="relative">
                                    <button
                                        className="action-btn"
                                        onClick={() => setIsSortOpen(!isSortOpen)}
                                        onBlur={() => setTimeout(() => setIsSortOpen(false), 200)}
                                    >
                                        <span className="font-medium">Sort By: {sortOptions.find(o => o.id === sortOption)?.label}</span>
                                        <ChevronRight size={16} className={`transition-transform ${isSortOpen ? 'rotate-90' : ''}`} />
                                    </button>

                                    {isSortOpen && (
                                        <div className="sort-dropdown">
                                            {sortOptions.map(option => (
                                                <button
                                                    key={option.id}
                                                    className={`sort-option ${sortOption === option.id ? 'active' : ''}`}
                                                    onClick={() => {
                                                        setSortOption(option.id);
                                                        setIsSortOpen(false);
                                                    }}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
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
            </div >

            {/* Main Content */}
            < div className="category-content" >
                <div className="container">
                    <CategoryGrid
                        items={sortedItems}
                        title=""
                        description=""
                        viewMode={viewMode}
                        onAddToCart={addToCart}
                    />
                </div>
            </div >
        </div >
    );
};

export default ChildCategoryPage;
