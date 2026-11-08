import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Search } from 'lucide-react';

/**
 * Global 404 for genuinely unknown URLs.
 * Resource-specific not-found states (category/product/car) live in their
 * respective pages and are intentionally not handled here.
 */
const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-24">
            <div className="max-w-2xl w-full text-center">
                <p className="text-sm font-bold uppercase tracking-[0.4em] text-gray-500 mb-6">
                    Error 404
                </p>
                <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
                    Page not found
                </h1>
                <p className="text-lg text-gray-400 mb-10 max-w-md mx-auto">
                    The page you are looking for does not exist or may have been moved.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to="/"
                        className="btn btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                        <Home size={20} />
                        <span>Back to Home</span>
                    </Link>
                    <Link
                        to="/buy-sell"
                        className="btn btn-outline inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                        <Search size={20} />
                        <span>Browse Buy &amp; Sell</span>
                    </Link>
                </div>

                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mt-10"
                >
                    <ArrowLeft size={16} />
                    Return to the homepage
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;
