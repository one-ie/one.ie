/**
 * Product Template Helpers
 * Generates dynamic content for any product type from DummyJSON
 */

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage?: number;
  rating: number;
  stock: number;
  brand?: string;
  category: string;
  thumbnail: string;
  images: string[];
}

/**
 * Calculate original price from discount
 */
export function getOriginalPrice(price: number, discountPercentage?: number): number | undefined {
  if (!discountPercentage || discountPercentage === 0) return undefined;
  return Number((price / (1 - discountPercentage / 100)).toFixed(2));
}

/**
 * Generate trust badges based on product category
 */
export function getTrustBadges(category: string): string[] {
  const categoryMap: Record<string, string[]> = {
    fragrances: ["Free Shipping", "90-Day Returns", "3-Year Warranty"],
    beauty: ["Free Shipping", "60-Day Returns", "Cruelty Free"],
    furniture: ["Free Shipping", "30-Day Returns", "5-Year Warranty"],
    groceries: ["Fresh Guarantee", "Same-Day Delivery", "Money Back"],
    smartphones: ["Free Shipping", "2-Year Warranty", "30-Day Returns"],
    laptops: ["Free Shipping", "3-Year Warranty", "Tech Support"],
    "mens-shirts": ["Free Shipping", "60-Day Returns", "Size Exchange"],
    "womens-dresses": ["Free Shipping", "60-Day Returns", "Size Exchange"],
    "mens-shoes": ["Free Shipping", "90-Day Returns", "Size Exchange"],
    "womens-shoes": ["Free Shipping", "90-Day Returns", "Size Exchange"],
  };

  return categoryMap[category] || ["Free Shipping", "30-Day Returns", "1-Year Warranty"];
}

/**
 * Generate features based on product category
 */
export function getProductFeatures(
  product: Product
): Array<{ title: string; description: string; image: string }> {
  const categoryFeatures: Record<string, Array<{ title: string; description: string }>> = {
    fragrances: [
      {
        title: "Iconic Bottle Design",
        description:
          "The sleek, minimalist bottle embodies pure sophistication. Every curve and edge is meticulously crafted. A statement piece for your vanity that exudes luxury and elegance.",
      },
      {
        title: "Long-Lasting Formula",
        description:
          "Experience a fragrance that evolves throughout the day. Premium Eau de Parfum concentration ensures 8-10 hours of rich, complex scent that lingers with intention and depth.",
      },
      {
        title: "Luxury Presentation",
        description:
          "Arrives in premium packaging with gift box included. Every detail speaks to craftsmanship and heritage. Perfect for gifting or adding to your personal collection.",
      },
    ],
    smartphones: [
      {
        title: "Cutting-Edge Performance",
        description:
          "Powered by the latest processor technology for seamless multitasking. Experience lightning-fast speeds and smooth performance for all your apps and games.",
      },
      {
        title: "Stunning Display",
        description:
          "Immerse yourself in vibrant colors and crystal-clear resolution. Advanced display technology brings your content to life with incredible detail and brightness.",
      },
      {
        title: "Professional Camera",
        description:
          "Capture stunning photos and videos in any lighting condition. Advanced camera system with multiple lenses for professional-quality results every time.",
      },
    ],
    default: [
      {
        title: "Premium Quality",
        description: `Crafted with attention to detail and premium materials. ${product.brand || "Our"} commitment to excellence is evident in every aspect of this product's design and construction.`,
      },
      {
        title: "Exceptional Value",
        description:
          "Get more for your money with features typically found in higher-priced alternatives. Quality and affordability combined in one outstanding product.",
      },
      {
        title: "Reliable Performance",
        description:
          "Built to last and perform consistently day after day. Backed by our warranty and commitment to customer satisfaction for complete peace of mind.",
      },
    ],
  };

  const features = categoryFeatures[product.category] || categoryFeatures.default;

  return features.map((feature, index) => ({
    ...feature,
    image: product.images[index % product.images.length] || product.thumbnail,
  }));
}

/**
 * Generate product specs based on category
 */
export function getProductSpecs(product: Product): Array<{ label: string; value: string }> {
  const specs: Array<{ label: string; value: string }> = [
    { label: "Brand", value: product.brand || "Premium" },
    {
      label: "Category",
      value: product.category.charAt(0).toUpperCase() + product.category.slice(1),
    },
    { label: "Stock Status", value: `${product.stock} units available` },
    { label: "SKU", value: `${product.category.toUpperCase()}-${product.id}` },
  ];

  // Add category-specific specs
  const categorySpecs: Record<string, Array<{ label: string; value: string }>> = {
    fragrances: [
      { label: "Fragrance Type", value: "Eau de Parfum" },
      { label: "Volume", value: "100ml / 3.4 fl oz" },
    ],
    smartphones: [
      { label: "Display", value: '6.1" Super Retina' },
      { label: "Storage", value: "128GB" },
    ],
    laptops: [
      { label: "Processor", value: "Intel Core i7" },
      { label: "RAM", value: "16GB" },
    ],
  };

  if (categorySpecs[product.category]) {
    specs.splice(2, 0, ...categorySpecs[product.category]);
  }

  return specs;
}

/**
 * Generate CTA text based on product category
 */
export function getCTAText(category: string): { title: string; subtitle: string } {
  const ctaMap: Record<string, { title: string; subtitle: string }> = {
    fragrances: {
      title: "Ready to embrace mystery?",
      subtitle: "Discover the allure of luxury fragrance. A scent for those who know their power.",
    },
    smartphones: {
      title: "Ready to upgrade?",
      subtitle: "Experience the future of mobile technology. Power and elegance in your pocket.",
    },
    "mens-shirts": {
      title: "Ready to elevate your style?",
      subtitle: "Step up your wardrobe with timeless elegance. Quality that makes a statement.",
    },
    "womens-dresses": {
      title: "Ready to turn heads?",
      subtitle: "Feel confident and beautiful. A dress that celebrates your unique style.",
    },
    default: {
      title: "Ready to own it?",
      subtitle: "Experience quality that exceeds expectations. Make it yours today.",
    },
  };

  return ctaMap[category] || ctaMap.default;
}

/**
 * Check if product has category-specific sections
 */
export function hasFragranceNotes(category: string): boolean {
  return category === "fragrances" || category === "beauty";
}

/**
 * Generate mock reviews based on product
 */
export function generateReviews(
  _product: Product
): Array<{ author: string; rating: number; text: string; date: string }> {
  const reviewTemplates = [
    "An absolute masterpiece. The craftsmanship is exceptional and the design is truly timeless. Worth every penny.",
    "Worth every penny. The quality is unmatched and it arrived beautifully packaged.",
    "Exceeded my expectations! Highly recommend to anyone looking for quality.",
    "Best purchase I've made this year. The attention to detail is impressive.",
    "Absolutely love it! Gets compliments everywhere. Highly recommend!",
  ];

  return reviewTemplates.slice(0, 3).map((text, index) => ({
    author: ["Sarah M.", "Michael R.", "Jennifer K."][index],
    rating: 5,
    text,
    date: ["January 2025", "December 2024", "December 2024"][index],
  }));
}
