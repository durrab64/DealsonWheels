import React from 'react';
import Hero from '../components/Hero';
import CategorySection from '../components/CategorySection';
import BuySell from '../components/BuySell';
import PageTransition from '../components/PageTransition';

import { categories } from '../data/categories.jsx';

const HomePage = () => {
    return (
        <PageTransition>
            <Hero />
            <div id="exterior">
                <CategorySection
                    title={categories.exterior.title}
                    items={categories.exterior.items}
                    id="exterior"
                    type="exterior"
                />
            </div>
            <div id="interior">
                <CategorySection
                    title={categories.interior.title}
                    items={categories.interior.items}
                    id="interior"
                    type="interior"
                />
            </div>
            <div id="tech">
                <CategorySection
                    title={categories.tech.title}
                    items={categories.tech.items}
                    id="tech"
                    type="tech"
                />
            </div>
            <BuySell />
        </PageTransition>
    );
};

export default HomePage;
