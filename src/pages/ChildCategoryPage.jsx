import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Grid3x3, List } from 'lucide-react';
import CategoryGrid from '../components/CategoryGrid';
import { categories } from '../data/categories.jsx';
import { useCart } from '../context/CartContext';

// Import local images
import wheelsImg from '../assets/images/wheels_rims.png';
import bumpersImg from '../assets/images/bumpers_body_kits.png';
import lightsImg from '../assets/images/headlights_taillights.png';
import wrapsImg from '../assets/images/vinyl_wraps.png';
import spoilersImg from '../assets/images/spoilers_wings.png';
import seatsImg from '../assets/images/racing_seats.png';
import steeringImg from '../assets/images/steering_wheels.png';

// Image mapping for specific products
const productImages = {
    wheels: [
        "/images/wheels/chrome_racing_rim_black.png",
        "/images/wheels/matte_black_wheel_black.png",
        "/images/wheels/carbon_fiber_rim_black.png",
        "/images/wheels/bronze_alloy_wheel_black.png",
        "/images/wheels/gunmetal_racing_wheel_black.png",
        "/images/wheels/forged_alloy_wheel_black.png"
    ],
    bumpers: [
        "/images/bumpers/carbon_fiber_front_bumper.png",
        "/images/bumpers/racing_rear_bumper.png",
        "/images/bumpers/widebody_fender_flare.png",
        "/images/bumpers/carbon_fiber_front_bumper.png",
        "/images/bumpers/widebody_fender_flare.png",
        "/images/bumpers/racing_rear_bumper.png"
    ],
    headlights: [
        "/images/headlights/headlight_product_1.png",
        "/images/headlights/headlight_product_2.png",
        "/images/headlights/headlight_product_3.png",
        "/images/headlights/headlight_product_4.png",
        "/images/headlights/headlight_product_5.png",
        "/images/headlights/headlight_product_1.png"
    ],
    taillights: [
        "/images/taillights/taillight_product_1.png",
        "/images/taillights/taillight_product_2.png",
        "/images/taillights/taillight_product_3.png",
        "/images/taillights/taillight_product_4.png",
        "/images/taillights/taillight_product_5.png",
        "/images/taillights/taillight_product_6.png"
    ],
    lights: [
        lightsImg,
        lightsImg,
        lightsImg,
        lightsImg,
        lightsImg,
        lightsImg
    ],
    wraps: [
        "/images/wraps/matte_black_wrap_v3.png",
        "/images/wraps/gloss_nardo_grey_wrap.png",
        "/images/wraps/satin_metallic_blue_wrap.png",
        "/images/wraps/carbon_fiber_wrap.png",
        "/images/wraps/chameleon_shift_wrap.png",
        "/images/wraps/ceramic_coating_kit.png"
    ],
    spoilers: [
        "/images/spoilers/carbon_fiber_gt_wing.png",
        "/images/spoilers/lip_spoiler.png",
        "/images/spoilers/ducktail_spoiler.png",
        "/images/spoilers/adjustable_racing_wing.png",
        "/images/spoilers/roof_spoiler.png",
        "/images/spoilers/carbon_fiber_gt_wing.png" // Reusing GT wing as placeholder for 6th item
    ],
    seats: [
        "/images/seats/red_black_racing_seat_v2.png",
        "/images/seats/carbon_fiber_bucket_seat.png",
        "/images/seats/reclinable_sport_seat.png",
        "/images/seats/retro_classic_seat.png",
        "/images/seats/carbon_fiber_bucket_seat.png", // Reusing carbon fiber seat for Alcantara
        "/images/seats/red_black_racing_seat.png"     // Reusing red/black seat for FIA
    ],
    steering: [
        "/images/steering/suzuki_mehran_wheel.png",
        "/images/steering/toyota_corolla_wheel.png",
        "/images/steering/honda_civic_wheel.png",
        "/images/steering/classic_wood_grain_wheel.png",
        "/images/steering/leather_sport_wheel.png"
    ],
    lighting: [
        "/images/lighting/rgb_footwell_kit.png",
        "/images/lighting/fiber_optic_dash_trim.png",
        "/images/lighting/underglow_neon_kit.png",
        "/images/lighting/starry_night_headliner.png",
        "/images/lighting/door_projector_logo.png",
        "/images/lighting/interior_dome_led_pack.png"
    ],
    mats: [
        "/images/mats/diamond_stitch_mats.png",
        "/images/mats/all_weather_rubber_liners.png",
        "/images/mats/molded_floor_trays.png",
        "/images/mats/performance_carpet_mats.png",
        "/images/mats/heavy_duty_cargo_liner.png"
    ],
    audio: [
        "/images/audio/car_audio_system_pro_kit_1.png",
        "/images/audio/car_audio_system_pro_kit_2.jpg",
        "/images/audio/car_audio_system_pro_kit_3.png",
        "/images/audio/car_audio_system_pro_kit_4.png",
        "/images/audio/car_audio_system_pro_kit_5.png"
    ],
    screens: [
        "/images/screens/infotainment_screen_pro_kit_1.png",
        "/images/screens/infotainment_screen_pro_kit_2.png",
        "/images/screens/infotainment_screen_pro_kit_3.png",
        "/images/screens/infotainment_screen_pro_kit_4.jpg",
        "/images/screens/infotainment_screen_pro_kit_5.png"
    ],
    dashcams: [
        "/images/dashcams/dashcam_pro_kit_1.png",
        "/images/dashcams/dashcam_pro_kit_2.png",
        "/images/dashcams/dashcam_pro_kit_3.png",
        "/images/dashcams/dashcam_pro_kit_4.png"
    ],
    tuning: [
        "/images/tuning/performance_tuning_pro_kit_1.png",
        "/images/tuning/performance_tuning_pro_kit_2.png",
        "/images/tuning/performance_tuning_pro_kit_3.png",
        "/images/tuning/performance_tuning_pro_kit_4.png",
        "/images/tuning/performance_tuning_pro_kit_5.jpg"
    ]
};

