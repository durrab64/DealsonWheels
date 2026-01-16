import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Transition Demo Component
 * Shows all available transition types with live preview
 */

const TransitionDemo = () => {
    const [selectedTransition, setSelectedTransition] = useState('curtain');

    const transitions = [
        {
            id: 'curtain',
            name: 'Curtain Wipe',
            description: 'Horizontal sliding curtains - Classic Barba.js style',
            icon: '→'
        },
        {
            id: 'vertical',
            name: 'Vertical Reveal',
            description: 'Top to bottom reveal with smooth easing',
            icon: '↓'
        },
        {
            id: 'diagonal',
            name: 'Diagonal Slide',
            description: 'Diagonal wipe with 3D rotation',
            icon: '↘'
        },
        {
            id: 'zoom',
            name: 'Zoom Fade',
            description: 'Scale and fade with bounce effect',
            icon: '⊕'
        },
        {
            id: 'split',
            name: 'Split Reveal',
            description: 'Center split with 3D perspective',
            icon: '⇆'
        },
        {
            id: 'glitch',
            name: 'Glitch Transition',
            description: 'Modern glitch effect with steps',
            icon: '⚡'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
                        Barba.js Style Transitions
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        Powered by GSAP • Inspired by Barba.js
                    </p>
                </div>

                {/* Current Selection */}
                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-zinc-500 mb-1">Currently Active</p>
                            <h2 className="text-2xl font-bold">
                                {transitions.find(t => t.id === selectedTransition)?.name}
                            </h2>
                        </div>
                        <div className="text-6xl opacity-20">
                            {transitions.find(t => t.id === selectedTransition)?.icon}
                        </div>
                    </div>
                </div>

                {/* Transition Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {transitions.map((transition) => (
                        <button
                            key={transition.id}
                            onClick={() => setSelectedTransition(transition.id)}
                            className={`
                                group relative overflow-hidden rounded-xl p-6 text-left
                                transition-all duration-300 transform hover:scale-105
                                ${selectedTransition === transition.id
                                    ? 'bg-gradient-to-br from-zinc-800 to-zinc-900 border-2 border-white shadow-2xl shadow-white/20'
                                    : 'bg-zinc-900/30 border border-zinc-800 hover:border-zinc-700'
                                }
                            `}
                        >
                            {/* Icon */}
                            <div className="text-4xl mb-4 transition-transform duration-300 group-hover:scale-110">
                                {transition.icon}
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-bold mb-2">{transition.name}</h3>
                            <p className="text-sm text-zinc-400">{transition.description}</p>

                            {/* Active Indicator */}
                            {selectedTransition === transition.id && (
                                <div className="absolute top-4 right-4 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                            )}

                            {/* Hover Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        </button>
                    ))}
                </div>

                {/* Instructions */}
                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8">
                    <h3 className="text-2xl font-bold mb-4">How to Use</h3>

                    <div className="space-y-4 text-zinc-300">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-1">
                                1
                            </div>
                            <div>
                                <p className="font-semibold mb-1">Default Transition (Curtain Wipe)</p>
                                <p className="text-sm text-zinc-400">
                                    The current setup uses the curtain wipe transition. Navigate between pages to see it in action!
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-1">
                                2
                            </div>
                            <div>
                                <p className="font-semibold mb-1">Switch Transitions</p>
                                <p className="text-sm text-zinc-400 mb-2">
                                    To use a different transition, update your App.jsx:
                                </p>
                                <code className="block bg-black/50 p-3 rounded-lg text-xs font-mono">
                                    {`import PageTransitionAdvanced from './components/PageTransitionAdvanced';\n\n<PageTransitionAdvanced transitionType="${selectedTransition}">\n  <Routes>...</Routes>\n</PageTransitionAdvanced>`}
                                </code>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-1">
                                3
                            </div>
                            <div>
                                <p className="font-semibold mb-1">Test the Transitions</p>
                                <p className="text-sm text-zinc-400">
                                    Click the links below to navigate and see the transition in action:
                                </p>
                                <div className="flex gap-3 mt-3">
                                    <Link
                                        to="/"
                                        className="px-4 py-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors"
                                    >
                                        Home
                                    </Link>
                                    <Link
                                        to="/category/exterior"
                                        className="px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                                    >
                                        Exterior
                                    </Link>
                                    <Link
                                        to="/category/interior"
                                        className="px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                                    >
                                        Interior
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Technical Info */}
                <div className="mt-8 p-6 bg-zinc-950/50 border border-zinc-800 rounded-xl">
                    <h4 className="text-lg font-bold mb-3">✨ Features</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-zinc-400">
                        <li className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            Smooth GSAP animations
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            Barba.js-inspired effects
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            6 unique transition styles
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            Layered curtain overlays
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            Optimized performance
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            Easy to customize
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default TransitionDemo;
