/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        beige: '#E5DDD0',
        coral: '#E84832',
        dark: '#1A1A1A',
        muted: '#888888',
      },
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      },
      maxWidth: {
        'content': '1400px',
      },
    },
  },
  plugins: [],
}
