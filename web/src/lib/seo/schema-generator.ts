/**
 * Schema.org Generator - Generate JSON-LD structured data
 *
 * Supported schema types:
 * - Product (with Offer, Review, AggregateRating)
 * - Organization
 * - WebPage
 * - Article
 * - FAQPage
 * - BreadcrumbList
 * - VideoObject
 */

export interface ProductSchemaData {
  name: string;
  description?: string;
  image?: string | string[];
  brand?: string;
  sku?: string;
  price?: number;
  currency?: string;
  availability?:
    | "InStock"
    | "OutOfStock"
    | "PreOrder"
    | "LimitedAvailability";
  condition?: "NewCondition" | "UsedCondition" | "RefurbishedCondition";
  reviews?: Array<{
    author: string;
    rating: number;
    reviewBody: string;
    datePublished?: string;
  }>;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
}

export interface OrganizationSchemaData {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  sameAs?: string[]; // Social media URLs
}

export interface ArticleSchemaData {
  headline: string;
  description?: string;
  image?: string | string[];
  author?: string;
  publisher?: {
    name: string;
    logo: string;
  };
  datePublished: string;
  dateModified?: string;
}

export interface FAQSchemaData {
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

export interface BreadcrumbSchemaData {
  items: Array<{
    name: string;
    url: string;
  }>;
}

/**
 * Generate Product schema with Offer and Reviews
 */
export function generateProductSchema(data: ProductSchemaData): object {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: data.name,
  };

  if (data.description) {
    schema.description = data.description;
  }

  if (data.image) {
    schema.image = Array.isArray(data.image) ? data.image : [data.image];
  }

  if (data.brand) {
    schema.brand = {
      "@type": "Brand",
      name: data.brand,
    };
  }

  if (data.sku) {
    schema.sku = data.sku;
  }

  // Add Offer
  if (data.price !== undefined) {
    schema.offers = {
      "@type": "Offer",
      price: data.price.toFixed(2),
      priceCurrency: data.currency || "USD",
      availability: `https://schema.org/${data.availability || "InStock"}`,
      itemCondition: `https://schema.org/${data.condition || "NewCondition"}`,
    };
  }

  // Add AggregateRating
  if (data.aggregateRating) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: data.aggregateRating.ratingValue,
      reviewCount: data.aggregateRating.reviewCount,
      bestRating: data.aggregateRating.bestRating || 5,
      worstRating: data.aggregateRating.worstRating || 1,
    };
  }

  // Add Reviews
  if (data.reviews && data.reviews.length > 0) {
    schema.review = data.reviews.map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.author,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: review.reviewBody,
      datePublished: review.datePublished || new Date().toISOString(),
    }));
  }

  return schema;
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema(
  data: OrganizationSchemaData
): object {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: data.name,
    url: data.url,
  };

  if (data.logo) {
    schema.logo = data.logo;
  }

  if (data.description) {
    schema.description = data.description;
  }

  if (data.email) {
    schema.email = data.email;
  }

  if (data.phone) {
    schema.telephone = data.phone;
  }

  if (data.address) {
    schema.address = {
      "@type": "PostalAddress",
      ...data.address,
    };
  }

  if (data.sameAs && data.sameAs.length > 0) {
    schema.sameAs = data.sameAs;
  }

  return schema;
}

/**
 * Generate Article schema
 */
export function generateArticleSchema(data: ArticleSchemaData): object {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.headline,
    datePublished: data.datePublished,
  };

  if (data.description) {
    schema.description = data.description;
  }

  if (data.image) {
    schema.image = Array.isArray(data.image) ? data.image : [data.image];
  }

  if (data.author) {
    schema.author = {
      "@type": "Person",
      name: data.author,
    };
  }

  if (data.publisher) {
    schema.publisher = {
      "@type": "Organization",
      name: data.publisher.name,
      logo: {
        "@type": "ImageObject",
        url: data.publisher.logo,
      },
    };
  }

  if (data.dateModified) {
    schema.dateModified = data.dateModified;
  }

  return schema;
}

/**
 * Generate FAQPage schema
 */
export function generateFAQSchema(data: FAQSchemaData): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(data: BreadcrumbSchemaData): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: data.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate WebPage schema
 */
export function generateWebPageSchema(data: {
  name: string;
  url: string;
  description?: string;
}): object {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: data.name,
    url: data.url,
  };

  if (data.description) {
    schema.description = data.description;
  }

  return schema;
}

/**
 * Validate schema.org JSON-LD
 */
export function validateSchema(schema: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!schema["@context"]) {
    errors.push("Missing @context field");
  } else if (schema["@context"] !== "https://schema.org") {
    errors.push(
      'Invalid @context (should be "https://schema.org")'
    );
  }

  if (!schema["@type"]) {
    errors.push("Missing @type field");
  }

  // Type-specific validations
  if (schema["@type"] === "Product") {
    if (!schema.name) {
      errors.push("Product schema requires name field");
    }

    if (schema.offers && !schema.offers.price) {
      errors.push("Offer requires price field");
    }
  }

  if (schema["@type"] === "Organization") {
    if (!schema.name) {
      errors.push("Organization schema requires name field");
    }
    if (!schema.url) {
      errors.push("Organization schema requires url field");
    }
  }

  if (schema["@type"] === "Article") {
    if (!schema.headline) {
      errors.push("Article schema requires headline field");
    }
    if (!schema.datePublished) {
      errors.push("Article schema requires datePublished field");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Convert schema to JSON-LD script tag
 */
export function schemaToScriptTag(schema: object): string {
  return `<script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
</script>`;
}

/**
 * Extract schema from HTML
 */
export function extractSchemaFromHTML(html: string): any[] {
  const schemas: any[] = [];
  const regex =
    /<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = regex.exec(html)) !== null) {
    try {
      const schema = JSON.parse(match[1]);
      schemas.push(schema);
    } catch (error) {
      console.error("Failed to parse schema:", error);
    }
  }

  return schemas;
}
