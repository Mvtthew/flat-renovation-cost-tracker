import { createSystem, defaultConfig, defineConfig, defineSlotRecipe } from '@chakra-ui/react'

const config = defineConfig({
  globalCss: {
    '*::placeholder, *[data-placeholder]': {
      color: 'rgba(93, 49, 64, 0.5)',
    },
  },
  theme: {
    tokens: {
      fonts: {
        body: { value: "'Rokkitt', serif" },
        heading: { value: "'Rokkitt', serif" },
      },
      colors: {
        primary: {
          50: { value: '#f7eef1' },
          100: { value: '#ecd3db' },
          200: { value: '#d9a7b7' },
          300: { value: '#c57b93' },
          400: { value: '#a34f6a' },
          500: { value: '#5D3140' },
          600: { value: '#4a2733' },
          700: { value: '#381d26' },
          800: { value: '#25131a' },
          900: { value: '#130a0d' },
          950: { value: '#0a0507' },
        },
      },
    },
    semanticTokens: {
      colors: {
        fg: {
          DEFAULT: { value: '{colors.primary.500}' },
          muted: { value: 'rgba(93, 49, 64, 0.6)' },
        },
        bg: {
          DEFAULT: { value: '#F6D8BD' },
          panel: { value: '#F6D8BD' },
          subtle: { value: '#F6D8BD' },
        },
        border: {
          DEFAULT: { value: '{colors.primary.500}' },
          subtle: { value: '{colors.primary.200}' },
          muted: { value: '{colors.primary.300}' },
          emphasized: { value: '{colors.primary.600}' },
        },
        primary: {
          solid: { value: '{colors.primary.500}' },
          contrast: { value: 'white' },
          fg: { value: '{colors.primary.600}' },
          muted: { value: '{colors.primary.100}' },
          subtle: { value: '{colors.primary.50}' },
          emphasized: { value: '{colors.primary.200}' },
          focusRing: { value: '{colors.primary.500}' },
        },
      },
    },
    recipes: {
      separator: {
        defaultVariants: {
          size: 'lg',
        },
      },
      input: {
        base: {
          _placeholder: {
            color: 'rgba(93, 49, 64, 0.5)',
          },
        },
        variants: {
          variant: {
            outline: {
              borderWidth: '2px',
            },
          },
        },
      },
      textarea: {
        base: {
          _placeholder: {
            color: 'rgba(93, 49, 64, 0.5)',
          },
        },
      },
    },
    slotRecipes: {
      numberInput: defineSlotRecipe({
        slots: ['root', 'input', 'control', 'incrementTrigger', 'decrementTrigger', 'valueText', 'label', 'scrubber'],
        base: {
          input: {
            _placeholder: {
              color: 'rgba(93, 49, 64, 0.5)',
            },
          },
        },
        variants: {
          variant: {
            outline: {
              input: {
                borderWidth: '2px',
              },
            },
          },
        },
      }),
      segmentGroup: defineSlotRecipe({
        slots: ['root', 'label', 'item', 'itemText', 'itemControl', 'indicator'],
        base: {
          root: {
            bg: 'transparent',
            borderWidth: '2px',
            borderColor: 'border',
            p: '1',
            gap: '1',
          },
          item: {
            borderRadius: 'md',
            fontWeight: 'medium',
            px: '4',
            _before: {
              display: 'none',
            },
          },
          itemText: {
            transition: 'color 0.2s',
            '[data-state=checked] &': {
              color: 'primary.contrast',
            },
          },
          indicator: {
            bg: 'primary.solid',
            boxShadow: 'none',
          },
        },
      }),
    },
  },
})

export const system = createSystem(defaultConfig, config)
