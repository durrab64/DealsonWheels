/** @type {import('tailwindcss').Config} */
// Triggering reload for Tailwind v4
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: 'var(--color-bg)',
                text: 'var(--color-text)',
                'text-muted': 'var(--color-text-muted)',
                border: 'var(--color-border)',
                primary: 'var(--color-primary)',
                'primary-fg': 'var(--color-primary-fg)',
                secondary: 'var(--color-secondary)',
            },
            fontFamily: {
                main: ['var(--font-main)'],
            },
        },
    },
    plugins: [],
}
