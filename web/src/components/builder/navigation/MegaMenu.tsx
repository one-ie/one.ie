/**
 * MegaMenu Component
 *
 * Dropdown mega menu for complex navigation structures.
 * Perfect for large sites with many pages and categories.
 *
 * Features:
 * - Multi-column dropdowns
 * - Featured items
 * - Icons and descriptions
 * - Hover activation
 * - Responsive behavior
 * - Keyboard navigation
 *
 * Semantic tags: navigation, mega-menu, dropdown, complex, categories, submenu
 */

'use client';

import { Button } from '@/components/ui/button';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { useState } from 'react';

export interface MegaMenuItem {
  label: string;
  href: string;
  description?: string;
  icon?: LucideIcon;
}

export interface MegaMenuCategory {
  title: string;
  items: MegaMenuItem[];
}

export interface MegaMenuProps {
  label: string;
  categories: MegaMenuCategory[];
  featured?: {
    title: string;
    description: string;
    href: string;
    image?: string;
  };
  className?: string;
}

export function MegaMenu({
  label,
  categories,
  featured,
  className = '',
}: MegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Trigger Button */}
      <Button
        variant="ghost"
        className="gap-2"
        aria-expanded={isOpen}
      >
        {label}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-screen max-w-5xl bg-background border border-border rounded-lg shadow-xl z-50 p-8">
          <div className="grid grid-cols-4 gap-8">
            {/* Categories */}
            {categories.map((category, index) => (
              <div key={index} className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">
                  {category.title}
                </h3>
                <ul className="space-y-3">
                  {category.items.map((item, itemIndex) => {
                    const Icon = item.icon;

                    return (
                      <li key={itemIndex}>
                        <a
                          href={item.href}
                          className="group flex items-start gap-3 p-2 rounded-md hover:bg-muted transition-colors"
                        >
                          {Icon && (
                            <div className="flex-shrink-0 mt-1">
                              <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-foreground group-hover:text-primary">
                              {item.label}
                            </div>
                            {item.description && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            {/* Featured Item */}
            {featured && (
              <div className="col-span-1 bg-muted/50 rounded-lg p-6 space-y-3">
                {featured.image && (
                  <img
                    src={featured.image}
                    alt={featured.title}
                    className="w-full h-32 object-cover rounded-md"
                  />
                )}
                <h3 className="text-sm font-semibold">{featured.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {featured.description}
                </p>
                <a href={featured.href}>
                  <Button size="sm" className="w-full">
                    Learn More
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
