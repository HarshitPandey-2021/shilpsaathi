/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        terracotta: {
          DEFAULT: '#A44932',
          50:  '#FBF1EE', 100: '#F6DFD8', 200: '#EBBBAC',
          300: '#DC9078', 400: '#C76A4E', 500: '#A44932',
          600: '#8E3E29', 700: '#733222', 800: '#57261A',
          900: '#3B1A12',
        },
        mustard: {
          DEFAULT: '#D4A72C',
          50:  '#FDF8EA', 100: '#FAEFC9', 200: '#F3DE93',
          300: '#E9CA5C', 400: '#D4A72C', 500: '#BC9222',
          600: '#96741B', 700: '#6F5614', 800: '#48380D',
        },
        forest: {
          DEFAULT: '#3F7D58',
          50: '#EFF6F2', 100: '#D8EADF', 200: '#A9CFBA',
          300: '#77B192', 400: '#3F7D58', 500: '#356848',
          600: '#2A533A', 700: '#1F3E2B',
        },
        ivory:    '#FFF9F0',
        parchment:'#FBF3E7',
        charcoal: '#292524',
      },
      fontFamily: {
        sans:    ['Inter', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Noto Sans Devanagari', 'Georgia', 'serif'],
        deva:    ['Noto Sans Devanagari', 'Inter', 'sans-serif'],
      },
      // Nudged up ~8% for low-literacy legibility. Existing text-xs/sm just get better.
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
        xs:    ['0.8125rem', { lineHeight: '1.15rem' }],
        sm:    ['0.9375rem', { lineHeight: '1.4rem' }],
        base:  ['1.0625rem', { lineHeight: '1.6rem' }],
        lg:    ['1.1875rem', { lineHeight: '1.7rem' }],
        xl:    ['1.375rem',  { lineHeight: '1.8rem' }],
        '2xl': ['1.625rem',  { lineHeight: '2rem' }],
        '3xl': ['2rem',      { lineHeight: '2.3rem' }],
        '4xl': ['2.5rem',    { lineHeight: '2.75rem' }],
      },
      borderRadius: {
        xl: '0.875rem', '2xl': '1.125rem', '3xl': '1.5rem', '4xl': '2rem',
      },
      boxShadow: {
        xs:    '0 1px 2px rgba(41,37,36,0.05)',
        card:  '0 1px 2px rgba(41,37,36,0.04), 0 6px 16px -6px rgba(164,73,50,0.10)',
        lift:  '0 4px 8px -2px rgba(41,37,36,0.06), 0 16px 32px -12px rgba(164,73,50,0.22)',
        glow:  '0 0 0 4px rgba(164,73,50,0.10)',
        inset: 'inset 0 1px 2px rgba(41,37,36,0.06)',
      },
      backgroundImage: {
        'craft':   'linear-gradient(135deg, #A44932 0%, #8E3E29 55%, #733222 100%)',
        'gold':    'linear-gradient(135deg, #D4A72C 0%, #BC9222 100%)',
        'leaf':    'linear-gradient(135deg, #3F7D58 0%, #2A533A 100%)',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)',
      },
      keyframes: {
        'fade-in':    { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        'fade-in-up': { '0%': { opacity: 0, transform: 'translateY(10px)' }, '100%': { opacity: 1, transform: 'none' } },
        'scale-in':   { '0%': { opacity: 0, transform: 'scale(.96)' }, '100%': { opacity: 1, transform: 'none' } },
        'shimmer':    { '100%': { transform: 'translateX(100%)' } },
        'breathe':    { '0%,100%': { transform: 'scale(1)', opacity: .85 }, '50%': { transform: 'scale(1.04)', opacity: 1 } },
        'pop':        { '0%': { transform: 'scale(.8)', opacity: 0 }, '60%': { transform: 'scale(1.06)' }, '100%': { transform: 'scale(1)', opacity: 1 } },
      },
      animation: {
        'fade-in':    'fade-in .35s ease-out both',
        'fade-in-up': 'fade-in-up .4s cubic-bezier(.22,1,.36,1) both',
        'scale-in':   'scale-in .3s cubic-bezier(.22,1,.36,1) both',
        'shimmer':    'shimmer 1.6s infinite',
        'breathe':    'breathe 2.6s ease-in-out infinite',
        'pop':        'pop .4s cubic-bezier(.34,1.56,.64,1) both',
      },
    },
  },
  plugins: [],
}