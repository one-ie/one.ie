import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MessageCircle } from 'lucide-react';

export function ProductHeader() {
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Thin Info Bar */}
      <div className="bg-black dark:bg-white text-white dark:text-black py-2">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-xs sm:text-sm">
          <div className="flex items-center gap-4">
            <span>Free Shipping Worldwide</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Overnight Delivery</span>
          </div>
          <div className="flex items-center gap-4">
            <span>90-Day Returns</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">3-Year Warranty</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-2xl font-black tracking-tight">
                YOUR LOGO
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection('features')}
                className="text-sm font-medium hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('details')}
                className="text-sm font-medium hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                Details
              </button>
              <button
                onClick={() => scrollToSection('reviews')}
                className="text-sm font-medium hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                Reviews
              </button>
              <button
                onClick={() => scrollToSection('gallery')}
                className="text-sm font-medium hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                Gallery
              </button>
            </nav>

            {/* Buy Now Button */}
            <Button
              onClick={() => setBuyDialogOpen(true)}
              variant="default"
            >
              Buy Now
            </Button>
          </div>
        </div>
      </header>

      {/* Buy Now Dialog */}
      <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Get in Touch</DialogTitle>
            <DialogDescription className="text-base">
              To purchase this exclusive product, please contact us through your preferred method:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-4">
            {/* Email */}
            <a
              href="mailto:sales@example.com?subject=Inquiry about Chanel Coco Noir"
              className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent transition-colors group"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Email Us</h3>
                <p className="text-sm text-muted-foreground">sales@example.com</p>
              </div>
            </a>

            {/* Phone */}
            <a
              href="tel:+1234567890"
              className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent transition-colors group"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Call Us</h3>
                <p className="text-sm text-muted-foreground">+1 (234) 567-890</p>
              </div>
            </a>

            {/* Message */}
            <a
              href="https://wa.me/1234567890?text=I'm interested in purchasing Chanel Coco Noir"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent transition-colors group"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Message Us</h3>
                <p className="text-sm text-muted-foreground">WhatsApp chat</p>
              </div>
            </a>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              Our team typically responds within 24 hours during business days
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
