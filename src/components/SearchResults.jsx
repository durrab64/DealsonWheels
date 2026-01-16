import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchResults = ({ results, isOpen, onClose, searchQuery }) => {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const handleResultClick = (result) => {
        navigate(`/category/${result.categoryType}/${result.childId}`);
        onClose();
    };

    if (!isOpen || !searchQuery) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={dropdownRef}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    className="search-results-dropdown"
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        left: 0,
                        right: 0,
                        zIndex: 9999,
                        backgroundColor: '#000000',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '16px',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                        maxHeight: '400px',
                        overflowY: 'auto',
                        backdropFilter: 'blur(20px)'
                    }}
                >
                    {results.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                                padding: '48px 24px',
                                textAlign: 'center'
                            }}
                        >
                            <Search
                                style={{
                                    margin: '0 auto 12px',
                                    color: '#52525b',
                                    display: 'block'
                                }}
                                size={48}
                            />
                            <p style={{
                                color: '#a1a1aa',
                                fontSize: '14px',
                                fontWeight: 500
                            }}>
                                No results found for "{searchQuery}"
                            </p>
                        </motion.div>
                    ) : (
                        <div>
                            {/* Header */}
                            <div style={{
                                padding: '16px 20px',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                                background: 'linear-gradient(to bottom, rgba(255,255,255,0.03), transparent)'
                            }}>
                                <p style={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: '#71717a',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    {results.length} {results.length === 1 ? 'Result' : 'Results'}
                                </p>
                            </div>

                            {/* Results List */}
                            <div style={{ padding: '8px 0' }}>
                                {results.map((result, index) => (
                                    <motion.div
                                        key={`${result.categoryType}-${result.childId}-${index}`}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                            delay: index * 0.04,
                                            duration: 0.25,
                                            ease: [0.4, 0, 0.2, 1]
                                        }}
                                        onClick={() => handleResultClick(result)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '14px',
                                            padding: '12px 20px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                            borderBottom: index < results.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                                            position: 'relative'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                            e.currentTarget.style.paddingLeft = '24px';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.paddingLeft = '20px';
                                        }}
                                    >
                                        {/* Product Image - Premium styling - 46px (5% larger) */}
                                        <div
                                            style={{
                                                width: '46px',
                                                height: '46px',
                                                minWidth: '46px',
                                                minHeight: '46px',
                                                maxWidth: '46px',
                                                maxHeight: '46px',
                                                backgroundColor: '#0a0a0a',
                                                borderRadius: '10px',
                                                overflow: 'hidden',
                                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                                                position: 'relative'
                                            }}
                                        >
                                            <img
                                                src={result.image}
                                                alt={result.name}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    display: 'block'
                                                }}
                                            />
                                            {/* Subtle shine effect */}
                                            <div style={{
                                                position: 'absolute',
                                                inset: 0,
                                                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
                                                pointerEvents: 'none'
                                            }} />
                                        </div>

                                        {/* Text Content */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h4 style={{
                                                color: '#ffffff',
                                                fontSize: '14px',
                                                fontWeight: 600,
                                                marginBottom: '4px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                letterSpacing: '-0.01em'
                                            }}>
                                                {result.name}
                                            </h4>
                                            <p style={{
                                                color: '#71717a',
                                                fontSize: '12px',
                                                fontWeight: 500,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {result.categoryTitle} <span style={{ color: '#3f3f46' }}>•</span> {result.childName}
                                            </p>
                                        </div>

                                        {/* Arrow indicator */}
                                        <div style={{
                                            color: '#3f3f46',
                                            fontSize: '18px',
                                            transition: 'all 0.2s',
                                            opacity: 0.5
                                        }}>
                                            →
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SearchResults;
