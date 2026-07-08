/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // ISCM Corporate Identity — typography hierarchy
      fontFamily: {
        barlow: ['Barlow', 'sans-serif'],                       // titles, headers, section names
        'barlow-condensed': ['"Barlow Condensed"', 'sans-serif'], // KPI metrics & table numbers
        ibm: ['"IBM Plex Sans"', 'sans-serif'],                 // body, tooltips, nav, UI controls
      },
      fontSize: {
        xs: ['14px', { lineHeight: '20px' }],
        sm: ['16px', { lineHeight: '24px' }],
        base: ['18px', { lineHeight: '28px' }],
        lg: ['20px', { lineHeight: '30px' }],
        xl: ['22px', { lineHeight: '32px' }],
        '2xl': ['26px', { lineHeight: '36px' }],
        '3xl': ['32px', { lineHeight: '42px' }],
        '4xl': ['40px', { lineHeight: '50px' }],
      },
      // ISCM Corporate Identity — color palette
      colors: {
        iscm: {
          crimson: '#990000',        // brand-crimson-red: logo block, active nav, focus cards
          'crimson-dark': '#7A0000',
          'crimson-light': '#A30000',
          header: '#181818',         // bg-header-dark: global top navigation bar
          charcoal: '#111111',       // primary text
          slate: '#1A1A1A',
          cta: '#000000',            // cta-black: primary action buttons & date blocks
          canvas: '#F8F9FA',         // bg-light-neutral: workspace canvas
          surface: '#F1F3F5',
          wrapper: '#E5E7EB',        // bg-gray-wrapper: timeline / phase tracking blocks
        },
      },
      boxShadow: {
        glass: '0 8px 32px rgba(17, 17, 17, 0.08)',
        'glass-hover': '0 12px 40px rgba(153, 0, 0, 0.12)',
      },
      backdropBlur: { glass: '12px' },
    },
  },
  plugins: [],
};
