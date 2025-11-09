import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MessageCircle } from 'lucide-react';
import { TopBar } from './TopBar';

interface ProductHeaderProps {
  productName?: string;
  onBuyNowClick?: () => void;
}

export function ProductHeader({ productName = "Chanel Coco Noir", onBuyNowClick }: ProductHeaderProps) {
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const productPrice = 129.99; // This should come from props in a real implementation

  const handleBuyNow = () => {
    // Get quantity from window if set by other buttons
    const orderQuantity = (window as any).orderQuantity || 1;
    setQuantity(orderQuantity);
    setBuyDialogOpen(true);
    onBuyNowClick?.();
  };

  // Listen for custom event from other buy buttons
  useEffect(() => {
    const handleBuyNowEvent = () => {
      handleBuyNow();
    };

    window.addEventListener('openBuyDialog', handleBuyNowEvent);
    return () => window.removeEventListener('openBuyDialog', handleBuyNowEvent);
  }, []);

  const subtotal = productPrice * quantity;
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Animated Top Bar */}
      <TopBar />

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-black border-b border-black dark:border-white dark:border-b-2">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-base md:text-xl font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase">
                YOUR LOGO
              </div>
            </div>

            {/* Navigation Links (Center) */}
            <nav className="hidden md:flex items-center gap-12 text-xs font-bold tracking-[0.2em] uppercase">
              <button
                onClick={() => scrollToSection('features')}
                className="hover:opacity-50 transition-opacity duration-200"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('details')}
                className="hover:opacity-50 transition-opacity duration-200"
              >
                Details
              </button>
              <button
                onClick={() => scrollToSection('reviews')}
                className="hover:opacity-50 transition-opacity duration-200"
              >
                Reviews
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="hover:opacity-50 transition-opacity duration-200"
              >
                FAQ
              </button>
            </nav>

            {/* Buy Now Button */}
            <button
              onClick={handleBuyNow}
              className="bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white px-4 md:px-8 py-2 md:py-3 hover:opacity-80 transition-opacity duration-200"
            >
              <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase">
                Buy Now
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Buy Now Dialog */}
      <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
        <DialogContent className="sm:max-w-md border-2 border-black dark:border-white bg-white dark:bg-black">
          <DialogHeader className="border-b border-black dark:border-white pb-6">
            <p className="text-xs font-bold tracking-[0.3em] uppercase mb-2">Order Summary</p>
            <DialogTitle className="text-3xl font-light tracking-tight">Complete Your Purchase</DialogTitle>
            <DialogDescription className="text-base leading-relaxed pt-2">
              Contact us to complete your order
            </DialogDescription>
          </DialogHeader>

          {/* Order Details */}
          <div className="border-b border-black dark:border-white pb-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm tracking-wide">{productName}</span>
                <span className="text-sm font-medium tabular-nums">×{quantity}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-black/20 dark:border-white/20">
                <span className="text-xs tracking-[0.2em] uppercase opacity-60">Subtotal</span>
                <span className="text-base font-medium tabular-nums">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs tracking-[0.2em] uppercase opacity-60">Shipping</span>
                <span className="text-sm font-bold tracking-wide">FREE</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t-2 border-black dark:border-white">
                <span className="text-sm font-bold tracking-[0.2em] uppercase">Total</span>
                <span className="text-2xl font-light tabular-nums">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6">
            <p className="text-xs font-bold tracking-[0.25em] uppercase opacity-60 text-center">Contact Method</p>
            {/* Email */}
            <a
              href="mailto:sales@example.com?subject=Inquiry about Chanel Coco Noir"
              className="flex items-center gap-4 p-5 border-2 border-black dark:border-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center justify-center w-12 h-12 border border-black dark:border-white flex-shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold tracking-[0.2em] uppercase mb-1">Email Us</h3>
                <p className="text-sm tracking-wide">sales@example.com</p>
              </div>
            </a>

            {/* Phone */}
            <a
              href="tel:+1234567890"
              className="flex items-center gap-4 p-5 border-2 border-black dark:border-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center justify-center w-12 h-12 border border-black dark:border-white flex-shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold tracking-[0.2em] uppercase mb-1">Call Us</h3>
                <p className="text-sm tracking-wide">+1 (234) 567-890</p>
              </div>
            </a>

            {/* Message */}
            <a
              href="https://wa.me/1234567890?text=I'm interested in purchasing Chanel Coco Noir"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 border-2 border-black dark:border-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center justify-center w-12 h-12 border border-black dark:border-white flex-shrink-0">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold tracking-[0.2em] uppercase mb-1">Message Us</h3>
                <p className="text-sm tracking-wide">WhatsApp chat</p>
              </div>
            </a>
          </div>

          <div className="mt-6 p-5 border-t border-black dark:border-white">
            <p className="text-xs tracking-wide text-center opacity-60">
              Our team typically responds within 24 hours during business days
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
