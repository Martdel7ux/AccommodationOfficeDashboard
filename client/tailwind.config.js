/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#FFF1F3',
          100: '#FFE0E5',
          200: '#FFC6CF',
          300: '#FF8FA3',
          400: '#FF4D6D',
          500: '#E11740',
          600: '#C41230',
          700: '#A50F28',
          800: '#880D22',
          900: '#72101F',
        },
      },
      fontFamily: {
        sans: ['"Poppins"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      boxShadow: {
        card:   '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        hover:  '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
        modal:  '0 24px 80px rgba(0,0,0,0.18)',
        glass:  '0 4px 24px -4px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)',
        'glass-hover': '0 12px 40px -4px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)',
        'glass-strong': '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95)',
        'stat-red':    '0 8px 24px rgba(196,18,48,0.20)',
        'stat-green':  '0 8px 24px rgba(16,185,129,0.20)',
        'stat-amber':  '0 8px 24px rgba(245,158,11,0.20)',
        'stat-blue':   '0 8px 24px rgba(59,130,246,0.20)',
      },
      backdropBlur: {
        xs: '4px',
      },
      borderRadius: {
        xl2: '16px',
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        'fade-in':  'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'float':    'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        float:   {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
      },
    },
  },
  plugins: [],
};
