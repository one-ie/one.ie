/**
 * Product Feed for OpenAI Agentic Commerce Protocol (ACP)
 *
 * Provides product catalog for ChatGPT "Buy in ChatGPT" functionality
 * Endpoint: /api/commerce/feed.json
 *
 * Uses existing product data from shop/product-chat.astro
 */

import type { APIRoute } from "astro";

// Product data structure (matches product-chat.astro)
interface Product {
  id: string;
  title: string;
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  price: number;
  originalPrice?: number;
  stock: number;
  description: string;
  images: string[];
  weight?: string;
}

// ACP Product Feed format
interface ACPProduct {
  // OpenAI flags
  enable_search: boolean;
  enable_checkout: boolean;

  // Basic info
  id: string;
  title: string;
  description: string;
  link: string;

  // Media
  image_link: string;
  additional_image_link?: string[];

  // Pricing
  price: string;
  sale_price?: string;

  // Availability
  availability: "in_stock" | "out_of_stock";
  inventory_quantity: number;

  // Category
  product_category: string;
  brand: string;

  // Merchant info
  seller_name: string;
  seller_url: string;
  seller_privacy_policy: string;
  seller_tos: string;

  // Returns
  return_policy: string;
  return_window: number;

  // Reviews
  product_review_count: number;
  product_review_rating: number;

  // Weight (required)
  weight: string;
}

interface ProductFeed {
  meta: {
    generated_at: string;
    total_products: number;
    format: string;
    version: string;
    merchant: {
      name: string;
      id: string;
      url: string;
    };
  };
  products: ACPProduct[];
}

// Product catalog (synced with product-chat.astro)
const products: Product[] = [
  {
    id: "chanel-coco-noir",
    title: "Chanel Coco Noir Eau de Parfum",
    category: "Fragrances",
    brand: "Chanel",
    rating: 4.26,
    reviewCount: 89,
    price: 129.99,
    originalPrice: 155.99,
    stock: 7,
    description:
      "Elegant and mysterious. Coco Noir captures the essence of timeless sophistication with notes of grapefruit, rose, and sandalwood. A fragrance for the modern woman who embraces mystery.",
    images: [
      "https://cdn.dummyjson.com/product-images/fragrances/chanel-coco-noir-eau-de/1.webp",
      "https://cdn.dummyjson.com/product-images/fragrances/chanel-coco-noir-eau-de/2.webp",
      "https://cdn.dummyjson.com/product-images/fragrances/chanel-coco-noir-eau-de/3.webp",
    ],
    weight: "100ml (3.4 fl oz)",
  },
];

function transformToACPFormat(product: Product, baseUrl: string): ACPProduct {
  return {
    // OpenAI flags
    enable_search: true,
    enable_checkout: true,

    // Basic info
    id: product.id,
    title: product.title,
    description: product.description,
    link: `${baseUrl}/shop/product-chat`,

    // Media
    image_link: product.images[0],
    additional_image_link: product.images.slice(1),

    // Pricing
    price: `${product.price.toFixed(2)} USD`,
    sale_price: product.originalPrice ? `${product.originalPrice.toFixed(2)} USD` : undefined,

    // Availability
    availability: product.stock > 0 ? "in_stock" : "out_of_stock",
    inventory_quantity: product.stock,

    // Category
    product_category: product.category,
    brand: product.brand,

    // Merchant info
    seller_name: "ONE Platform",
    seller_url: baseUrl,
    seller_privacy_policy: `${baseUrl}/privacy`,
    seller_tos: `${baseUrl}/terms`,

    // Returns
    return_policy: `${baseUrl}/returns`,
    return_window: 90, // 90-day returns

    // Reviews
    product_review_count: product.reviewCount,
    product_review_rating: product.rating,

    // Weight (required by ACP)
    weight: product.weight || "1lb",
  };
}

export const GET: APIRoute = async ({ request, site }) => {
  try {
    const baseUrl = site?.toString().replace(/\/$/, "") || "https://one.ie";

    const feed: ProductFeed = {
      meta: {
        generated_at: new Date().toISOString(),
        total_products: products.length,
        format: "json",
        version: "1.0.0",
        merchant: {
          name: "ONE Platform",
          id: "one_platform",
          url: baseUrl,
        },
      },
      products: products.map((p) => transformToACPFormat(p, baseUrl)),
    };

    return new Response(JSON.stringify(feed, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=900", // 15-minute cache
      },
    });
  } catch (error) {
    console.error("Product feed error:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to generate product feed",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
