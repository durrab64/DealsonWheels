import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import useDialogA11y from '../hooks/useDialogA11y';
import GuestCartRecovery from './GuestCartRecovery';

const CartDrawer = () => {
    const {
        isCartOpen,
        setIsCartOpen,
        cartItems,
        removeFromCart,
        updateQuantity,
        cartTotal
    } = useCart();

    const closeButtonRef = useRef(null);

    const handleClose = () => setIsCartOpen(false);

    const panelRef = useDialogA11y(isCartOpen, handleClose, {
        initialFocusRef: closeButtonRef
    });

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="cart-drawer-backdrop fixed inset-0 bg-black/60 backdrop-blur-sm"
                        aria-hidden="true"
                    />

                    {/* Drawer */}
                    <motion.div
                        ref={panelRef}
                        id="cart-drawer"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="cart-drawer-title"
                        tabIndex={-1}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="cart-drawer-panel fixed right-0 top-0 h-full w-full max-w-md bg-zinc-900 border-l border-white/10 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="cart-drawer-header p-6 border-b border-white/10 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="text-white" size={24} aria-hidden="true" />
                                <h2 id="cart-drawer-title" className="text-xl font-bold text-white">Your Cart</h2>
                                <span className="cart-drawer-badge bg-white/10 text-white text-xs px-2 py-1 rounded-full">
                                    {cartItems.length} items
                                </span>
                            </div>
                            <button
                                ref={closeButtonRef}
                                type="button"
                                onClick={handleClose}
                                className="cart-drawer-close p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                                aria-label="Close cart"
                            >
                                <X size={24} aria-hidden="true" />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="cart-drawer-body flex-1 overflow-y-auto p-6 space-y-6">
                            {cartItems.length === 0 ? (
                                <div className="cart-drawer-empty h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-400">
                                    <ShoppingBag size={64} className="opacity-20" aria-hidden="true" />
                                    <p className="text-lg">Your cart is empty</p>
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="text-white underline hover:text-blue-400 transition-colors"
                                    >
                                        Continue Shopping
                                    </button>
                                    <GuestCartRecovery className="pt-2" />
                                </div>
                            ) : (
                                cartItems.map((item) => (
                                    <div key={item.id} className="cart-drawer-item flex gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                                        <div className="w-20 h-20 bg-black rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-white font-medium line-clamp-1">{item.name}</h3>
                                                <p className="text-gray-400 text-sm">{item.price}</p>
                                            </div>
                                            <div className="cart-drawer-item-actions flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-3 bg-black/50 rounded-lg p-1 border border-white/10">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="cart-drawer-qty-btn p-1 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"
                                                        aria-label={`Decrease quantity of ${item.name}`}
                                                    >
                                                        <Minus size={14} aria-hidden="true" />
                                                    </button>
                                                    <span className="text-white text-sm w-4 text-center">{item.quantity}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="cart-drawer-qty-btn p-1 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"
                                                        aria-label={`Increase quantity of ${item.name}`}
                                                    >
                                                        <Plus size={14} aria-hidden="true" />
                                                    </button>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="cart-drawer-remove text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
                                                    aria-label={`Remove ${item.name} from cart`}
                                                >
                                                    <Trash2 size={16} aria-hidden="true" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {cartItems.length > 0 && (
                            <div className="cart-drawer-footer p-6 border-t border-white/10 bg-zinc-900/50 backdrop-blur-md space-y-4">
                                <div className="flex items-center justify-between text-gray-400">
                                    <span>Subtotal</span>
                                    <span className="text-white font-medium">Rs${cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-gray-400">
                                    <span>Shipping</span>
                                    <span className="text-green-400">Free</span>
                                </div>
                                <div className="cart-drawer-total-row pt-4 border-t border-white/10 flex items-center justify-between">
                                    <span className="text-lg font-bold text-white">Total</span>
                                    <span className="text-2xl font-bold text-white">Rs${cartTotal.toLocaleString()}</span>
                                </div>
                                <div>
                                    <button
                                        type="button"
                                        disabled
                                        aria-describedby="cart-checkout-note"
                                        className="cart-drawer-checkout w-full py-4 bg-white text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Proceed to Checkout
                                        <ShoppingBag size={20} aria-hidden="true" />
                                    </button>
                                    <p id="cart-checkout-note" className="cart-checkout-note">
                                        Checkout coming soon
                                    </p>
                                </div>
                                <Link
                                    to="/cart"
                                    onClick={handleClose}
                                    className="cart-drawer-full-link block w-full py-3 text-center border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5 transition-colors"
                                >
                                    View full cart
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence >
    );
};

export default CartDrawer;
