// tailwind.config.ts
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
        // Add custom colors if needed
      },
    },
  },
  safelist: [
    // Safelist dynamic color classes for editor themes
    // Green (Alex)
    'bg-green-50',
    'bg-green-100',
    'bg-green-600',
    'bg-green-700',
    'text-green-600',
    'text-green-700',
    'border-green-200',
    'border-green-300',
    'border-green-500',
    'ring-green-500',
    
    // Purple (Sam)
    'bg-purple-50',
    'bg-purple-100',
    'bg-purple-600',
    'bg-purple-700',
    'text-purple-600',
    'text-purple-700',
    'border-purple-200',
    'border-purple-300',
    'border-purple-500',
    'ring-purple-500',
    
    // Blue (Jordan)
    'bg-blue-50',
    'bg-blue-100',
    'bg-blue-600',
    'bg-blue-700',
    'text-blue-600',
    'text-blue-700',
    'border-blue-200',
    'border-blue-300',
    'border-blue-500',
    'ring-blue-500',
    
    // Teal (Taylor)
    'bg-teal-50',
    'bg-teal-100',
    'bg-teal-600',
    'bg-teal-700',
    'text-teal-600',
    'text-teal-700',
    'border-teal-200',
    'border-teal-300',
    'border-teal-500',
    'ring-teal-500',
    
    // Orange (Quinn)
    'bg-orange-50',
    'bg-orange-100',
    'bg-orange-600',
    'bg-orange-700',
    'text-orange-600',
    'text-orange-700',
    'border-orange-200',
    'border-orange-300',
    'border-orange-500',
    'ring-orange-500',
  ],
  plugins: [],
}

export default config