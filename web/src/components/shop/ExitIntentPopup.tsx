import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Gift } from 'lucide-react';

export function ExitIntentPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if popup was already shown in this session
    const shown = sessionStorage.getItem('exitIntentShown');
    if (shown) {
      setHasShown(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Check if cursor is leaving from the top of the page
      if (e.clientY <= 0 && !hasShown) {
        setIsOpen(true);
        setHasShown(true);
        sessionStorage.setItem('exitIntentShown', 'true');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasShown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the email to your backend
    console.log('Email submitted:', email);
    setIsOpen(false);
    // Show success message or redirect
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
        </button>

        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse-slow">
              <Gift className="w-10 h-10 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-3xl font-black">
            Wait! Don't Leave Empty-Handed
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="text-center space-y-2">
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
              Get 15% Off Your First Order
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Join our exclusive list and receive your discount code instantly
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-center text-lg py-6"
            />

            <Button
              type="submit"
              size="lg"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg py-6 hover:from-purple-700 hover:to-pink-700"
            >
              Claim My 15% Discount
            </Button>
          </form>

          <div className="text-center space-y-2 pt-4">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Free shipping on all orders</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>No spam, unsubscribe anytime</span>
            </div>
          </div>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            By signing up, you agree to receive marketing emails. You can unsubscribe at any time.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
