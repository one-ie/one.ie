/**
 * Footer Component
 *
 * Multi-column footer with links, social icons, and branding.
 * Perfect for site-wide footer navigation and information.
 *
 * Features:
 * - Multi-column layout
 * - Link groups/categories
 * - Social media icons
 * - Copyright notice
 * - Logo and description
 * - Newsletter signup (optional)
 * - Responsive design
 *
 * Semantic tags: footer, navigation, links, social, copyright, sitemap
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LucideIcon } from 'lucide-react';

export interface FooterLinkGroup {
  title: string;
  links: Array<{
    label: string;
    href: string;
  }>;
}

export interface SocialLink {
  icon: LucideIcon;
  href: string;
  label: string;
}

export interface FooterProps {
  logo?: {
    src?: string;
    text: string;
    href?: string;
  };
  description?: string;
  linkGroups: FooterLinkGroup[];
  socialLinks?: SocialLink[];
  copyright?: string;
  showNewsletter?: boolean;
  className?: string;
}

export function Footer({
  logo,
  description,
  linkGroups,
  socialLinks = [],
  copyright,
  showNewsletter = false,
  className = '',
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`border-t border-border/40 bg-background ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            {logo && (
              <a href={logo.href || '/'} className="flex items-center gap-3">
                {logo.src && (
                  <img src={logo.src} alt={logo.text} className="h-8 w-auto" />
                )}
                <span className="text-xl font-bold">{logo.text}</span>
              </a>
            )}

            {description && (
              <p className="text-sm text-muted-foreground max-w-md">
                {description}
              </p>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex gap-3">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      aria-label={social.label}
                      className="flex items-center justify-center h-10 w-10 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            )}

            {/* Newsletter */}
            {showNewsletter && (
              <div className="space-y-2 pt-2">
                <h3 className="text-sm font-semibold">Subscribe to our newsletter</h3>
                <form className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="h-10"
                  />
                  <Button type="submit" size="sm">
                    Subscribe
                  </Button>
                </form>
              </div>
            )}
          </div>

          {/* Link Groups */}
          {linkGroups.map((group, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-sm font-semibold">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-border/40">
          <p className="text-sm text-muted-foreground text-center">
            {copyright || `© ${currentYear} All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
}
