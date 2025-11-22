/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: ["class"],
	theme: {
		extend: {
			/* ========================================
			   6-TOKEN DESIGN SYSTEM
			   Reference: /web/src/styles/global.css
			   ======================================== */
			colors: {
				/* Core 6 Tokens (from global.css @theme) */
				background: 'hsl(var(--color-background))',      // Adaptive: changes in dark mode
				foreground: 'hsl(var(--color-foreground))',      // Adaptive: changes in dark mode
				font: 'hsl(var(--color-font))',                  // Adaptive: changes in dark mode
				primary: {
					DEFAULT: 'hsl(var(--color-primary))',          // Constant: same in dark mode
					light: 'hsl(var(--color-primary-light))',
					dark: 'hsl(var(--color-primary-dark))',
					foreground: 'hsl(var(--color-primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--color-secondary))',        // Constant: same in dark mode
					light: 'hsl(var(--color-secondary-light))',
					dark: 'hsl(var(--color-secondary-dark))',
					foreground: 'hsl(var(--color-secondary-foreground))'
				},
				tertiary: {
					DEFAULT: 'hsl(var(--color-tertiary))',         // Constant: same in dark mode
					light: 'hsl(var(--color-tertiary-light))',
					dark: 'hsl(var(--color-tertiary-dark))',
					foreground: 'hsl(var(--color-tertiary-foreground))'
				},

				/* Utility Tokens (backwards compatibility) */
				destructive: {
					DEFAULT: 'hsl(var(--color-destructive))',
					foreground: 'hsl(var(--color-destructive-foreground))'
				},
				border: 'hsl(var(--color-border))',
				input: 'hsl(var(--color-input))',
				ring: 'hsl(var(--color-ring))',
				overlay: 'hsl(var(--color-overlay))',

				/* Chart Colors (use 6-token palette) */
				chart: {
					1: 'hsl(var(--color-chart-1))',  // Primary
					2: 'hsl(var(--color-chart-2))',  // Tertiary
					3: 'hsl(var(--color-chart-3))',  // Secondary
					4: 'hsl(var(--color-chart-4))',  // Neutral
					5: 'hsl(var(--color-chart-5))'   // Font
				},

				/* Special Colors */
				gold: {
					DEFAULT: 'hsl(var(--color-gold))',
					foreground: 'hsl(var(--color-gold-foreground))'
				},

				/* Sidebar (uses background/foreground pattern) */
				sidebar: {
					DEFAULT: 'hsl(var(--color-sidebar-background))',
					foreground: 'hsl(var(--color-sidebar-foreground))',
					primary: 'hsl(var(--color-sidebar-primary))',
					'primary-foreground': 'hsl(var(--color-sidebar-primary-foreground))',
					accent: 'hsl(var(--color-sidebar-accent))',
					'accent-foreground': 'hsl(var(--color-sidebar-accent-foreground))',
					border: 'hsl(var(--color-sidebar-border))',
					ring: 'hsl(var(--color-sidebar-ring))'
				}
			},

			/* ========================================
			   BORDER RADIUS (4 Properties)
			   Modern scale optimized for 2025
			   ======================================== */
			borderRadius: {
				xs: 'var(--radius-xs)',      // 4px - Badges, chips
				sm: 'var(--radius-sm)',      // 6px - Input fields, small buttons
				md: 'var(--radius-md)',      // 8px - Cards, buttons (OPTIMAL)
				lg: 'var(--radius-lg)',      // 12px - Modals, hero cards
				xl: 'var(--radius-xl)',      // 16px - Large hero surfaces
				full: 'var(--radius-full)'   // 9999px - Circular
			},

			/* ========================================
			   TYPOGRAPHY SCALE
			   Harmonious type system
			   ======================================== */
			fontSize: {
				xs: ['0.75rem', { lineHeight: '1rem' }],        // 12px
				sm: ['0.875rem', { lineHeight: '1.25rem' }],    // 14px
				base: ['1rem', { lineHeight: '1.5rem' }],       // 16px (default)
				lg: ['1.125rem', { lineHeight: '1.75rem' }],    // 18px
				xl: ['1.25rem', { lineHeight: '1.75rem' }],     // 20px
				'2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
				'3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
				'4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
				'5xl': ['3rem', { lineHeight: '1' }],           // 48px
				'6xl': ['3.75rem', { lineHeight: '1' }],        // 60px
				'7xl': ['4.5rem', { lineHeight: '1' }],         // 72px
				'8xl': ['6rem', { lineHeight: '1' }],           // 96px
				'9xl': ['8rem', { lineHeight: '1' }]            // 128px
			},

			/* ========================================
			   SPACING SCALE
			   Consistent spacing throughout
			   ======================================== */
			spacing: {
				0: '0px',
				px: '1px',
				0.5: '0.125rem',   // 2px
				1: '0.25rem',      // 4px
				1.5: '0.375rem',   // 6px
				2: '0.5rem',       // 8px
				2.5: '0.625rem',   // 10px
				3: '0.75rem',      // 12px
				3.5: '0.875rem',   // 14px
				4: '1rem',         // 16px (base)
				5: '1.25rem',      // 20px
				6: '1.5rem',       // 24px
				7: '1.75rem',      // 28px
				8: '2rem',         // 32px
				9: '2.25rem',      // 36px
				10: '2.5rem',      // 40px
				11: '2.75rem',     // 44px
				12: '3rem',        // 48px
				14: '3.5rem',      // 56px
				16: '4rem',        // 64px
				20: '5rem',        // 80px
				24: '6rem',        // 96px
				28: '7rem',        // 112px
				32: '8rem',        // 128px
				36: '9rem',        // 144px
				40: '10rem',       // 160px
				44: '11rem',       // 176px
				48: '12rem',       // 192px
				52: '13rem',       // 208px
				56: '14rem',       // 224px
				60: '15rem',       // 240px
				64: '16rem',       // 256px
				72: '18rem',       // 288px
				80: '20rem',       // 320px
				96: '24rem'        // 384px
			},

			/* ========================================
			   ANIMATION & MOTION (4 Properties)
			   Timing from global.css
			   ======================================== */
			transitionDuration: {
				fast: 'var(--duration-fast)',       // 150ms - Quick interactions
				normal: 'var(--duration-normal)',   // 300ms - Standard (default)
				slow: 'var(--duration-slow)'        // 500ms - Emphasized
			},
			transitionTimingFunction: {
				elegant: 'var(--ease-elegant)'      // cubic-bezier(0.4, 0.0, 0.2, 1)
			},

			/* ========================================
			   ELEVATION (Box Shadows)
			   Consistent shadow scale
			   ======================================== */
			boxShadow: {
				sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',                                      // Cards
				DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', // Default
				md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',   // Dropdowns
				lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', // Buttons
				xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // Hover states
				'2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',                             // Modals
				inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
				none: 'none'
			},

			/* ========================================
			   CONTAINER CONFIGURATION
			   Max widths for responsive layouts
			   ======================================== */
			container: {
				center: true,
				padding: {
					DEFAULT: '1rem',
					sm: '2rem',
					lg: '4rem',
					xl: '5rem',
					'2xl': '6rem'
				},
				screens: {
					'2xl': '1400px'
				}
			},

			/* ========================================
			   KEYFRAMES (Custom Animations)
			   Defined in global.css, referenced here
			   ======================================== */
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				orbit: {
					from: {
						transform: 'rotate(calc(var(--start-angle) * 1deg)) translateY(calc(var(--radius) * 1px)) rotate(calc(var(--start-angle) * -1deg))'
					},
					to: {
						transform: 'rotate(calc(360deg + (var(--start-angle) * 1deg))) translateY(calc(var(--radius) * 1px)) rotate(calc(-360deg + (var(--start-angle) * -1deg)))'
					}
				},
				fadeIn: {
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
				fadeInUp: {
					from: { opacity: '0', transform: 'translateY(30px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				float: {
					'0%, 100%': { transform: 'translateY(0) scale(1)' },
					'50%': { transform: 'translateY(-20px) scale(1.05)' }
				},
				gradient: {
					'0%, 100%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' }
				},
				shimmer: {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'pulse-slow': {
					'0%, 100%': { opacity: '1', transform: 'scale(1)' },
					'50%': { opacity: '0.95', transform: 'scale(1.02)' }
				},
				'slide-in': {
					'0%': { opacity: '0', transform: 'translateX(20px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'bounce-in': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'60%': { opacity: '1', transform: 'translateY(-5px)' },
					'100%': { transform: 'translateY(0)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				orbit: 'orbit calc(var(--duration) * 1s) linear infinite',
				fadeIn: 'fadeIn 0.5s ease-in',
				fadeInUp: 'fadeInUp 0.5s ease-out',
				float: 'float 3s ease-in-out infinite',
				gradient: 'gradient 8s ease infinite',
				shimmer: 'shimmer 3s ease-in-out infinite',
				'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
				'slide-in': 'slide-in 0.5s ease-out',
				'scale-in': 'scale-in 0.5s ease-out',
				'bounce-in': 'bounce-in 0.6s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
}
