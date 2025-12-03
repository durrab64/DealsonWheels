import React from 'react';
import { motion } from 'framer-motion';
import { Upload, DollarSign } from 'lucide-react';

const SellCarPage = () => {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black pt-24 pb-20">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="bg-zinc-900/30 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group mt-10">
                        {/* Glow Effect */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-[80px] group-hover:bg-white/10 transition-colors duration-700" />

                        <div className="relative z-10">
                            <div className="text-center mb-12">
                                <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">Sell Your Car</h1>
                                <p className="text-xl text-gray-400">Get an AI-powered valuation in under 30 seconds.</p>
                            </div>

                            <form className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {[
                                        { label: "Make", placeholder: "e.g. Honda" },
                                        { label: "Model", placeholder: "e.g. Civic" },
                                        { label: "Year", placeholder: "e.g. 2020", type: "number" },
                                        { label: "Mileage (km)", placeholder: "e.g. 45000", type: "number" }
                                    ].map((field, i) => (
                                        <div key={i} className="group/input">
                                            <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 group-focus-within/input:text-white transition-colors">{field.label}</label>
                                            <input
                                                type={field.type || "text"}
                                                placeholder={field.placeholder}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-6 py-5 text-white placeholder-gray-600 focus:border-white/40 focus:bg-white/5 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-300 text-lg"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-4">
                                    <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Condition</label>
                                    <div className="grid grid-cols-3 gap-6">
                                        {['Excellent', 'Good', 'Fair'].map((condition) => (
                                            <button
                                                key={condition}
                                                type="button"
                                                className="group/btn relative overflow-hidden border border-white/10 rounded-xl py-5 hover:border-white/40 transition-all duration-300"
                                            >
                                                <div className="absolute inset-0 bg-white/0 group-hover/btn:bg-white/5 transition-colors" />
                                                <span className="relative z-10 text-base font-bold text-gray-400 group-hover/btn:text-white transition-colors">{condition}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Photos</label>
                                    <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center hover:border-white/30 hover:bg-white/5 transition-all duration-300 cursor-pointer group/upload">
                                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 group-hover/upload:scale-110 group-hover/upload:bg-white/10 transition-all duration-300">
                                            <Upload size={32} className="text-gray-400 group-hover/upload:text-white" />
                                        </div>
                                        <p className="text-base text-gray-400 font-medium">Drag & drop photos here or <span className="text-white underline decoration-white/30 hover:decoration-white underline-offset-4">browse files</span></p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="w-full bg-white text-black font-bold py-6 rounded-xl hover:bg-gray-200 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:-translate-y-1 text-xl flex items-center justify-center gap-3 group/submit mt-8"
                                >
                                    <DollarSign size={24} className="group-hover/submit:rotate-12 transition-transform" />
                                    Get My Instant Offer
                                </button>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default SellCarPage;
