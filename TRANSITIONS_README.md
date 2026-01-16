# 🎬 Barba.js-Style Page Transitions with GSAP

Beautiful, cinematic page-to-page transitions for your React app, inspired by Barba.js and powered by GSAP.

## ✨ Features

- **6 Unique Transition Styles** - Curtain wipe, vertical reveal, diagonal slide, zoom fade, split reveal, and glitch
- **Smooth Animations** - Powered by GSAP for buttery-smooth 60fps animations
- **Layered Effects** - Multi-layered curtain overlays for depth and visual interest
- **Easy to Use** - Simple prop-based API for switching between transitions
- **Optimized Performance** - Efficient animations with proper cleanup
- **Barba.js Inspired** - Classic page transition aesthetics adapted for React

## 🚀 Quick Start

### Current Setup (Default Curtain Wipe)

Your app is already configured with the **Curtain Wipe** transition! Just navigate between pages to see it in action.

```bash
npm run dev
```

Visit `http://localhost:5173` and navigate between pages to see the transitions.

### View All Transitions

Visit the demo page to see all 6 transition styles:

```
http://localhost:5173/demo
```

## 🎨 Available Transitions

### 1. Curtain Wipe (Default) →
Horizontal sliding curtains - Classic Barba.js style
- Smooth horizontal wipe from left to right
- Staggered multi-layer effect
- Perfect for general navigation

### 2. Vertical Reveal ↓
Top to bottom reveal with smooth easing
- Elegant vertical slide
- Great for content-heavy pages
- Smooth expo easing

### 3. Diagonal Slide ↘
Diagonal wipe with 3D rotation
- Dynamic diagonal movement
- Subtle 3D perspective
- Modern and eye-catching

### 4. Zoom Fade ⊕
Scale and fade with bounce effect
- Smooth scale transitions
- Bounce effect on entry
- Great for image galleries

### 5. Split Reveal ⇆
Center split with 3D perspective
- Curtains split from center
- 3D rotation effect
- Dramatic and impressive

### 6. Glitch Transition ⚡
Modern glitch effect with steps
- Fast, snappy animations
- Glitchy, cyberpunk aesthetic
- Perfect for tech-focused sites

## 🔧 How to Switch Transitions

### Method 1: Use PageTransitionAdvanced Component

Replace `PageTransition` with `PageTransitionAdvanced` in your `App.jsx`:

```jsx
import PageTransitionAdvanced from './components/PageTransitionAdvanced';

function App() {
  return (
    <Layout>
      <PageTransitionAdvanced transitionType="diagonal">
        <Routes location={location} key={location.pathname}>
          {/* Your routes */}
        </Routes>
      </PageTransitionAdvanced>
    </Layout>
  );
}
```

Available `transitionType` values:
- `"curtain"` (default)
- `"vertical"`
- `"diagonal"`
- `"zoom"`
- `"split"`
- `"glitch"`

### Method 2: Modify PageTransition.jsx

Edit `src/components/PageTransition.jsx` and import a different transition function:

```jsx
import { verticalReveal } from '../utils/transitions';

// Then use it in your timeline
const exitTl = verticalReveal(curtains, contentRef.current, false);
const enterTl = verticalReveal(curtains, contentRef.current, true);
```

## 📁 File Structure

```
src/
├── components/
│   ├── PageTransition.jsx          # Main transition component (curtain wipe)
│   └── PageTransitionAdvanced.jsx  # Advanced component with all transitions
├── utils/
│   └── transitions.js              # Transition animation library
└── pages/
    └── TransitionDemo.jsx          # Interactive demo page
```

## 🎯 Customization

### Adjust Transition Speed

Edit the `duration` values in `src/utils/transitions.js`:

```javascript
tl.to(curtains, {
    scaleX: 0,
    duration: 0.8,  // ← Change this (in seconds)
    ease: 'power3.inOut',
    // ...
});
```

### Change Curtain Colors

Edit the gradient classes in `PageTransition.jsx`:

```jsx
<div
    ref={curtainRef}
    className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black z-[100]"
/>
```

### Modify Easing

GSAP provides many easing options:
- `power1/2/3/4.in/out/inOut` - Standard easing
- `back.in/out/inOut` - Overshoot effect
- `elastic.in/out/inOut` - Bouncy effect
- `expo.in/out/inOut` - Exponential
- `steps(n)` - Stepped animation

## 🎬 How It Works

1. **On Route Change**: React Router detects navigation via `useLocation()`
2. **Exit Animation**: Current page fades out while curtains slide in
3. **Content Swap**: React Router updates the component
4. **Enter Animation**: Curtains slide out revealing new page content

The transitions use GSAP timelines for precise control and smooth sequencing.

## 🔥 Performance Tips

- Transitions use `transform` and `opacity` for GPU acceleration
- Proper cleanup with `tl.kill()` prevents memory leaks
- `pointer-events-none` ensures curtains don't block interactions
- Staggered animations create depth without performance cost

## 🐛 Troubleshooting

### Transitions not working?
- Make sure GSAP is installed: `npm install gsap`
- Check that `key={location.pathname}` is on your Routes component
- Verify PageTransition wraps your Routes

### Transitions too fast/slow?
- Adjust `duration` values in `transitions.js`
- Modify stagger timing for curtain layers

### Content flashing?
- Ensure proper z-index layering (curtains: 98-100, content: 10)
- Check that curtains have `pointer-events-none`

## 📚 Resources

- [GSAP Documentation](https://greensock.com/docs/)
- [Barba.js](https://barba.js.org/) - Original inspiration
- [React Router](https://reactrouter.com/)

## 🎨 Credits

Transitions inspired by Barba.js and modern web design trends. Built with GSAP and React.

---

**Enjoy your beautiful page transitions! 🚀**

Need help? Check the demo page at `/demo` or review the code comments in the transition files.
