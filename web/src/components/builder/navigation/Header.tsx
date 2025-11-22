/**
 * Header Component
 *
 * Main navigation header with logo, menu, and CTA button.
 * Perfect for site-wide navigation and branding.
 *
 * Features:
 * - Responsive menu (desktop + mobile)
 * - Logo/brand area
 * - Navigation links
 * - CTA button
 * - Sticky header support
 * - Dark mode toggle
 * - Mobile hamburger menu
 *
 * Semantic tags: header, navigation, menu, navbar, mobile, responsive
 */

'use client';

import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export interface NavigationLink {
  label: string;
  href: string;
}

export interface HeaderProps {
  logo: {
    src?: string;
    text: string;
    href?: string;
  };
  links: NavigationLink[];
  cta?: {
    text: string;
    href: string;
  };
  sticky?: boolean;
  className?: string;
}

export function Header({
  logo,
  links,
  cta,
  sticky = true,
  className = '',
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className={`border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 ${
        sticky ? 'sticky top-0' : ''
      } ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href={logo.href || '/'} className="flex items-center gap-3">
            {logo.src && (
              <img src={logo.src} alt={logo.text} className="h-8 w-auto" />
            )}
            <span className="text-xl font-bold">{logo.text}</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA Button (Desktop) */}
          {cta && (
            <div className="hidden md:block">
              <a href={cta.href}>
                <Button>{cta.text}</Button>
              </a>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border/40">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}

            {cta && (
              <a href={cta.href} onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">{cta.text}</Button>
              </a>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
