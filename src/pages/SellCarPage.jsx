import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Car, ArrowLeft } from 'lucide-react';

/**
 * Honest placeholder for the seller experience.
 * The previous version rendered an interactive form that collected data but
 * never submitted anywhere, so it has been replaced with a clear Coming Soon
 * message until a real seller flow exists.
 */
const SellCarPage = () => {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black pt-24 pb-20">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="max-w-3xl mx-auto"
                >
                    <div className="bg-zinc-900/30 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 md:p-14 shadow-2xl relative overflow-hidden mt-10 text-center">
                        <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/5 rounded-full blur-[90px]" />

                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-8">
                                <Clock size={36} className="text-gray-300" />
                            </div>

                            <p className="text-sm font-bold uppercase tracking-[0.4em] text-gray-500 mb-5">
                                Coming Soon
                            </p>
                            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                                Sell Your Car
                            </h1>
                            <p className="text-lg text-gray-400 max-w-xl mx-auto mb-4">
                                We are building a guided experience for listing and selling your car.
                                Online submissions are not available yet.
                            </p>
                            <p className="text-base text-gray-500 max-w-xl mx-auto mb-10">
                                In the meantime, you can browse the current inventory or explore
                                trade-in options from any car listing.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    to="/buy-sell"
                                    className="btn btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                                >
                                    <Car size={20} />
                                    <span>Browse Buy &amp; Sell</span>
                                </Link>
                                <Link
                                    to="/"
                                    className="btn btn-outline inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                                >
                                    <ArrowLeft size={20} />
                                    <span>Back to Home</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SellCarPage;