// Product descriptions for each category
const productDescriptions = {
    wheels: [
        { name: "Forged Alloy Wheels 18\"", desc: "Lightweight forged aluminum construction with premium finish" },
        { name: "Chrome Racing Rims 19\"", desc: "High-gloss chrome finish with aerodynamic spoke design" },
        { name: "Matte Black Wheels 20\"", desc: "Stealthy matte black finish with reinforced hub design" },
        { name: "Carbon Fiber Rims 19\"", desc: "Ultra-lightweight carbon fiber for maximum performance" },
        { name: "Bronze Alloy Wheels 18\"", desc: "Unique bronze finish with concave spoke pattern" },
        { name: "Gunmetal Racing Wheels 20\"", desc: "Aggressive gunmetal finish with deep dish design" }
    ],
    headlights: [
        { name: "Matrix LED Headlights 2024", desc: "Adaptive matrix LED technology with dynamic beam control" },
        { name: "Halo Ring Projectors 35W", desc: "Angel eye halo rings with xenon HID projector retrofit" },
        { name: "Smoked LED Headlights V2", desc: "Blacked-out housing with sequential LED turn signals" },
        { name: "Bi-Xenon Projectors 6000K", desc: "High-intensity discharge projectors with auto-leveling" },
        { name: "OLED Strip Headlights Pro", desc: "Ultra-thin OLED daytime running lights with premium look" },
        { name: "Carbon Fiber Headlights GT", desc: "Lightweight carbon fiber housing with LED technology" }
    ],
    taillights: [
        { name: "Sequential LED Taillights V3", desc: "Dynamic sequential turn signals with OLED technology" },
        { name: "Clear Lens Taillights OEM+", desc: "Crystal clear housing with chrome reflectors" },
        { name: "Fiber Optic Taillights Pro", desc: "Advanced fiber optic light guides for unique appearance" },
        { name: "Blacked-Out Taillights Sport", desc: "Full black housing with hidden LED elements" },
        { name: "JDM Style Taillights Type-R", desc: "Japanese domestic market inspired design with red accents" }
    ],
    lighting: [
        { name: "RGB Footwell Kit", desc: "Universal RGB LED strips for footwells with remote control" },
        { name: "Fiber Optic Dash Trim", desc: "Flexible fiber optic light guide for dashboard and door panels" },
        { name: "Underglow Neon Kit", desc: "Waterproof underbody LED kit with million-color options" },
        { name: "Starry Night Headliner", desc: "Fiber optic roof kit creating a starry sky effect" },
        { name: "Door Projector Logo", desc: "LED door lights projecting car logo on the ground" },
        { name: "Interior Dome LED Pack", desc: "Super bright white LED replacement bulbs for dome lights" }
    ],
    mats: [
        { name: "Diamond Stitch Luxury Mats", desc: "Premium quilted leather mats with diamond stitching for a VIP look" },
        { name: "All-Weather Rubber Liners", desc: "Heavy-duty rubber mats with deep channels to trap water and debris" },
        { name: "3D Molded Floor Trays", desc: "Laser-measured floor liners with high edges for maximum protection" },
        { name: "Performance Carpet Mats", desc: "High-density plush carpet mats with reinforced heel pad and sport piping" },
        { name: "Heavy Duty Cargo Liner", desc: "Tough rubber trunk liner to protect your cargo area from spills" }
    ],
    wraps: [
        { name: "Matte Black Vinyl Wrap", desc: "Stealthy matte finish, air-release technology for bubble-free install" },
        { name: "Gloss Nardo Grey Wrap", desc: "High-gloss premium grey finish, durable and scratch-resistant" },
        { name: "Satin Metallic Blue Wrap", desc: "Stunning satin metallic finish that shifts in the light" },
        { name: "Carbon Fiber Vinyl Wrap", desc: "Realistic 3D carbon fiber texture for hoods, roofs, and trim" },
        { name: "Chameleon Color Shift Wrap", desc: "Iridescent purple-green color shift for a unique look" },
        { name: "Ceramic Coating Kit", desc: "Professional grade ceramic protection for paint and wraps" }
    ],
    spoilers: [
        { name: "Carbon Fiber GT Wing", desc: "High-downforce adjustable GT wing for track performance" },
        { name: "Lip Spoiler Sport", desc: "Subtle trunk lip spoiler for a clean, factory-plus look" },
        { name: "Ducktail Spoiler V2", desc: "Aggressive ducktail design with integrated brake light" },
        { name: "Adjustable Racing Wing", desc: "Aluminum construction with fully adjustable angle of attack" },
        { name: "Roof Spoiler Aero", desc: "Rear window roof spoiler for improved aerodynamics" },
        { name: "High Downforce Wing", desc: "Massive time-attack style wing for maximum grip" }
    ],
    seats: [
        { name: "Red/Black Racing Seat", desc: "Sporty design with premium red accents and high-density foam" },
        { name: "Carbon Fiber Bucket Seat", desc: "Ultra-lightweight hard-shell back with aggressive side bolsters" },
        { name: "Reclinable Sport Seat", desc: "Comfortable black leather finish with fully adjustable backrest" },
        { name: "Retro Classic Seat", desc: "Vintage style with corduroy and leather mix for classic builds" },
        { name: "Alcantara Competition Seat", desc: "Premium suede-like finish for maximum grip during cornering" },
        { name: "FIA Homologated Seat", desc: "Professional racing seat with head restraint and safety certification" }
    ],
    steering: [
        { name: "Suzuki Mehran Classic", desc: "Classic 2-spoke thin steering wheel, authentic black finish" },
        { name: "Toyota Corolla (Indus)", desc: "Reliable 3-spoke design, durable urethane grip" },
        { name: "Honda Civic (Rebirth)", desc: "Modern 3-spoke wheel with silver accents and ergonomic grip" },
        { name: "Heritage Wood & Chrome", desc: "Hand-polished mahogany rim with slotted chrome spokes for classic builds" },
        { name: "Luxury Leather Sedan", desc: "Premium stitched leather wheel for executive sedans" }
    ],
};

