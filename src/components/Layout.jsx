import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />
            <main>
                {children}
            </main>
            <footer className="footer">
                <div className="container">
                    <p>&copy; 2025 DEALS ON WHEELS. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
