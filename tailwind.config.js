/** @type {import('tailwindcss').Config} */
// Tailwind estaba instalado y enchufado en postcss, pero SIN config ni
// directivas -> no generaba nada -> las páginas de /alquiler-barco y
// /en/boat-rental (escritas con clases Tailwind) salían sin maquetar.
//
// IMPORTANTE: preflight DESACTIVADO. El sitio tiene su propio reset y design
// system (variables CSS inlineadas en layout.tsx). El preflight de Tailwind
// reescribiría márgenes, tipografías y headings de TODO el sitio y rompería
// el resto de páginas. Con preflight off, Tailwind solo emite las "utilities",
// que afectan únicamente a los elementos que usan esas clases (las de barcos).
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
}
