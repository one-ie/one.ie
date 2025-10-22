#!/usr/bin/env bun

/**
 * Landing Page Generator for Infer 1-10
 *
 * Reads brand data from .onboarding.json and generates:
 * 1. Landing page at /web/src/pages/index.astro
 * 2. Tailwind theme with brand colors
 * 3. Hero, Features, CTA, Footer components
 *
 * Usage:
 *   bun scripts/generate-landing-page.ts
 */

import fs from 'fs-extra';
import path from 'path';

interface OnboardingData {
  organizationName: string;
  tagline?: string;
  logoUrl?: string;
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    foreground?: string;
  };
  features?: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
  cta?: {
    title?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
  };
}

// Default values if .onboarding.json doesn't exist
const DEFAULT_DATA: OnboardingData = {
  organizationName: "ONE Platform",
  tagline: "Make Your Ideas Real",
  logoUrl: "/logo.svg",
  colors: {
    primary: "216 55% 25%",
    secondary: "219 14% 28%",
    accent: "105 22% 25%",
    background: "36 8% 88%",
    foreground: "0 0% 13%"
  },
  features: [
    {
      title: "AI-Native Architecture",
      description: "Built on a 6-dimension ontology that models reality through Groups, People, Things, Connections, Events, and Knowledge.",
      icon: "cpu"
    },
    {
      title: "Multi-Tenant by Design",
      description: "Hierarchical groups from friend circles to global governments. Complete data isolation with flexible access control.",
      icon: "users"
    },
    {
      title: "Real-Time Everything",
      description: "Powered by Convex for instant updates. Effect.ts for pure business logic. Type-safe from database to UI.",
      icon: "zap"
    }
  ],
  cta: {
    title: "Ready to Build?",
    description: "Start creating with the ONE Platform today.",
    buttonText: "Get Started",
    buttonLink: "/account/signup"
  }
};

async function loadOnboardingData(): Promise<OnboardingData> {
  const onboardingPath = path.resolve(process.cwd(), '.onboarding.json');

  if (await fs.pathExists(onboardingPath)) {
    console.log('✅ Found .onboarding.json');
    const data = await fs.readJson(onboardingPath);
    return { ...DEFAULT_DATA, ...data };
  }

  console.log('⚠️  No .onboarding.json found, using defaults');
  return DEFAULT_DATA;
}

function generateHeroComponent(data: OnboardingData): string {
  return `import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Logo */}
          <div className="w-32 h-32 md:w-40 md:h-40">
            <img
              src="${data.logoUrl}"
              alt="${data.organizationName}"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              ${data.organizationName}
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
            ${data.tagline}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button size="lg" className="text-lg px-8" asChild>
              <a href="${data.cta?.buttonLink || '/account/signup'}">
                ${data.cta?.buttonText || 'Get Started'}
              </a>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <a href="/docs">
                Learn More
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Gradient Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
    </section>
  );
}
`;
}

function generateFeaturesComponent(data: OnboardingData): string {
  const features = data.features || DEFAULT_DATA.features!;

  const featureCards = features.map(feature => `
          <div className="group relative overflow-hidden rounded-lg border bg-card p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  ${getIconPath(feature.icon || 'box')}
                </svg>
              </div>
              <h3 className="text-xl font-semibold">${feature.title}</h3>
              <p className="text-muted-foreground">${feature.description}</p>
            </div>
          </div>`).join('\n');

  return `export function Features() {
  return (
    <section className="py-20 md:py-32 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Why Choose ${data.organizationName}?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built for speed, scalability, and developer experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          ${featureCards}
        </div>
      </div>
    </section>
  );
}
`;
}

function getIconPath(icon: string): string {
  const icons: Record<string, string> = {
    cpu: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    box: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/>'
  };
  return icons[icon] || icons.box;
}

function generateCTAComponent(data: OnboardingData): string {
  return `import { Button } from '@/components/ui/button';

export function CTA() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-secondary to-accent p-12 md:p-20 text-center">
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground">
              ${data.cta?.title || 'Ready to Build?'}
            </h2>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              ${data.cta?.description || 'Start creating with the ONE Platform today.'}
            </p>
            <div className="pt-4">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8"
                asChild
              >
                <a href="${data.cta?.buttonLink || '/account/signup'}">
                  ${data.cta?.buttonText || 'Get Started'}
                </a>
              </Button>
            </div>
          </div>

          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      </div>
    </section>
  );
}
`;
}

