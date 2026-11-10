import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Box } from 'lucide-react';
import { useCart } from '../context/CartContext';
import GuestCartRecovery from '../components/GuestCartRecovery';

const CartPage = () => {
    const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();

    const subtotal = cartTotal;
    const shipping = 0; // Free shipping
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + shipping + tax;

    return (
        <div className="cart-page-container">
            <div className="container mx-auto px-4 lg:px-8">

                {/* Header */}
                <div className="cart-header">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4">
                        <ArrowLeft size={20} />
                        <span>Continue Shopping</span>
                    </Link>
                    <h1 className="cart-title">Shopping Cart</h1>
                    <p className="cart-subtitle">{cartItems.length} items in your cart</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Cart Items */}
                    <div className="lg:col-span-8 space-y-6">
                        {cartItems.length === 0 ? (
                            <div className="cart-empty-state">
                                <ShoppingBag size={64} className="mx-auto text-zinc-700 mb-4" />
                                <h2 className="text-2xl font-semibold text-white mb-2">Your cart is empty</h2>
                                <p className="text-gray-400 mb-6">Add some items to get started!</p>
                                <GuestCartRecovery className="mb-6" />
                                <Link to="/" className="inline-block bg-white text-black font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">
                                    Start Shopping
                                </Link>
                            </div>
                        ) : (
                            cartItems.map((item) => (
                                <div key={item.id} className="cart-item-card">
                                    {/* Left: Image Placeholder */}
                                    <div className="cart-item-image-wrapper">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Box size={40} className="text-zinc-600" strokeWidth={1.5} />
                                        )}
                                    </div>

                                    {/* Right: Product Details */}
                                    <div className="cart-item-details">
                                        <div className="cart-item-header">
                                            <div>
                                                <h3 className="cart-item-name">{item.name}</h3>
                                                <p className="cart-item-desc">{item.description}</p>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="cart-item-remove hover:bg-red-500/20 transition-colors group"
                                                aria-label={`Remove ${item.name} from cart`}
                                            >
                                                <Trash2 size={20} className="text-white group-hover:text-red-500" />
                                            </button>
                                        </div>

                                        <div className="cart-item-bottom">
                                            {/* Quantity Controls */}
                                            <div className="cart-quantity-controls">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="cart-qty-btn"
                                                    disabled={item.quantity <= 1}
                                                    aria-label={`Decrease quantity of ${item.name}`}
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="cart-qty-value">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="cart-qty-btn"
                                                    aria-label={`Increase quantity of ${item.name}`}
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>

                                            <div className="cart-item-price">
                                                {item.price}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-4">
                        <div className="cart-summary-card">
                            <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

                            <div className="space-y-4">
                                <div className="cart-summary-row">
                                    <span>Subtotal</span>
                                    <span className="text-white">Rs${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="cart-summary-row">
                                    <span>Shipping</span>
                                    <span className="text-green-400">Free</span>
                                </div>
                                <div className="cart-summary-row">
                                    <span>Tax</span>
                                    <span className="text-white">Rs${tax.toFixed(2)}</span>
                                </div>
                                <div className="cart-summary-row total">
                                    <span>Total</span>
                                    <span>Rs${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="cart-checkout-btn"
                                disabled
                                aria-describedby="cart-page-checkout-note"
                            >
                                Proceed to Checkout
                            </button>
                            <p id="cart-page-checkout-note" className="cart-checkout-note">
                                Checkout coming soon
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CartPage;
