import fs from 'fs';

const mobileCSS = `

/* ============================================
   MOBILE RESPONSIVE STYLES
   ============================================ */

/* Mobile Menu Button - Hidden on Desktop */
.mobile-menu-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1001;
}

.mobile-menu-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
}

@media (max-width: 1024px) {
  .mobile-menu-btn {
    display: flex;
  }

  .nav-links {
    display: none;
  }
}

/* Mobile Menu Overlay */
.mobile-menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  z-index: 1100;
}

/* Mobile Menu Drawer */
.mobile-menu {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 85%;
  max-width: 400px;
  background: linear-gradient(135deg, rgba(10, 10, 12, 0.98) 0%, rgba(5, 5, 7, 0.98) 100%);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1200;
  overflow-y: auto;
  box-shadow: -10px 0 50px rgba(0, 0, 0, 0.5);
}

.mobile-menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.mobile-menu-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.3s ease;
}

.mobile-menu-close:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.mobile-menu-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Mobile Search */
.mobile-search {
  position: relative;
  width: 100%;
}

.mobile-search .search-input {
  width: 100%;
}

.mobile-search .search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
}

/* Mobile Navigation Links */
.mobile-nav-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
}

.mobile-nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateX(4px);
}

.mobile-nav-category-btn {
  width: 100%;
  text-align: left;
}

.mobile-dropdown {
  overflow: hidden;
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mobile-dropdown-item {
  padding: 0.875rem 1.25rem 0.875rem 2rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.mobile-dropdown-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--color-text);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.mobile-menu-footer {
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Responsive Typography */
@media (max-width: 768px) {
  /* Hero Section */
  .hero {
    min-height: 70vh;
  }

  .hero-title {
    font-size: 2.5rem !important;
    line-height: 1.2;
  }

  .hero-subtitle {
    font-size: 1rem;
    margin-bottom: 2rem;
  }

  .hero-actions {
    flex-direction: column;
    width: 100%;
  }

  .hero-actions .btn {
    width: 100%;
    justify-content: center;
  }

  /* Section Titles */
  .section-title {
    font-size: 1.75rem;
  }

  .category-hero-title {
    font-size: 2rem !important;
  }

  .category-hero-desc {
    font-size: 1rem;
  }

  .buy-sell-title {
    font-size: 2rem !important;
  }

  .buy-sell-desc {
    font-size: 1rem;
  }

  /* Container Padding */
  .container {
    padding: 0 1rem;
  }

  /* Section Padding */
  .category-section {
    padding: 3rem 0;
  }

  .category-content {
    padding: 2rem 0;
  }

  .buy-sell-section {
    padding: 4rem 0;
  }

  /* Logo Sizing */
  .logo img {
    height: 80px !important;
  }

  /* Navbar */
  .navbar {
    height: 70px;
  }

  :root {
    --header-height: 70px;
  }

  /* Cards */
  .card-title {
    font-size: 1.1rem;
  }

  .card-content {
    padding: 1rem;
  }

  /* Slider Cards */
  .card-slider-enhanced {
    width: 280px !important;
  }

  .category-slider-wrapper-home {
    margin: 0 -1rem;
    padding: 0 1rem;
  }

  /* Category Actions Bar */
  .category-actions-bar {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }

  /* Product Horizontal Card */
  .product-horizontal-card {
    grid-template-columns: 1fr !important;
    min-height: auto !important;
  }

  .product-horizontal-image {
    min-height: 250px;
  }

  .product-horizontal-details {
    padding: 1.5rem !important;
  }

  /* Category Card List View */
  .category-card-list .category-card-link-enhanced {
    flex-direction: column;
  }

  .category-card-list .category-card-image-wrapper-enhanced {
    width: 100% !important;
    height: 200px !important;
  }

  /* Buttons */
  .btn {
    padding: 0.875rem 1.25rem;
    font-size: 0.95rem;
    min-height: 44px;
  }

  .btn-premium {
    padding: 0.875rem 1.5rem;
    font-size: 0.95rem;
  }

  /* Feature List */
  .feature-item {
    padding: 1rem;
    gap: 1rem;
  }

  .feature-text h3 {
    font-size: 1rem;
  }

  .feature-text p {
    font-size: 0.875rem;
  }

  /* Location Badge */
  .location-badge {
    font-size: 0.75rem;
    padding: 0.5rem 1rem;
    gap: 0.5rem;
  }

  /* Search Bar - Hide on Mobile */
  .search-bar {
    display: none !important;
  }
}

/* Tablet Responsive */
@media (min-width: 769px) and (max-width: 1024px) {
  .hero-title {
    font-size: 3.5rem !important;
  }

  .section-title {
    font-size: 2rem;
  }

  .container {
    padding: 0 1.25rem;
  }

  .category-section {
    padding: 4rem 0;
  }

  .buy-sell-section {
    padding: 6rem 0;
  }

  .card-slider-enhanced {
    width: 320px !important;
  }
}

/* Small Mobile (< 375px) */
@media (max-width: 374px) {
  .hero-title {
    font-size: 2rem !important;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .category-hero-title {
    font-size: 1.75rem !important;
  }

  .buy-sell-title {
    font-size: 1.75rem !important;
  }

  .logo img {
    height: 60px !important;
  }

  .card-slider-enhanced {
    width: 260px !important;
  }

  .btn {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
}

/* Landscape Mobile */
@media (max-width: 896px) and (orientation: landscape) {
  .hero {
    min-height: 100vh;
  }

  .mobile-menu {
    max-width: 50%;
  }
}

/* Touch Target Improvements */
@media (hover: none) and (pointer: coarse) {
  .btn,
  .action-btn,
  .mobile-nav-item,
  .dropdown-item,
  .nav-item a {
    min-height: 44px;
    min-width: 44px;
  }

  .card,
  .card-slider-enhanced,
  .category-card-enhanced {
    cursor: pointer;
  }
}

/* Prevent Horizontal Scroll */
@media (max-width: 1024px) {
  body {
    overflow-x: hidden;
  }

  * {
    max-width: 100%;
  }

  .container {
    overflow-x: hidden;
  }
}
`;

// Append to index.css
fs.appendFileSync('src/index.css', mobileCSS, 'utf8');
console.log('Successfully appended mobile responsive CSS');
