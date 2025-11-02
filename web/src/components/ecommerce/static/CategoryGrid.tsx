'use client';

/**
 * Category Grid Component
 * Displays top 6 product categories with stock images
 * Desktop: 6 columns | Tablet: 3 columns | Mobile: 1 column
 */

interface CategoryGridItem {
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
}

const TOP_CATEGORIES: CategoryGridItem[] = [
  {
    slug: 'shoes',
    name: 'Shoes',
    description: 'Footwear for every occasion',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fm=webp&fit=crop',
  },
  {
    slug: 'electronics',
    name: 'Electronics',
    description: 'Latest tech and gadgets',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fm=webp&fit=crop',
  },
  {
    slug: 'furniture',
    name: 'Furniture',
    description: 'Home and office furniture',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fm=webp&fit=crop',
  },
  {
    slug: 'clothing',
    name: 'Clothing',
    description: 'Fashion and apparel',
    imageUrl: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=300&fm=webp&fit=crop',
  },
  {
    slug: 'accessories',
    name: 'Accessories',
    description: 'Bags, hats, and more',
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=300&fm=webp&fit=crop',
  },
];

export function CategoryGrid() {
  return (
    <div className="w-full px-4 py-12">
      <div className="mx-auto max-w-full">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-foreground">
            Shop by Category
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Explore our curated selection of premium products
          </p>
        </div>

        {/* Grid: 5 columns on desktop, 3 on tablet, 1 on mobile */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {TOP_CATEGORIES.map((category) => (
            <a
              key={category.slug}
              href={`/products?category=${category.slug}`}
              className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:shadow-xl hover:scale-105"
            >
              {/* Background Image */}
              <div className="absolute inset-0 h-full w-full overflow-hidden">
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  width="400"
                  height="300"
                  onError={(e) => {
                    // Fallback to a solid color if image fails to load
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-70" />
              </div>

              {/* Content */}
              <div className="relative flex h-48 flex-col justify-end p-4">
                <h3 className="text-lg font-bold text-white transition-colors duration-300 line-clamp-1">
                  {category.name}
                </h3>
                <p className="mt-1 text-xs text-gray-200 line-clamp-2">
                  {category.description}
                </p>

                {/* CTA Button (appears on hover) */}
                <div className="mt-3 inline-flex items-center text-xs font-semibold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Shop Now
                  <svg
                    className="ml-1 h-3 w-3 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
