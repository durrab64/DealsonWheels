import React from 'react';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
    return (
        <div className="hero">
            {/* Background Image */}
            <div
                className="hero-bg"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop")'
                }}
            />

            {/* Overlay */}
            <div className="hero-overlay" />

            {/* Content */}
            <div className="container hero-content">
                <h1 className="hero-title">
                    DEALS ON <br />
                    <span className="text-gradient">
                        WHEELS
                    </span>
                </h1>

                <p className="hero-subtitle">
                    Elevate your driving experience with premium modifications.
                    From body kits to tech upgrades, we transform your ride.
                </p>

                <div className="hero-actions">
                    <button className="btn btn-primary">
                        <span>Explore Upgrades</span>
                        <ArrowRight size={20} />
                    </button>
                    <button className="btn btn-outline">
                        Sell Your Car
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Hero;