const productData = [
    { originalPrice: 399.99, discount: 25, rating: 4.8, reviewCount: 234 },
    { originalPrice: 599.99, discount: 15, rating: 4.5, reviewCount: 189 },
    { originalPrice: 299.99, discount: 30, rating: 4.9, reviewCount: 312 },
    { originalPrice: 799.99, discount: 20, rating: 4.6, reviewCount: 156 },
    { originalPrice: 449.99, discount: 10, rating: 4.7, reviewCount: 278 },
    { originalPrice: 649.99, discount: 18, rating: 4.4, reviewCount: 201 }
];

const ChildCategoryPage = () => {
    const { type, childId } = useParams();
    const categoryData = categories[type];
    const childItem = categoryData?.items.find(item => item.id === childId);

    const { addToCart } = useCart();

    // Mock products - convert to items format like CategoryGrid expects.
    // Images and descriptions for this category are resolved inside the memo.
    const productItems = useMemo(() => {
        if (!childItem) return [];

        const categoryImages = productImages[childId] || [];
        const categoryDescs = productDescriptions[childId] || [];
        const itemCount = categoryImages.length > 0 ? categoryImages.length : 6;

        return Array(itemCount).fill(null).map((_, i) => {
            const data = productData[i % productData.length];
            const discountedPrice = data.originalPrice * (1 - data.discount / 100);

            return {
                id: `${childId}-product-${i}`,
                name: categoryDescs[i]?.name || `${childItem.name} Pro Kit ${i + 1}`,
                description: categoryDescs[i]?.desc || `Premium ${childItem.name.toLowerCase()} upgrade package`,
                image: categoryImages[i % categoryImages.length] || childItem.image,
                icon: childItem.icon,
                originalPrice: `Rs${data.originalPrice.toFixed(2)}`,
                price: `Rs${discountedPrice.toFixed(2)}`,
                discount: data.discount,
                rating: data.rating,
                reviewCount: data.reviewCount
            };
        });
    }, [childItem, childId]);

    const [viewMode, setViewMode] = useState('grid');
    const [sortOption, setSortOption] = useState('featured');
    const [isSortOpen, setIsSortOpen] = useState(false);

    // Sort items
    const sortedItems = useMemo(() => {
        let sorted = [...productItems];
        if (sortOption === 'name-asc') {
            sorted.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortOption === 'name-desc') {
            sorted.sort((a, b) => b.name.localeCompare(a.name));
        }
        return sorted;
    }, [productItems, sortOption]);

    // All hooks run before this point so hook order stays stable across route changes.
    if (!childItem) {
        return <div className="p-8 text-center text-white">Category not found</div>;
    }

    const sortOptions = [
        { id: 'featured', label: 'Featured' },
        { id: 'name-asc', label: 'Name (A-Z)' },
        { id: 'name-desc', label: 'Name (Z-A)' }
    ];

    // Get hero image
    const heroImage = childItem.image || '';

    return (
        <div className="min-h-screen bg-black text-white" >
            {/* Hero Section */}
            < div className="category-hero" >
                <div className="category-hero-bg" style={{ backgroundImage: `url(${heroImage})` }} />
                <div className="category-hero-overlay" />

                <div className="container relative z-10">
                    {/* Location Badge (Breadcrumb) */}
                    <div className="location-badge-wrapper">
                        <div className="location-badge">
                            <div className="location-dot"></div>
                            <Link to="/" className="location-link">Home</Link>
                            <ChevronRight size={14} className="location-separator" />
                            <Link to={`/category/${type}`} className="location-link">{categoryData.title}</Link>
                            <ChevronRight size={14} className="location-separator" />
                            <span className="location-current">{childItem.name}</span>
                        </div>
                    </div>

                    {/* Hero Content */}
                    <div className="category-hero-content">
                        <h1 className="category-hero-title">{childItem.name}</h1>
                        <p className="category-hero-desc">{childItem.description}</p>

                        {/* Action Bar */}
                        <div className="category-actions-bar">
                            <div className="flex items-center gap-6">
                                <button className="action-btn">
                                    <span className="font-medium">Filter</span>
                                </button>

                                {/* Sort Dropdown */}
                                <div className="relative">
                                    <button
                                        className="action-btn"
                                        onClick={() => setIsSortOpen(!isSortOpen)}
                                        onBlur={() => setTimeout(() => setIsSortOpen(false), 200)}
                                    >
                                        <span className="font-medium">Sort By: {sortOptions.find(o => o.id === sortOption)?.label}</span>
                                        <ChevronRight size={16} className={`transition-transform ${isSortOpen ? 'rotate-90' : ''}`} />
                                    </button>

                                    {isSortOpen && (
                                        <div className="sort-dropdown">
                                            {sortOptions.map(option => (
                                                <button
                                                    key={option.id}
                                                    className={`sort-option ${sortOption === option.id ? 'active' : ''}`}
                                                    onClick={() => {
                                                        setSortOption(option.id);
                                                        setIsSortOpen(false);
                                                    }}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="view-toggle">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                    aria-label="Grid view"
                                >
                                    <Grid3x3 size={20} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                                    aria-label="List view"
                                >
                                    <List size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            {/* Main Content */}
            < div className="category-content" >
                <div className="container">
                    <CategoryGrid
                        items={sortedItems}
                        title=""
                        description=""
                        viewMode={viewMode}
                        onAddToCart={addToCart}
                    />
                </div>
            </div >
        </div >
    );
};

export default ChildCategoryPage;
