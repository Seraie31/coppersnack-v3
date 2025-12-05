module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff6b35',
        secondary: '#f7931e',
        dark: {
          100: '#1e293b',
          200: '#0f172a',
          300: '#020617'
        }
      }
    },
  },
  plugins: [],
}
