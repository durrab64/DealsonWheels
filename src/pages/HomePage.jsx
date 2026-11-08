import React from 'react';
import Hero from '../components/Hero';
import CategorySection from '../components/CategorySection';
import BuySell from '../components/BuySell';

import { getCategory } from '../data/catalogRepository';

const HomePage = () => {
    const exterior = getCategory('exterior');
    const interior = getCategory('interior');
    const tech = getCategory('tech');

    return (
        <>
            <Hero />
            <div id="exterior">
                <CategorySection
                    title={exterior.title}
                    items={exterior.items}
                    id="exterior"
                    type="exterior"
                />
            </div>
            <div id="interior">
                <CategorySection
                    title={interior.title}
                    items={interior.items}
                    id="interior"
                    type="interior"
                />
            </div>
            <div id="tech">
                <CategorySection
                    title={tech.title}
                    items={tech.items}
                    id="tech"
                    type="tech"
                />
            </div>
            <BuySell />
        </>
    );
};

export default HomePage;
