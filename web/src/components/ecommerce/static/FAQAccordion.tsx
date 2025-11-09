/**
 * FAQ Accordion Component (Static)
 * Collapsible Q&A sections with search/filter
 * Uses shadcn/ui Accordion component
 */

'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

interface FAQAccordionProps {
  faqs: FAQItem[];
  searchable?: boolean;
  title?: string;
  description?: string;
}

function FAQAccordion({
  faqs,
  searchable = true,
  title = 'Frequently Asked Questions',
  description = 'Find answers to common questions about our products and services',
}: FAQAccordionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Extract unique categories
  const categories = Array.from(
    new Set(faqs.map((faq) => faq.category).filter(Boolean))
  );

  // Filter FAQs based on search and category
  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      !searchQuery ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !selectedCategory || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center border-b border-black dark:border-white pb-8">
        <p className="text-xs font-bold tracking-[0.3em] uppercase mb-4">Support</p>
        <h2 className="text-4xl md:text-5xl font-light tracking-tight">{title}</h2>
        {description && (
          <p className="mt-4 text-base leading-relaxed max-w-2xl mx-auto">{description}</p>
        )}
      </div>

      {/* Search and filter */}
      {searchable && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="SEARCH QUESTIONS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-2 border-black dark:border-white bg-transparent py-4 px-6 text-sm font-bold tracking-[0.2em] uppercase placeholder:text-black/50 dark:placeholder:text-white/50 focus:outline-none"
            />
          </div>

          {/* Category filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`border-2 px-6 py-3 text-xs font-bold tracking-[0.2em] uppercase transition-all ${
                  selectedCategory === null
                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                    : 'bg-transparent border-black dark:border-white hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category!)}
                  className={`border-2 px-6 py-3 text-xs font-bold tracking-[0.2em] uppercase transition-all ${
                    selectedCategory === category
                      ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                      : 'bg-transparent border-black dark:border-white hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FAQs */}
      {filteredFaqs.length === 0 ? (
        <div className="py-20 text-center border border-black dark:border-white">
          <p className="text-sm tracking-wide">No questions found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFaqs.map((faq) => (
            <Accordion key={faq.id} type="single" collapsible className="border border-black dark:border-white">
              <AccordionItem value={faq.id} className="border-none">
                <AccordionTrigger className="text-left px-6 py-5 hover:no-underline hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <span className="text-base font-medium tracking-wide">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 border-t border-black dark:border-white">
                  <div className="pt-4 text-base leading-relaxed">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>
      )}

      {/* Still have questions CTA */}
      <div className="border-t-4 border-black dark:border-white pt-12 text-center">
        <h3 className="text-2xl font-light tracking-tight mb-4">
          Still have questions?
        </h3>
        <p className="text-base leading-relaxed mb-8 max-w-xl mx-auto">
          Can't find the answer you're looking for? Our customer support team is here to help.
        </p>
        <button className="bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white px-12 py-4 text-xs font-bold tracking-[0.3em] uppercase hover:opacity-80 transition-opacity">
          Contact Support
        </button>
      </div>
    </div>
  );
}

/**
 * Default ecommerce FAQs
 * Common questions for product pages and checkout
 */
export const defaultEcommerceFAQs: FAQItem[] = [
  {
    id: 'shipping-time',
    question: 'How long does shipping take?',
    answer:
      'Standard shipping typically takes 5-7 business days. Express shipping is available for 2-3 business day delivery. You will receive a tracking number once your order ships.',
    category: 'Shipping',
  },
  {
    id: 'shipping-cost',
    question: 'Do you offer free shipping?',
    answer:
      'Yes! We offer free standard shipping on all orders over $50 within the continental US. Orders under $50 have a flat shipping rate of $5.99.',
    category: 'Shipping',
  },
  {
    id: 'international-shipping',
    question: 'Do you ship internationally?',
    answer:
      'Currently, we only ship within the United States and Canada. International shipping to other countries will be available soon.',
    category: 'Shipping',
  },
  {
    id: 'return-policy',
    question: 'What is your return policy?',
    answer:
      'We offer a 30-day money-back guarantee. If you\'re not completely satisfied with your purchase, you can return it for a full refund within 30 days of delivery. Items must be unused and in original packaging.',
    category: 'Returns',
  },
  {
    id: 'return-shipping',
    question: 'Who pays for return shipping?',
    answer:
      'We provide free return shipping for defective or incorrect items. For other returns, customers are responsible for return shipping costs. We recommend using a trackable shipping service.',
    category: 'Returns',
  },
  {
    id: 'exchange',
    question: 'Can I exchange an item?',
    answer:
      'Yes! If you need a different size or color, we offer free exchanges within 30 days. Contact our customer service team to initiate an exchange.',
    category: 'Returns',
  },
  {
    id: 'payment-methods',
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, Apple Pay, Google Pay, and Shop Pay. All payments are securely processed.',
    category: 'Payment',
  },
  {
    id: 'secure-checkout',
    question: 'Is checkout secure?',
    answer:
      'Absolutely. We use industry-standard SSL encryption to protect your payment information. We never store your full credit card details on our servers.',
    category: 'Payment',
  },
  {
    id: 'order-tracking',
    question: 'How can I track my order?',
    answer:
      'Once your order ships, you\'ll receive an email with a tracking number. You can also track your order by logging into your account and viewing your order history.',
    category: 'Orders',
  },
  {
    id: 'cancel-order',
    question: 'Can I cancel or modify my order?',
    answer:
      'Orders can be cancelled or modified within 1 hour of placement. After that, your order is processed for shipping. Please contact us immediately if you need to make changes.',
    category: 'Orders',
  },
  {
    id: 'warranty',
    question: 'Do products come with a warranty?',
    answer:
      'Yes, all our products come with a 1-year manufacturer\'s warranty against defects. Extended warranty options are available at checkout.',
    category: 'Product Info',
  },
  {
    id: 'size-guide',
    question: 'How do I find the right size?',
    answer:
      'Each product page has a detailed size guide with measurements. If you\'re between sizes, we recommend sizing up. Feel free to contact us if you need help choosing the right size.',
    category: 'Product Info',
  },
];

/**
 * Product-specific FAQ component
 * Shows FAQs relevant to a specific product
 */
interface ProductFAQProps {
  productType?: string;
  customFaqs?: FAQItem[];
}

function ProductFAQ({ productType, customFaqs }: ProductFAQProps) {
  // Filter default FAQs or use custom FAQs
  const faqs = customFaqs || defaultEcommerceFAQs;

  return (
    <FAQAccordion faqs={faqs} searchable={faqs.length > 5} />
  );
}

// Export both default and named for compatibility
export default FAQAccordion;
export { FAQAccordion, ProductFAQ };
