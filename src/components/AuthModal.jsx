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
        signup,
        loginGuest
    } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isGuestLoading, setIsGuestLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const cleanFirebaseError = (err) => {
        const code = err?.code || '';
        if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
            return 'Invalid email or password.';
        }
        if (code === 'auth/email-already-in-use') {
            return 'This email is already registered. Please sign in instead.';
        }
        if (code === 'auth/weak-password') {
            return 'Password should be at least 6 characters.';
        }
        if (code === 'auth/invalid-email') {
            return 'Please enter a valid email address.';
        }
        if (code === 'auth/operation-not-allowed') {
            return 'This sign-in method is not enabled in Firebase Console yet.';
        }
        return err?.message || 'Authentication failed. Please try again.';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');
        try {
            if (authMode === 'login') {
                await login(formData.email, formData.password);
            } else {
                await signup(formData.name, formData.email, formData.password);
            }
        } catch (error) {
            console.error('Auth error:', error);
            setErrorMessage(cleanFirebaseError(error));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        setIsGuestLoading(true);
        setErrorMessage('');
        try {
            await loginGuest();
        } catch (error) {
            console.error('Guest auth error:', error);
            setErrorMessage(cleanFirebaseError(error));
        } finally {
            setIsGuestLoading(false);
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

                                {errorMessage && (
                                    <div className="p-3 mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                                        {errorMessage}
                                    </div>
                                )}

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

                                <div className="space-y-2">
                                    <button
                                        type="button"
                                        onClick={handleGuestLogin}
                                        disabled={isGuestLoading}
                                        className="w-full py-3 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                    >
                                        <User size={18} />
                                        {isGuestLoading ? 'Signing in as Guest...' : 'Continue as Guest'}
                                    </button>
                                </div>

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
