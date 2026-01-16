import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import PageTransition from './components/PageTransition';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ChildCategoryPage from './pages/ChildCategoryPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import BuySellPage from './pages/BuySellPage';
import BuySellProductPage from './pages/BuySellProductPage';
import TradePage from './pages/TradePage';

import SellCarPage from './pages/SellCarPage';
import TransitionDemo from './pages/TransitionDemo';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';

function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <CartProvider>
        <Layout>
          <PageTransition>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<HomePage />} />
              <Route path="/demo" element={<TransitionDemo />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/buy-sell" element={<BuySellPage />} />
              <Route path="/sell-car" element={<SellCarPage />} />
              <Route path="/category/cars/used/:id" element={<BuySellProductPage />} />
              <Route path="/trade/:id" element={<TradePage />} />

              <Route path="/category/:type" element={<CategoryPage />} />
              <Route path="/category/:type/:childId" element={<ChildCategoryPage />} />
              <Route path="/category/:type/:childId/:productId" element={<ProductPage />} />
            </Routes>
          </PageTransition>
          <CartDrawer />
          <AuthModal />
        </Layout>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
