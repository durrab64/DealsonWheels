import React, { useRef, useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import useDialogA11y from '../hooks/useDialogA11y';
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
    const [errorMessage, setErrorMessage] = useState('');

    const emailInputRef = useRef(null);

    const handleClose = () => {
        setErrorMessage('');
        closeAuthModal();
    };

    const dialogRef = useDialogA11y(isAuthModalOpen, handleClose, {
        initialFocusRef: emailInputRef
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setIsLoading(true);
        try {
            if (authMode === 'login') {
                await login(formData.email, formData.password);
            } else {
                await signup(formData.name, formData.email, formData.password);
            }
        } catch (error) {
            console.error('Auth error:', error);
            setErrorMessage(error?.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSwitchMode = () => {
        setErrorMessage('');
        setAuthMode(authMode === 'login' ? 'signup' : 'login');
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
                        onClick={(e) => {
                            if (e.target === e.currentTarget) handleClose();
                        }}
                        className="auth-backdrop"
                    >
                        {/* Modal */}
                        <motion.div
                            ref={dialogRef}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="auth-modal-title"
                            aria-describedby="auth-modal-subtitle"
                            tabIndex={-1}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="auth-modal"
                        >
                            <button
                                type="button"
                                onClick={handleClose}
                                className="auth-close-btn"
                                aria-label="Close authentication dialog"
                            >
                                <X size={20} aria-hidden="true" />
                            </button>

                            <div className="auth-content">
                                <div className="auth-header">
                                    <h2 id="auth-modal-title" className="auth-title">
                                        {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                                    </h2>
                                    <p id="auth-modal-subtitle" className="auth-subtitle">
                                        {authMode === 'login'
                                            ? 'Enter your credentials to access your account'
                                            : 'Join us to get the best deals on car parts'}
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="auth-form">
                                    {authMode === 'signup' && (
                                        <div className="auth-field">
                                            <label className="auth-label" htmlFor="auth-name">Full Name</label>
                                            <div className="auth-input-wrapper">
                                                <User className="auth-icon" size={18} aria-hidden="true" />
                                                <input
                                                    id="auth-name"
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="John Doe"
                                                    className="auth-input"
                                                    autoComplete="name"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="auth-field">
                                        <label className="auth-label" htmlFor="auth-email">Email Address</label>
                                        <div className="auth-input-wrapper">
                                            <Mail className="auth-icon" size={18} aria-hidden="true" />
                                            <input
                                                ref={emailInputRef}
                                                id="auth-email"
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="john@example.com"
                                                className="auth-input"
                                                autoComplete="email"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="auth-field">
                                        <label className="auth-label" htmlFor="auth-password">Password</label>
                                        <div className="auth-input-wrapper">
                                            <Lock className="auth-icon" size={18} aria-hidden="true" />
                                            <input
                                                id="auth-password"
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className="auth-input"
                                                autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {errorMessage && (
                                        <p className="auth-error" role="alert">
                                            {errorMessage}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="auth-submit-btn"
                                    >
                                        {isLoading ? (
                                            <div className="spinner" aria-label="Signing in" />
                                        ) : (
                                            <>
                                                {authMode === 'login' ? 'Sign In' : 'Create Account'}
                                                <ArrowRight size={18} aria-hidden="true" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="auth-divider">
                                    <div className="divider-line" />
                                    <span className="divider-text">OR</span>
                                    <div className="divider-line" />
                                </div>

                                <button
                                    type="button"
                                    className="auth-github-btn"
                                    disabled
                                    aria-describedby="auth-github-note"
                                >
                                    <Github size={20} aria-hidden="true" />
                                    <span>Continue with GitHub</span>
                                    <span id="auth-github-note" className="auth-coming-soon">Coming soon</span>
                                </button>

                                <div className="auth-footer">
                                    <p className="auth-footer-text">
                                        {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                                        <button
                                            type="button"
                                            onClick={handleSwitchMode}
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
