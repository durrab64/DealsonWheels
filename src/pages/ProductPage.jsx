import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ShoppingCart, Star, Package, Truck, Shield, Check, Info, User } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { categories } from '../data/categories.jsx';
import { useCart } from '../context/CartContext';

const ProductPage = () => {
    const { type, childId, productId } = useParams();
    const { addToCart, setIsCartOpen } = useCart();
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

        const categoryData = categories[type];
        const childItem = categoryData?.items.find(item => item.id === childId);

        if (childItem) {
            setProduct({
                id: productId,
                name: childItem.name,
                description: childItem.description,
                price: '$399.00',
                rating: 4.5,
                reviews: 128,
                image: childItem.image,
                categoryTitle: categoryData.title,
                childName: childItem.name,
                specifications: {
                    'Material': 'Premium Carbon Fiber',
                    'Compatibility': 'Universal Fit',
                    'Finish': 'Matte Black',
                    'Installation': 'Plug & Play',
                    'Warranty': '1 Year Manufacturer',
                    'Origin': 'Made in USA'
                },
                features: [
                    'High-quality construction for durability',
                    'Easy installation with included hardware',
                    'Sleek design that complements any vehicle',
                    'Weather-resistant materials',
                    'Professional-grade performance',
                    'Backed by manufacturer warranty'
                ],
                inStock: true,
                stockCount: 12
            });
        }
    }, [type, childId, productId]);

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

    const handleAddToCart = () => {
        if (product) {
            addToCart(product);
            // setIsCartOpen(true); // Removed as per user request
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
                            <Link to={`/category/${type}`} className="location-link">{product.categoryTitle}</Link>
                            <ChevronRight size={14} className="location-separator" />
                            <Link to={`/category/${type}/${childId}`} className="location-link">{product.childName}</Link>
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
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Right: Product Details */}
                        <div className="product-horizontal-details" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1.6rem' }}>
                                {/* Title & Rating */}
                                <div>
                                    <h2 className="font-bold text-white mb-4 tracking-tight" style={{ fontSize: '1.6rem', lineHeight: '1.2', fontWeight: '700' }}>{product.name}</h2>
                                    <div className="flex items-center gap-4" style={{ fontSize: '0.96rem' }}>
                                        <div className="flex items-center gap-2">
                                            <Star size={19} className="text-yellow-400 fill-yellow-400" />
                                            <span className="text-white font-bold">{product.rating}</span>
                                        </div>
                                        <span className="text-zinc-500">•</span>
                                        <span className="text-zinc-300 font-medium">{product.reviews} reviews</span>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-zinc-300" style={{ fontSize: '0.9rem', lineHeight: '1.6', fontWeight: '400' }}>
                                    {product.description}
                                </p>

                                {/* Quick Features */}
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="grid grid-cols-2 gap-3 mt-6 w-full"
                                >
                                    {[
                                        { icon: Package, text: 'Premium Quality' },
                                        { icon: Truck, text: 'Fast Shipping' },
                                        { icon: Shield, text: '1 Year Warranty' },
                                        { icon: Check, text: 'Easy Install' }
                                    ].map((item, index) => (
                                        <motion.div
                                            key={index}
                                            variants={itemVariants}
                                            className="flex flex-col items-center justify-center gap-2 p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-zinc-600 transition-all hover:bg-zinc-900/80 group"
                                        >
                                            <div className="p-2 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors">
                                                <item.icon size={26} className="text-white" />
                                            </div>
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
                                        <div className="flex flex-col items-start justify-end" style={{ paddingBottom: '0.8rem' }}>
                                            <span
                                                className="text-zinc-400 font-medium"
                                                style={{
                                                    fontSize: '1.6rem',
                                                    textDecoration: 'line-through',
                                                    textDecorationColor: '#ef4444',
                                                    textDecorationThickness: '2.4px'
                                                }}
                                            >
                                                $499.00
                                            </span>
                                            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg text-xs font-bold mt-1">Save 20%</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAddToCart}
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
                                        <ShoppingCart size={16} style={{ color: '#000000' }} />
                                        <span style={{ color: '#000000' }}>Add to Cart</span>
                                    </button>
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
                            {['specifications', 'features', 'shipping'].map((tab) => (
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
                                    {Object.entries(product.specifications).map(([key, value], index) => (
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
                                    {product.features.map((feature, index) => (
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

                            {activeTab === 'shipping' && (
                                <div className="tab-content-grid">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="shipping-card"
                                    >
                                        <div className="shipping-header">
                                            <div className="shipping-icon-box">
                                                <Truck size={32} />
                                            </div>
                                            <h3 className="shipping-title">Free Shipping</h3>
                                        </div>
                                        <p className="shipping-text">Free standard shipping on all orders over $100. Expedited shipping available at checkout.</p>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="shipping-card"
                                    >
                                        <div className="shipping-header">
                                            <div className="shipping-icon-box">
                                                <Package size={32} />
                                            </div>
                                            <h3 className="shipping-title">Delivery Time</h3>
                                        </div>
                                        <p className="shipping-text">Standard delivery: 5-7 business days. Express delivery: 2-3 business days.</p>
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="shipping-card"
                                    >
                                        <div className="shipping-header">
                                            <div className="shipping-icon-box">
                                                <Info size={32} />
                                            </div>
                                            <h3 className="shipping-title">Return Policy</h3>
                                        </div>
                                        <p className="shipping-text">30-day return policy. Items must be unused and in original packaging.</p>
                                    </motion.div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>

                    {/* Customer Reviews Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
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
                            {[
                                {
                                    name: "Sarah Johnson",
                                    date: "November 15, 2025",
                                    rating: 5,
                                    verified: true,
                                    title: "Exceptional sound quality",
                                    review: "These headphones exceeded my expectations. The noise cancellation is phenomenal, and the sound quality is crisp and clear. I use them daily for work calls and music, and the battery life is incredible. Worth every penny!",
                                    helpful: 24
                                },
                                {
                                    name: "Michael Chen",
                                    date: "November 10, 2025",
                                    rating: 5,
                                    verified: true,
                                    title: "Perfect for travel",
                                    review: "I travel frequently for business, and these have become essential. The foldable design is convenient, and the noise cancellation makes flights so much better. Comfortable for long periods too.",
                                    helpful: 18
                                },
                                {
                                    name: "Emma Davis",
                                    date: "November 5, 2025",
                                    rating: 4,
                                    verified: true,
                                    title: "Great product, minor issue",
                                    review: "Overall, these are fantastic headphones. The sound quality is outstanding and they're very comfortable. Only wish the carrying case was slightly smaller for easier packing. Still highly recommend!",
                                    helpful: 12
                                },
                                {
                                    name: "James Wilson",
                                    date: "October 28, 2025",
                                    rating: 5,
                                    verified: true,
                                    title: "Best purchase this year",
                                    review: "Switched from another premium brand and these are significantly better. The build quality feels premium, controls are intuitive, and the app integration is seamless. Customer service was also excellent.",
                                    helpful: 31
                                }
                            ].map((review, idx) => (
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

export default ProductPage;
