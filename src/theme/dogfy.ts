import { definePreset } from '@primevue/themes'
import Aura from '@primevue/themes/aura'

const DogfyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#fdf1ed',
      100: '#fad9ce',
      200: '#f5b9a6',
      300: '#f09980',
      400: '#f07d62',
      500: '#ef6948',
      600: '#d85a3a',
      700: '#c8452a',
      800: '#a33420',
      900: '#7a2618',
      950: '#541a10'
    },
    colorScheme: {
      light: {
        primary: {
          color:        '#ef6948',
          inverseColor: '#ffffff',
          hoverColor:   '#d85a3a',
          activeColor:  '#c8452a'
        },
        highlight: {
          background:      '#fdf1ed',
          focusBackground: '#ef6948',
          color:           '#1c1c1e',
          focusColor:      '#ffffff'
        },
        surface: {
          0:   '#ffffff',
          50:  '#f7f7f7',
          100: '#f2f2f2',
          200: '#e0e0e0',
          300: '#c2c2c2',
          400: '#a0a0a0',
          500: '#767676',
          600: '#5a5a5a',
          700: '#3d3d3d',
          800: '#2d2d2f',
          900: '#1c1c1e',
          950: '#111113'
        }
      }
    }
  },
  components: {
    card: {
      borderRadius: '10px',
      shadow: '0 1px 3px rgba(0,0,0,0.06)'
    },
    button: {
      borderRadius: '7px',
      colorScheme: {
        light: {
          root: {
            success: {
              background:             '#22c55e',
              hoverBackground:        '#16a34a',
              activeBackground:       '#15803d',
              borderColor:            '#22c55e',
              hoverBorderColor:       '#16a34a',
              activeBorderColor:      '#15803d',
              color:                  '#ffffff',
              hoverColor:             '#ffffff',
              activeColor:            '#ffffff',
            },
            danger: {
              background:             '#c8452a',
              hoverBackground:        '#a33420',
              activeBackground:       '#7a2618',
              borderColor:            '#c8452a',
              hoverBorderColor:       '#a33420',
              activeBorderColor:      '#7a2618',
              color:                  '#ffffff',
              hoverColor:             '#ffffff',
              activeColor:            '#ffffff',
            },
          }
        }
      }
    },
    inputtext: {
      borderRadius: '7px'
    },
    select: {
      borderRadius: '7px'
    },
    tag: {
      borderRadius: '5px',
      colorScheme: {
        light: {
          success: { background: '#dcfce7', color: '#15803d' },
          info:    { background: '#e8eef2', color: '#2d5c6e' },
          warn:    { background: '#f5eedf', color: '#7a5520' },
          danger:  { background: '#feeee9', color: '#c8452a' },
        }
      }
    }
  }
})

export default DogfyPreset
