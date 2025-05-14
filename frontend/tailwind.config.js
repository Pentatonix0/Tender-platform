/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            scale: {
                101: '1.01', // масштаб 101% для увеличения на 1%
            },
        },
    },
    plugins: [],
};
