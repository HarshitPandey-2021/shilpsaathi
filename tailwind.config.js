/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
           colors: {
        // Primary — warm terracotta/vermilion (CTAs, brand accents)
        terracotta: {
          DEFAULT: '#D55E3A',
          50:  '#FDF3F0', 100: '#FBE3DB', 200: '#F5C0AF',
          300: '#EC9376', 400: '#E1744F', 500: '#D55E3A',
          600: '#B84A2B', 700: '#953A22', 800: '#6E2B19',
          900: '#4A1D11',
        },
        // Secondary — saffron gold
        mustard: {
          DEFAULT: '#F59E0B',
          50:  '#FFFBEB', 100: '#FEF3C7', 200: '#FDE68A',
          300: '#FCD34D', 400: '#FBBF24', 500: '#F59E0B',
          600: '#D97706', 700: '#B45309', 800: '#92400E',
        },
        // Success — peacock teal (was forest green)
        forest: {
          DEFAULT: '#0D9488',
          50:  '#F0FDFA', 100: '#CCFBF1', 200: '#99F6E4',
          300: '#5EEAD4', 400: '#2DD4BF', 500: '#0D9488',
          600: '#0F766E', 700: '#115E59',
        },
        // Royal blue — AI moments, trust surfaces
        royal: {
          DEFAULT: '#1E3ABA',
          50:  '#EEF2FF', 100: '#E0E7FF', 200: '#C7D2FE',
          300: '#A5B4FC', 400: '#6366F1', 500: '#1E3ABA',
          600: '#1A32A0', 700: '#152885', 800: '#101E64',
        },
        // Rani pink — sparing accent
        rani: {
          DEFAULT: '#BE185D',
          50: '#FDF2F8', 100: '#FCE7F3', 200: '#FBCFE8', 500: '#BE185D', 600: '#9D174D',
        },
        ivory:     '#FFF7ED',
        parchment: '#FEF3E2',
        charcoal:  '#1E293B',
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
        'craft':   'linear-gradient(135deg, #E34A34 0%, #F59E0B 55%, #D55E3A 100%)',
        'royal':   'linear-gradient(135deg, #1E3ABA 0%, #3B4FD8 45%, #0D9488 100%)',
        'gold':    'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
        'leaf':    'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
        'rose':    'linear-gradient(135deg, #BE185D 0%, #9D174D 100%)',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
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