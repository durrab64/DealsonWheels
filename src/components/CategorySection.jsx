import React, { useRef, useEffect } from 'react';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

const cardVariants = {
    hidden: {
        opacity: 0,
        y: 30,
        scale: 0.95
    },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1]
        }
    }
};

const CategorySection = ({ title, items, id, type }) => {
    const scrollContainerRef = useRef(null);
    const animationFrameRef = useRef(null);
    const scrollSpeedRef = useRef(1.2); // Reduced from 1.8 for smoother performance
    const isPausedRef = useRef(false);
    const lastTimeRef = useRef(0);

    // Duplicate items for infinite scroll
    const duplicatedItems = [...items, ...items];

    const continuousScroll = (currentTime) => {
        if (!scrollContainerRef.current || isPausedRef.current) {
            animationFrameRef.current = requestAnimationFrame(continuousScroll);
            return;
        }

        // Throttle to ~60fps for better performance
        if (currentTime - lastTimeRef.current < 16) {
            animationFrameRef.current = requestAnimationFrame(continuousScroll);
            return;
        }
        lastTimeRef.current = currentTime;

        const container = scrollContainerRef.current;
        const itemSetWidth = container.scrollWidth / 2; // Only 2 sets now

        container.scrollLeft += scrollSpeedRef.current;

        // Reset when reaching end of first duplicated set
        if (container.scrollLeft >= itemSetWidth) {
            container.scrollLeft = 0;
        }

        animationFrameRef.current = requestAnimationFrame(continuousScroll);
    };

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;

        if (scrollContainer) {
            scrollContainer.scrollLeft = 0;
        }

        animationFrameRef.current = requestAnimationFrame(continuousScroll);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    const handleMouseEnter = () => {
        isPausedRef.current = true;
    };

    const handleMouseLeave = () => {
        isPausedRef.current = false;
    };

    return (
        <section id={id} className="category-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">{title}</h2>
                    <Link to={`/category/${type}`} className="view-all">
                        View all <ArrowUpRight size={16} />
                    </Link>
                </div>

                <div className="category-slider-wrapper-home">
                    <motion.div
                        ref={scrollContainerRef}
                        variants={container}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ margin: "-50px", amount: 0.25 }}
                        className="category-slider-home-enhanced"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        {duplicatedItems.map((item, index) => (
                            <motion.div
                                key={`${item.id}-${index}`}
                                variants={cardVariants}
                                className="card-slider-enhanced"
                            >
                                <Link to={`/category/${type}/${item.id}`} className="card-link-wrapper-enhanced">
                                    <div className="card-image-enhanced">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            referrerPolicy="no-referrer"
                                            className="card-img-enhanced"
                                        />
                                        <div className="card-overlay-enhanced" />
                                        <div className="card-shine-effect" />
                                        <div className="card-badge-slider">
                                            <ArrowRight size={20} />
                                        </div>
                                    </div>

                                    <div className="card-content-enhanced">
                                        <h3 className="card-title-enhanced">{item.name}</h3>
                                        <p className="card-desc-enhanced">
                                            {item.description}
                                        </p>

                                        <div className="card-footer-enhanced">
                                            <div className="card-action-slider">
                                                <span>Explore Now</span>
                                                <ArrowRight size={16} className="arrow-icon-slider" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default CategorySection;
