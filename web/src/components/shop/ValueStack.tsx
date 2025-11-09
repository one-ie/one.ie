import { useState, useEffect } from 'react';
import { Check, Gift, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ValueStack() {
  const [revealed, setRevealed] = useState(false);
  const [bonusesRevealed, setBonusesRevealed] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  const regularPrice = 155.99;
  const salePrice = 129.99;
  const savings = regularPrice - salePrice;

  const bonuses = [
    { name: 'Premium Gift Box', value: 15.00 },
    { name: 'Luxury Sample Set', value: 25.00 },
    { name: 'Personalized Card', value: 5.00 },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setRevealed(true);
        }
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById('value-stack');
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  useEffect(() => {
    if (revealed && bonusesRevealed < bonuses.length) {
      const timer = setTimeout(() => {
        setBonusesRevealed((prev) => prev + 1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [revealed, bonusesRevealed, bonuses.length]);

  useEffect(() => {
    if (revealed) {
      const interval = setInterval(() => {
        setTotalValue((prev) => {
          const target = bonuses.slice(0, bonusesRevealed).reduce((acc, b) => acc + b.value, 0);
          if (prev < target) {
            return Math.min(prev + 0.5, target);
          }
          return prev;
        });
      }, 20);
      return () => clearInterval(interval);
    }
  }, [revealed, bonusesRevealed, bonuses]);

  return (
    <section id="value-stack" className="max-w-4xl mx-auto px-6 py-24">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
          Complete Your Experience
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Everything you need for the ultimate luxury fragrance experience
        </p>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-2xl p-8 md:p-12 border-2 border-purple-200 dark:border-purple-800 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 animate-gradient" />

        <div className="relative z-10 space-y-6">
          {/* Main Product */}
          <div className="flex items-center justify-between pb-6 border-b border-purple-200 dark:border-purple-800">
            <div>
              <h3 className="text-xl font-bold">Chanel Coco Noir Eau de Parfum</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">Exclusive luxury fragrance</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                ${salePrice}
              </div>
              <div className="text-sm text-gray-500 line-through">${regularPrice}</div>
            </div>
          </div>

          {/* Bonuses */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-400">
              <Gift className="w-5 h-5" />
              <span>EXCLUSIVE BONUSES (Limited Time)</span>
            </div>

            {bonuses.map((bonus, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg bg-white dark:bg-black border border-purple-200 dark:border-purple-800 transition-all duration-500 ${
                  bonusesRevealed > index
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 translate-x-4'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900">
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold">{bonus.name}</p>
                    <p className="text-xs text-gray-500">Value: ${bonus.value.toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">FREE</span>
                </div>
              </div>
            ))}
          </div>

          {/* Total Value */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold">Total Package Value:</span>
              <span className="text-3xl font-black">${(regularPrice + totalValue).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Your Price Today:</span>
              <span className="text-2xl font-black">${salePrice}</span>
            </div>
          </div>

          {/* Savings Badge */}
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full font-black text-xl animate-pulse-slow">
              <Sparkles className="w-6 h-6" />
              <span>YOU SAVE ${(savings + totalValue).toFixed(2)}</span>
              <Sparkles className="w-6 h-6" />
            </div>
          </div>

          {/* CTA */}
          <Button
            onClick={() => {
              // Scroll to top to trigger header buy button
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            size="lg"
            className="w-full bg-black dark:bg-white text-white dark:text-black text-xl py-6 rounded-xl hover:scale-105 transition-transform"
          >
            Claim This Exclusive Offer
          </Button>

          {/* Guarantee */}
          <div className="flex items-center justify-center gap-3 pt-6 border-t border-purple-200 dark:border-purple-800">
            <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              90-Day Money-Back Guarantee • 3-Year Warranty • Free Shipping
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
