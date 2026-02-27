import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f3f9',
          100: '#d9e0ef',
          200: '#b3c1df',
          300: '#8da2cf',
          400: '#6783bf',
          500: '#4164af',
          600: '#34508c',
          700: '#273c69',
          800: '#1a2846',
          900: '#0f172a',
          950: '#080c15',
        },
        gold: {
          50: '#faf6f0',
          100: '#f0e6d1',
          200: '#e1cda3',
          300: '#d2b475',
          400: '#c69c6d',
          500: '#b8874f',
          600: '#9a6d3d',
          700: '#7c532e',
          800: '#5e3f22',
          900: '#402b17',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

export default config;
