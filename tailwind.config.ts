import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './services/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#171717',
        sand: '#f4efe6',
        clay: '#df6d57',
        forest: '#155e63',
        gold: '#f2b84b',
        mist: '#eef3f1'
      },
      boxShadow: {
        soft: '0 18px 50px rgba(23, 23, 23, 0.08)'
      },
      backgroundImage: {
        'hero-grid': 'radial-gradient(circle at top left, rgba(242, 184, 75, 0.18), transparent 28%), radial-gradient(circle at bottom right, rgba(21, 94, 99, 0.18), transparent 22%)'
      }
    }
  },
  plugins: []
};

export default config;