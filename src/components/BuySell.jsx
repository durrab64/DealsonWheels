import React from 'react';
import { Link } from 'react-router-dom';
import { Car, DollarSign, RefreshCw, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import './BuySell.css';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const itemAnim = {
    hidden: { opacity: 0, y: 30 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1]
        }
    }
};

const BuySell = () => {
    return (
        <section className="buy-sell-section">
            <div className="container">
                <motion.div
                    className="buy-sell-grid"
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    <motion.div variants={itemAnim} className="buy-sell-content">
                        <h2 className="buy-sell-title">
                            BUY, SELL, <br />
                            <span className="text-gradient">& EXCHANGE</span>
                        </h2>
                        <p className="buy-sell-desc">
                            Ready for an upgrade? We offer the best deals for your used car.
                            Trade in your old vehicle for a modified beast or sell it directly to us.
                        </p>

                        <div className="feature-list">
                            <motion.div
                                className="feature-item premium-item"
                                whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.03)" }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="feature-icon-wrapper">
                                    <Car size={24} className="buy-sell-icon icon-car" />
                                </div>
                                <div className="feature-text">
                                    <h3>Premium Selection</h3>
                                    <p>Browse our curated inventory of pre-modified and stock vehicles.</p>
                                </div>
                            </motion.div>

                            <motion.div
                                className="feature-item"
                                whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.03)" }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="feature-icon-wrapper dollar-wrapper">
                                    <DollarSign size={24} className="buy-sell-icon icon-dollar" />
                                </div>
                                <div className="feature-text">
                                    <h3>Best Market Value</h3>
                                    <p>Get a fair, competitive offer for your vehicle instantly.</p>
                                </div>
                            </motion.div>

                            <motion.div
                                className="feature-item"
                                whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.03)" }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="feature-icon-wrapper">
                                    <RefreshCw size={24} className="buy-sell-icon icon-refresh" />
                                </div>
                                <div className="feature-text">
                                    <h3>Seamless Exchange</h3>
                                    <p>Swap your car and drive away in your dream ride the same day.</p>
                                </div>
                            </motion.div>
                        </div>

                        <Link to="/buy-sell">
                            <motion.button
                                className="btn-premium"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span>Start Trading Now</span>
                                <ArrowRight size={20} />
                            </motion.button>
                        </Link>
                    </motion.div>

                    <motion.div variants={itemAnim} className="buy-sell-image-wrapper">
                        <div className="buy-sell-image-inner">
                            <img
                                src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop"
                                alt="Premium Car"
                                className="buy-sell-img"
                            />
                            <div className="image-overlay"></div>
                            <div className="image-glow"></div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default BuySell;
