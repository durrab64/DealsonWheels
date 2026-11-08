import React, { useState } from 'react';
import { ArrowRight, ShoppingBag, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

const CategoryGrid = ({ items, title, description, viewMode = 'grid', disableLinks = false, onAddToCart }) => {
    return (
        <div className="flex-1">
            {items.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-xl text-gray-400">No items found</p>
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={viewMode}
                        variants={container}
                        initial="hidden"
                        animate="show"
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className={viewMode === 'grid' ? 'category-grid-static' : 'flex flex-col gap-6'}
                    >
                        {items.map((item) => (
                            <motion.div
                                layout
                                key={item.id}
                                id={item.id}
                                variants={itemAnim}
                                className={viewMode === 'grid' ? 'category-card-enhanced' : 'w-full'}
                            >
                            {viewMode === 'grid' ? (
                                // GRID VIEW (Existing)
                                onAddToCart ? (
                                    <div className="category-card-link-enhanced cursor-default">
                                        <div className="category-card-image-wrapper-enhanced">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                referrerPolicy="no-referrer"
                                                className="category-card-image-enhanced"
                                            />
                                            <div className="category-card-overlay-enhanced" />
                                            <div className="category-card-shine" />
                                            {item.price && (
                                                <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-bold border border-white/10 z-20">
                                                    {item.price}
                                                </div>
                                            )}
                                        </div>

                                        <div className="category-card-content-enhanced">
                                            <h3 className="category-card-title-enhanced">
                                                {item.name}
                                            </h3>
                                            <p className="category-card-description-enhanced">
                                                {item.description}
                                            </p>

                                            {/* Rating Display */}
                                            {item.rating && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="flex items-center gap-1">
                                                        <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                                        <span className="text-white font-semibold text-sm">{item.rating}</span>
                                                    </div>
                                                    <span className="text-gray-400 text-sm">({item.reviewCount} reviews)</span>
                                                </div>
                                            )}

                                            {/* Pricing Display */}
                                            {item.price && (
                                                <div className="flex items-center gap-3 mt-3">
                                                    <div className="flex flex-col">
                                                        {item.originalPrice && item.discount && (
                                                            <span className="text-gray-500 text-sm" style={{ textDecoration: 'line-through', textDecorationColor: '#ef4444', textDecorationThickness: '2px' }}>{item.originalPrice}</span>
                                                        )}
                                                        <span className="text-white font-bold text-xl">{item.price}</span>
                                                    </div>
                                                    {item.discount && (
                                                        <div className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                                                            {item.discount}% OFF
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="category-card-footer flex flex-col gap-2 mt-3">
                                                <Link
                                                    to={`${item.id}`}
                                                    className="product-view-details-btn w-full bg-transparent border-2 border-white/20 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-white/10 hover:border-white/60 hover:shadow-lg hover:shadow-white/20 flex items-center justify-center gap-3"
                                                >
                                                    <ArrowRight size={16} className="arrow-icon flex-shrink-0" />
                                                    <span>View Details</span>
                                                </Link>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onAddToCart(item);
                                                    }}
                                                    className="product-add-cart-btn w-full rounded-lg font-semibold flex items-center justify-center gap-2"
                                                    style={{
                                                        backgroundColor: '#ffffff',
                                                        color: '#000000',
                                                        padding: '0.625rem 1rem', // 2.5 and 4 tailwind units
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e5e5'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                                                >
                                                    <ShoppingBag size={16} style={{ color: '#000000' }} />
                                                    <span style={{ color: '#000000' }}>Add to Cart</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Link to={`${item.id}`} className="category-card-link-enhanced">
                                        <div className="category-card-image-wrapper-enhanced">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                referrerPolicy="no-referrer"
                                                className="category-card-image-enhanced"
                                            />
                                            <div className="category-card-overlay-enhanced" />
                                            <div className="category-card-shine" />
                                            <div className="category-card-badge-enhanced">
                                                <ArrowRight size={20} />
                                            </div>
                                        </div>

                                        <div className="category-card-content-enhanced">
                                            <h3 className="category-card-title-enhanced">
                                                {item.name}
                                            </h3>
                                            <p className="category-card-description-enhanced">
                                                {item.description}
                                            </p>

                                            <div className="category-card-footer">
                                                <div className="category-card-action-enhanced">
                                                    <span>Explore Products</span>
                                                    <ArrowRight size={16} className="arrow-icon" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            ) : (
                                // LIST VIEW (Exact Buy & Sell Match)
                                <Link
                                    to={`${item.id}`}
                                    className="group bg-zinc-950 border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(255,255,255,0.08)] flex flex-col sm:flex-row w-full"
                                >
                                    {/* Image Section - Fixed Size Match */}
                                    <div className="relative overflow-hidden bg-zinc-900 w-full sm:w-[420px] h-[220px] sm:h-[280px] shrink-0">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />

                                        {/* Badge */}
                                        {item.discount && (
                                            <div className="absolute top-3 left-3">
                                                <span className="px-3 py-1 bg-green-500 text-white text-sm font-bold rounded shadow-lg">
                                                    {item.discount}% OFF
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Section - Exact Padding/Layout Match */}
                                    <div
                                        className="category-list-content p-4 flex-1 flex flex-col justify-center pr-14 py-6 gap-2"
                                        style={{ paddingLeft: 'calc(15% - 30px)' }}
                                    >
                                        {/* Price */}
                                        {item.price && (
                                            <div className="flex items-baseline gap-3 mb-2">
                                                <h3 className="text-3xl font-bold text-white">{item.price}</h3>
                                                {item.originalPrice && (
                                                    <span className="text-gray-500 text-lg line-through decoration-red-500 decoration-2">
                                                        {item.originalPrice}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Title */}
                                        <h4 className="text-xl font-normal text-gray-300 mb-3 line-clamp-1">
                                            {item.name}
                                        </h4>

                                        {/* Meta Details - Adapted for Generic Products */}
                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                            {item.rating ? (
                                                <>
                                                    <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-sm text-gray-400 font-medium flex items-center gap-1">
                                                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                                        <span>{item.rating} Rating</span>
                                                    </div>
                                                    <span className="text-gray-600">•</span>
                                                    <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-sm text-gray-400 font-medium">
                                                        {item.reviewCount || '0'} Reviews
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded text-sm text-gray-400 font-medium">
                                                    Premium Quality
                                                </span>
                                            )}
                                        </div>

                                        {/* Description (replaces Mileage/Location) */}
                                        <p className="text-base text-gray-500 mb-1 line-clamp-2">
                                            {item.description}
                                        </p>

                                        {/* Spacer/Border */}
                                        <div className="mt-4 pt-4 border-t border-white/5 w-full"></div>

                                        {/* View Details Button - Exact Match */}
                                        <button
                                            className="product-list-view-btn w-full mt-2 py-3 px-4 bg-transparent text-white font-semibold rounded-lg border-2 border-white transition-all duration-300 hover:bg-white hover:text-black active:scale-[0.98]"
                                            style={{
                                                letterSpacing: '0.02em'
                                            }}
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </Link>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
};

export default CategoryGrid;
