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
        coral: '#FC3117',
        dark: '#1A1A1A',
        muted: '#888888',
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'sans-serif'],
      },
      maxWidth: {
        'content': '1400px',
      },
    },
  },
  plugins: [],
}
