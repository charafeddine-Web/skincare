/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FADADD',
        'primary-deep': '#E8B4BC',
        accent: '#C5A059',
        'accent-deep': '#A8874A',
        'accent-light': '#F0E4CE',
        secondary: '#1C1C1E',
        background: '#FFFCFA',
        surface: '#F7F3EF',
        'surface-alt': '#EFE9E3',
        'text-main': '#1C1C1E',
        'text-muted': '#7A7070',
      },
    },
  },
  plugins: [],
};