function generateFooterComponent(data: OnboardingData): string {
  return `export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">${data.organizationName}</h3>
            <p className="text-sm text-muted-foreground">
              ${data.tagline}
            </p>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/features" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="/pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
              <li><a href="/docs" className="hover:text-foreground transition-colors">Documentation</a></li>
              <li><a href="/blog" className="hover:text-foreground transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="font-semibold">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/about" className="hover:text-foreground transition-colors">About</a></li>
              <li><a href="/contact" className="hover:text-foreground transition-colors">Contact</a></li>
              <li><a href="/careers" className="hover:text-foreground transition-colors">Careers</a></li>
              <li><a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/support" className="hover:text-foreground transition-colors">Support</a></li>
              <li><a href="/status" className="hover:text-foreground transition-colors">Status</a></li>
              <li><a href="https://github.com/one-ie" className="hover:text-foreground transition-colors">GitHub</a></li>
              <li><a href="/changelog" className="hover:text-foreground transition-colors">Changelog</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} ${data.organizationName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
`;
}

function generateIndexPage(data: OnboardingData): string {
  return `---
import Layout from '@/layouts/Layout.astro';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';
---

<Layout title="${data.organizationName} - ${data.tagline}">
  <Hero client:load />
  <Features />
  <CTA client:load />
  <Footer />
</Layout>
`;
}

function generateThemeCSS(data: OnboardingData): string {
  const colors = data.colors || DEFAULT_DATA.colors!;

  return `/* Landing page theme generated from .onboarding.json */

@theme {
  /* Brand colors from onboarding */
  --color-primary: ${colors.primary};
  --color-secondary: ${colors.secondary};
  --color-accent: ${colors.accent};
  --color-background: ${colors.background};
  --color-foreground: ${colors.foreground};

  /* Derived colors */
  --color-primary-foreground: 36 8% 96%;
  --color-secondary-foreground: 36 8% 96%;
  --color-accent-foreground: 36 8% 96%;

  /* Semantic colors */
  --color-card: 36 10% 74%;
  --color-card-foreground: 0 0% 13%;
  --color-muted: 219 14% 92%;
  --color-muted-foreground: 219 14% 30%;
  --color-border: 0 0% 100% / 0.1;
}

/* Dark mode overrides */
.dark {
  --color-background: 0 0% 13%;
  --color-foreground: 36 8% 96%;
  --color-card: 0 0% 10%;
  --color-card-foreground: 36 8% 96%;
  --color-muted: 216 63% 17%;
  --color-muted-foreground: 36 8% 80%;
}
`;
}

async function generateLandingPage() {
  console.log('\n🎨 Landing Page Generator - Infer 1-10\n');

  // Load onboarding data
  const data = await loadOnboardingData();
  console.log(`📋 Organization: ${data.organizationName}`);
  console.log(`📋 Tagline: ${data.tagline}`);

  // Create directories
  const webDir = path.resolve(process.cwd(), 'web');
  const componentsDir = path.join(webDir, 'src/components/landing');
  const pagesDir = path.join(webDir, 'src/pages');
  const stylesDir = path.join(webDir, 'src/styles');

  await fs.ensureDir(componentsDir);
  console.log('✅ Created components/landing directory');

  // Generate components
  await fs.writeFile(
    path.join(componentsDir, 'Hero.tsx'),
    generateHeroComponent(data)
  );
  console.log('✅ Generated Hero.tsx');

  await fs.writeFile(
    path.join(componentsDir, 'Features.tsx'),
    generateFeaturesComponent(data)
  );
  console.log('✅ Generated Features.tsx');

  await fs.writeFile(
    path.join(componentsDir, 'CTA.tsx'),
    generateCTAComponent(data)
  );
  console.log('✅ Generated CTA.tsx');

  await fs.writeFile(
    path.join(componentsDir, 'Footer.tsx'),
    generateFooterComponent(data)
  );
  console.log('✅ Generated Footer.tsx');

  // Generate index page
  await fs.writeFile(
    path.join(pagesDir, 'index.astro'),
    generateIndexPage(data)
  );
  console.log('✅ Generated index.astro');

  // Update theme CSS
  const themePath = path.join(stylesDir, 'landing-theme.css');
  await fs.writeFile(themePath, generateThemeCSS(data));
  console.log('✅ Generated landing-theme.css');

  console.log('\n✨ Landing page generated successfully!\n');
  console.log('📝 Next steps:');
  console.log('   1. Import landing-theme.css in your Layout.astro');
  console.log('   2. Add logo file to public/ directory');
  console.log('   3. Run: cd web && bun run dev');
  console.log('   4. Visit: http://localhost:4321\n');

  // Generate example .onboarding.json if it doesn't exist
  const onboardingPath = path.resolve(process.cwd(), '.onboarding.json');
  if (!await fs.pathExists(onboardingPath)) {
    await fs.writeJson(onboardingPath, DEFAULT_DATA, { spaces: 2 });
    console.log('📄 Created example .onboarding.json');
    console.log('   Customize this file with your brand data\n');
  }
}

// Run generator
generateLandingPage().catch(console.error);
