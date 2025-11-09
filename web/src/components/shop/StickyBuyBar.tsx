import { useState, useEffect } from 'react';

interface StickyBuyBarProps {
  productName: string;
  price: number;
  originalPrice?: number;
}

export function StickyBuyBar({ productName, price, originalPrice }: StickyBuyBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const maxQuantity = 10;

  useEffect(() => {
    const handleScroll = () => {
      const heroBuyButton = document.getElementById('hero-buy-button');
      const footer = document.querySelector('footer');

      if (!heroBuyButton || !footer) return;

      const buttonRect = heroBuyButton.getBoundingClientRect();
      const footerTop = footer.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;

      // Show when hero buy button scrolls out of view, hide when footer is visible
      const shouldShow = buttonRect.bottom < 0 && footerTop > windowHeight - 100;
      setIsVisible(shouldShow);
    };

    window.addEventListener('scroll', handleScroll);
    // Use timeout to ensure DOM is ready
    setTimeout(handleScroll, 100);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBuyNow = () => {
    // Store quantity for modal
    (window as any).orderQuantity = quantity;
    window.dispatchEvent(new Event('openBuyDialog'));
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="hidden md:block fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-black border-t-2 border-black dark:border-white shadow-lg animate-in slide-in-from-bottom duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between gap-3 md:gap-6">
          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium tracking-wide truncate">{productName}</h3>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-xl font-light tabular-nums">${price.toFixed(2)}</span>
              {originalPrice && (
                <span className="text-xs line-through tabular-nums opacity-60">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center border-2 border-black dark:border-white">
            <button
              onClick={decreaseQuantity}
              className="px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-r-2 border-black dark:border-white"
              aria-label="Decrease quantity"
            >
              <span className="text-lg font-light">−</span>
            </button>
            <div className="px-5 py-3 min-w-[50px] text-center">
              <span className="text-sm font-medium tabular-nums">{quantity}</span>
            </div>
            <button
              onClick={increaseQuantity}
              className="px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-l-2 border-black dark:border-white"
              aria-label="Increase quantity"
            >
              <span className="text-lg font-light">+</span>
            </button>
          </div>

          {/* Buy Now Button */}
          <button
            onClick={handleBuyNow}
            className="bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white px-8 py-3 hover:opacity-80 transition-opacity"
          >
            <span className="text-xs font-bold tracking-[0.3em] uppercase whitespace-nowrap">
              Buy Now
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
