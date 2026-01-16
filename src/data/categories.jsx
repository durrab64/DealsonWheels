import {
    Disc, Car, Lightbulb, Palette, Wind,
    Armchair, CircleDashed, Zap, Layers,
    Speaker, Monitor, Shield, Gauge
} from 'lucide-react';

// Import local images
import wheelsImg from '../assets/images/wheels_rims.png';
import bumpersImg from '../assets/images/bumpers_body_kits.png';
import lightsImg from '../assets/images/headlights_taillights.png';
import seatsImg from '../assets/images/racing_seats.png';
import steeringImg from '../assets/images/steering_wheels.png';

export const categories = {
    exterior: {
        title: "Exterior",
        description: "Transform your vehicle's look with premium exterior modifications.",
        items: [
            {
                id: "wheels",
                name: "Wheels & Rims",
                icon: Disc,
                image: "/images/wheels/chrome_racing_rim_black.png",
                description: "Custom alloy wheels, forged rims, and performance tires."
            },
            {
                id: "bumpers",
                name: "Bumpers & Body Kits",
                icon: Car,
                image: "/images/bumpers/carbon_fiber_front_bumper.png",
                description: "Aggressive front and rear bumpers, side skirts, and widebody kits."
            },
            {
                id: "headlights",
                name: "Headlights",
                icon: Lightbulb,
                image: "/images/headlights/headlight_isolated_black.png",
                description: "LED conversion kits, halo rings, and projector retrofits."
            },
            {
                id: "taillights",
                name: "Taillights",
                icon: Lightbulb,
                image: "/images/taillights/taillight_isolated_black.png",
                description: "Smoked taillights, sequential LEDs, and euro-style lights."
            },
            {
                id: "wraps",
                name: "Vinyl Wraps & Paint",
                icon: Palette,
                image: "/images/wraps/matte_black_wrap_v3.png",
                description: "Full body wraps, chrome deletes, and ceramic coating."
            },
            {
                id: "spoilers",
                name: "Spoilers & Wings",
                icon: Wind,
                image: "/images/spoilers/carbon_fiber_gt_wing.png",
                description: "Carbon fiber spoilers, GT wings, and lip spoilers."
            }
        ]
    },
    interior: {
        title: "Interior",
        description: "Upgrade your driving experience with luxury interior modifications.",
        items: [
            {
                id: "seats",
                name: "Racing Seats",
                icon: Armchair,
                image: "/images/seats/red_black_racing_seat.png",
                description: "Bucket seats, leather upholstery, and seat covers."
            },
            {
                id: "steering",
                name: "Steering Wheels",
                icon: CircleDashed,
                image: "/images/steering/suzuki_mehran_wheel.png",
                description: "Carbon fiber steering wheels, quick release hubs."
            },
            {
                id: "lighting",
                name: "Ambient Lighting",
                icon: Zap,
                image: "/images/lighting/rgb_footwell_kit.png",
                description: "RGB footwell kits, starlight headliners, and dash strips."
            },
            {
                id: "mats",
                name: "Floor Mats & Liners",
                icon: Layers,
                image: "/images/mats/diamond_stitch_mats.png",
                description: "Custom fit 3D mats, all-weather liners."
            }
        ]
    },
    tech: {
        title: "Tech Upgrades",
        description: "Modernize your ride with the latest automotive technology.",
        items: [
            {
                id: "audio",
                name: "Car Audio Systems",
                icon: Speaker,
                image: "/images/audio/car_audio_system_pro_kit_1.png",
                description: "Subwoofers, amplifiers, and component speakers."
            },
            {
                id: "screens",
                name: "Infotainment Screens",
                icon: Monitor,
                image: "/images/screens/infotainment_screen_pro_kit_1.png",
                description: "Android Auto/CarPlay units, tesla-style screens."
            },
            {
                id: "dashcams",
                name: "Dash Cams & Security",
                icon: Shield,
                image: "/images/dashcams/dashcam_pro_kit_1.png",
                description: "4K dash cams, GPS trackers, and alarm systems."
            },
            {
                id: "tuning",
                name: "Performance Tuning",
                icon: Gauge,
                image: "/images/tuning/performance_tuning_pro_kit_1.png",
                description: "ECU tuners, throttle controllers, and OBD2 scanners."
            }
        ]
    }
};
