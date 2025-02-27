import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          main: '#3f51b5',
          light: '#757de8',
          dark: '#002984',
        },
        secondary: {
          main: '#f50057',
          light: '#ff4081',
          dark: '#c51162',
        },
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
  important: '#__next',
}
export default config
