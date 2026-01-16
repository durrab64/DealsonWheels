import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ShoppingCart, Star, Package, Truck, Shield, Check, Info, User, MapPin, Calendar, Gauge, Activity, ArrowLeftRight } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { tradeInventory } from '../data/cars.jsx';

const BuySellProductPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [activeTab, setActiveTab] = useState('specifications');

    // Refs for scroll animations
    const tabsRef = useRef(null);
    const reviewsRef = useRef(null);

    // Check if elements are in view
    const tabsInView = useInView(tabsRef, { once: true, amount: 0.1 });
    const reviewsInView = useInView(reviewsRef, { once: true, amount: 0.1 });

    useEffect(() => {
        window.scrollTo(0, 0);

        const car = tradeInventory.find(item => item.id === parseInt(id));

        if (car) {
            setProduct({
                ...car,
                rating: 4.8,
                reviews: car.reviewsList ? car.reviewsList.length : 0,
                categoryTitle: "Buy & Sell",
                childName: "Used Cars"
            });
        }
    }, [id]);

    if (!product) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <p>Product not found</p>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5
            }
        }
    };

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Hero Section */}
            <div className="category-hero">
                <div className="category-hero-bg" style={{ backgroundImage: `url(${product.image})` }} />
                <div className="category-hero-overlay" />

                <div className="container relative z-10">
                    {/* Breadcrumb */}
                    <div className="location-badge-wrapper">
                        <div className="location-badge">
                            <div className="location-dot"></div>
                            <Link to="/" className="location-link">Home</Link>
                            <ChevronRight size={14} className="location-separator" />
                            <Link to="/buy-sell" className="location-link">Buy & Sell</Link>
                            <ChevronRight size={14} className="location-separator" />
                            <span className="location-current">{product.name}</span>
                        </div>
                    </div>

                    {/* Hero Content */}
                    <div className="category-hero-content">
                        <h1 className="category-hero-title">{product.name}</h1>
                        <p className="category-hero-desc">{product.description}</p>
                    </div>
                </div>
            </div>

            {/* Product Details - Horizontal Card */}
            <div className="category-content">
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="product-horizontal-card"
                    >
                        {/* Left: Product Image */}
                        <div className="product-horizontal-image">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                            {product.badge && (
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1 bg-yellow  text-lg font-extrabold rounded shadow-lg">
                                        {product.badge}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Right: Product Details */}
                        <div className="product-horizontal-details" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1.6rem' }}>
                                {/* Title & Rating */}
                                <div>
                                    <h2 className="font-bold text-white mb-4 tracking-tight" style={{ fontSize: '1.6rem', lineHeight: '1.2', fontWeight: '700' }}>{product.name}</h2>
                                    <div className="flex items-center gap-4" style={{ fontSize: '0.96rem' }}>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={18} className="text-zinc-400" />
                                            <span className="text-zinc-300">{product.location}</span>
                                        </div>
                                        <span className="text-zinc-500">•</span>
                                        <span className="text-zinc-300 font-medium">{product.postedTime}</span>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-zinc-300" style={{ fontSize: '0.9rem', lineHeight: '1.6', fontWeight: '400' }}>
                                    {product.description}
                                </p>

                                {/* Quick Features / Key Specs */}
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="grid grid-cols-2 gap-3 mt-6 w-full"
                                >
                                    {[
                                        { icon: Calendar, text: product.year, label: "Year" },
                                        { icon: Gauge, text: product.mileage, label: "Mileage" },
                                        { icon: Activity, text: product.condition, label: "Condition" },
                                        { icon: Shield, text: 'Verified', label: "Status" }
                                    ].map((item, index) => (
                                        <motion.div
                                            key={index}
                                            variants={itemVariants}
                                            className="flex flex-col items-center justify-center gap-1 p-3 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-zinc-600 transition-all hover:bg-zinc-900/80 group"
                                        >
                                            <div className="p-2 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors">
                                                <item.icon size={20} className="text-white" />
                                            </div>
                                            <span className="text-xs text-zinc-500 font-medium">{item.label}</span>
                                            <span className="text-sm font-bold text-white text-center">{item.text}</span>
                                        </motion.div>
                                    ))}
                                </motion.div>

                                {/* Spacer to push price and button to bottom */}
                                <div style={{ flex: '1' }}></div>

                                {/* Price & Add to Cart - At Bottom */}
                                <div style={{ marginTop: 'auto' }}>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="text-white" style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em' }}>{product.price}</div>
                                    </div>

                                    <Link
                                        to={`/trade/${id}`}
                                        className="font-bold rounded-xl flex items-center justify-center"
                                        style={{
                                            fontSize: '0.8rem',
                                            padding: '0.8rem 1.2rem',
                                            width: '100%',
                                            gap: '12px',
                                            backgroundColor: '#ffffff',
                                            color: '#000000',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e5e5'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                                    >
                                        <ArrowLeftRight size={16} style={{ color: '#000000' }} />
                                        <span style={{ color: '#000000' }}>TRADE</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Detailed Information Tabs */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="product-tabs-container"
                    >
                        {/* Tab Navigation */}
                        <div className="product-tabs-nav">
                            {['specifications', 'features', 'seller info'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`product-tab-btn ${activeTab === tab ? 'active' : ''} capitalize`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="min-h-[400px]"
                        >
                            {activeTab === 'specifications' && (
                                <div className="tab-content-grid">
                                    {Object.entries(product.specifications || {}).map(([key, value], index) => (
                                        <motion.div
                                            key={key}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="spec-card"
                                        >
                                            <div className="spec-label">{key}</div>
                                            <div className="spec-value">{value}</div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'features' && (
                                <div className="tab-content-grid">
                                    {(product.features || []).map((feature, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="feature-item"
                                        >
                                            <div className="feature-icon-wrapper">
                                                <Check size={24} />
                                            </div>
                                            <span className="feature-text">{feature}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'seller info' && (
                                <div className="tab-content-grid">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="shipping-card"
                                    >
                                        <div className="shipping-header">
                                            <div className="shipping-icon-box">
                                                <User size={32} />
                                            </div>
                                            <h3 className="shipping-title">Verified Seller</h3>
                                        </div>
                                        <p className="shipping-text">This seller has been verified by our team. Identity and contact details are confirmed.</p>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="shipping-card"
                                    >
                                        <div className="shipping-header">
                                            <div className="shipping-icon-box">
                                                <MapPin size={32} />
                                            </div>
                                            <h3 className="shipping-title">Location</h3>
                                        </div>
                                        <p className="shipping-text">{product.location}</p>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="shipping-card"
                                    >
                                        <div className="shipping-header">
                                            <div className="shipping-icon-box">
                                                <Shield size={32} />
                                            </div>
                                            <h3 className="shipping-title">Inspection Report</h3>
                                        </div>
                                        <p className="shipping-text">Available upon request. 200+ point inspection check passed.</p>
                                    </motion.div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>

                    {/* Customer Reviews Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="product-reviews-section"
                    >
                        <h2 className="product-reviews-title">Customer Reviews</h2>

                        {/* Rating Overview */}
                        <div className="reviews-rating-overview">
                            {/* Overall Rating */}
                            <div className="reviews-overall-rating">
                                <div className="reviews-rating-number">{product.rating}</div>
                                <div className="reviews-stars-display">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="reviews-count-text">Based on {product.reviews} reviews</p>
                            </div>

                            {/* Rating Distribution */}
                            <div className="reviews-distribution">
                                {[
                                    { stars: 5, percentage: 75 },
                                    { stars: 4, percentage: 15 },
                                    { stars: 3, percentage: 5 },
                                    { stars: 2, percentage: 3 },
                                    { stars: 1, percentage: 2 }
                                ].map((rating, idx) => (
                                    <div key={idx} className="reviews-distribution-row">
                                        <span className="reviews-distribution-label">{rating.stars} star</span>
                                        <div className="reviews-distribution-bar">
                                            <div
                                                className="reviews-distribution-fill"
                                                style={{ width: `${rating.percentage}%` }}
                                            />
                                        </div>
                                        <span className="reviews-distribution-percentage">{rating.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Individual Reviews */}
                        <div className="reviews-list">
                            {(product.reviewsList || []).map((review, idx) => (
                                <div key={idx} className="review-card">
                                    <div className="review-header">
                                        <div className="review-author-info">
                                            <div className="review-author-name-row">
                                                <span className="review-author-name">{review.name}</span>
                                                {review.verified && (
                                                    <span className="review-verified-badge">
                                                        Verified Purchase
                                                    </span>
                                                )}
                                            </div>
                                            <div className="review-meta-row">
                                                <div className="review-stars">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={14}
                                                            className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-zinc-700 text-zinc-700'}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="review-date">{review.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <h4 className="review-title">{review.title}</h4>
                                    <p className="review-text">{review.review}</p>
                                    <div className="review-actions">
                                        <button className="review-action-btn">
                                            Helpful ({review.helpful})
                                        </button>
                                        <button className="review-action-btn">
                                            Report
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Write Review Button */}
                        <div className="write-review-container">
                            <button className="write-review-btn">
                                Write a Review
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default BuySellProductPage;
