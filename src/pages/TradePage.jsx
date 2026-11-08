import React, { useState } from 'react';
import { Car, User, ArrowRight, Calendar, Gauge, CheckCircle, Star, ChevronDown } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import './TradePage.css';

export default function TradePage() {
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: '',
        mileage: '',
        value: '',
        condition: 'Good',
        fullName: '',
        phone: '',
        email: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Trade-in request submitted! Our team will contact you shortly.');
    };

    return (
        <PageTransition>
            <div className="trade-page-container">
                <div className="trade-grid">
                    {/* Left Column - Your Vehicle Form */}
                    <div className="trade-card left">
                        {/* Vehicle Details Section */}
                        <div className="section-header">
                            <div className="icon-box blue">
                                <Car size={20} />
                            </div>
                            <h3 className="section-title">Your Vehicle Details</h3>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Make</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Toyota"
                                    className="form-input"
                                    value={formData.make}
                                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Model</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Corolla Altis"
                                    className="form-input"
                                    value={formData.model}
                                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Year</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 2019"
                                    className="form-input"
                                    value={formData.year}
                                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Mileage (km)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 45,000"
                                    className="form-input"
                                    value={formData.mileage}
                                    onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Estimated Value (Rs)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 3,500,000"
                                    className="form-input"
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Condition</label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        className="form-select"
                                        value={formData.condition}
                                        onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                    >
                                        <option>Good</option>
                                        <option>Excellent</option>
                                        <option>Fair</option>
                                        <option>Poor</option>
                                    </select>
                                    <ChevronDown size={16} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9CA3AF' }} />
                                </div>
                            </div>
                        </div>

                        {/* Contact Information Section */}
                        <div className="section-header" style={{ marginTop: '32px' }}>
                            <div className="icon-box purple">
                                <User size={20} />
                            </div>
                            <h3 className="section-title">Contact Information</h3>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                placeholder="Your Name"
                                className="form-input"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input
                                    type="tel"
                                    placeholder="0300-1234567"
                                    className="form-input"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    className="form-input"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <button className="submit-btn" onClick={handleSubmit}>
                            Submit Trade-In Request
                            <ArrowRight size={20} />
                        </button>
                    </div>

                    {/* Right Column - Trading For Card */}
                    <div className="trade-card right">
                        <div className="glow-purple"></div>
                        <div className="glow-blue"></div>

                        <div className="trading-for-header">
                            <div className="trading-label">Trading For</div>
                            <h2 className="car-title">Toyota Raize 2020</h2>
                            <div className="price-badge">Rs 63,84,000</div>
                        </div>

                        <div className="car-image-container">
                            <div className="car-image-wrapper">
                                <img
                                    src="https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&q=80"
                                    alt="Toyota Raize 2020"
                                    className="car-image"
                                />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #111029, transparent)' }}></div>
                            </div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-label">
                                <Calendar size={20} color="#60A5FA" />
                                Year
                            </div>
                            <div className="detail-value">2020</div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-label">
                                <Gauge size={20} color="#C084FC" />
                                Mileage
                            </div>
                            <div className="detail-value">0 km</div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-label">
                                <CheckCircle size={20} color="#4ADE80" />
                                Condition
                            </div>
                            <div className="detail-value green">New</div>
                        </div>

                        <div className="warning-box">
                            <div className="warning-content">
                                <Star size={20} color="#EAB308" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <p className="warning-text">
                                    The final trade value will be determined after physical inspection of your vehicle.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon-wrapper blue">
                            <CheckCircle size={32} />
                        </div>
                        <h4 className="feature-title">Best Value Guaranteed</h4>
                        <p className="feature-desc">We offer the most competitive trade-in values in the market</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon-wrapper purple">
                            <Car size={32} />
                        </div>
                        <h4 className="feature-title">Quick Inspection</h4>
                        <p className="feature-desc">Fast and professional vehicle inspection process</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon-wrapper green">
                            <ArrowRight size={32} />
                        </div>
                        <h4 className="feature-title">Instant Upgrade</h4>
                        <p className="feature-desc">Seamless transition to your new vehicle today</p>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}
