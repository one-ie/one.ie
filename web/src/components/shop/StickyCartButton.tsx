import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

interface StickyCartButtonProps {
  price: number;
  onAddToCart?: () => void;
}

export function StickyCartButton({ price, onAddToCart }: StickyCartButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button when hero CTA is out of viewport (scrolled past ~800px)
      const heroCtaThreshold = 800;
      setIsVisible(window.scrollY > heroCtaThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 p-4 shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
          <p className="text-2xl font-black">${price.toFixed(2)}</p>
        </div>
        <Button
          onClick={onAddToCart}
          size="lg"
          className="bg-black dark:bg-white text-white dark:text-black border-2 border-white dark:border-black flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <ShoppingCart className="w-5 h-5" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
