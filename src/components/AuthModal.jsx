import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import './AuthModal.css';

const AuthModal = () => {
    const {
        isAuthModalOpen,
        closeAuthModal,
        authMode,
        setAuthMode,
        login,
        signup
    } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (authMode === 'login') {
                await login(formData.email, formData.password);
            } else {
                await signup(formData.name, formData.email, formData.password);
            }
        } catch (error) {
            console.error('Auth error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <AnimatePresence>
            {isAuthModalOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeAuthModal}
                        className="auth-backdrop"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="auth-modal"
                        >
                            <button
                                onClick={closeAuthModal}
                                className="auth-close-btn"
                            >
                                <X size={20} />
                            </button>

                            <div className="auth-content">
                                <div className="auth-header">
                                    <h2 className="auth-title">
                                        {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                                    </h2>
                                    <p className="auth-subtitle">
                                        {authMode === 'login'
                                            ? 'Enter your credentials to access your account'
                                            : 'Join us to get the best deals on car parts'}
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="auth-form">
                                    {authMode === 'signup' && (
                                        <div className="auth-field">
                                            <label className="auth-label">Full Name</label>
                                            <div className="auth-input-wrapper">
                                                <User className="auth-icon" size={18} />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="John Doe"
                                                    className="auth-input"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="auth-field">
                                        <label className="auth-label">Email Address</label>
                                        <div className="auth-input-wrapper">
                                            <Mail className="auth-icon" size={18} />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="john@example.com"
                                                className="auth-input"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="auth-field">
                                        <label className="auth-label">Password</label>
                                        <div className="auth-input-wrapper">
                                            <Lock className="auth-icon" size={18} />
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className="auth-input"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="auth-submit-btn"
                                    >
                                        {isLoading ? (
                                            <div className="spinner" />
                                        ) : (
                                            <>
                                                {authMode === 'login' ? 'Sign In' : 'Create Account'}
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="auth-divider">
                                    <div className="divider-line" />
                                    <span className="divider-text">OR</span>
                                    <div className="divider-line" />
                                </div>

                                <button className="auth-github-btn">
                                    <Github size={20} />
                                    Continue with GitHub
                                </button>

                                <div className="auth-footer">
                                    <p className="auth-footer-text">
                                        {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                                        <button
                                            onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                                            className="auth-switch-btn"
                                        >
                                            {authMode === 'login' ? 'Sign up' : 'Log in'}
                                        </button>
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AuthModal;
