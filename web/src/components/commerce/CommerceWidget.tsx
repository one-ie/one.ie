/**
 * Commerce Chat Widget
 *
 * Embeddable chat widget that can be added to any page
 * Opens in a floating window similar to Intercom/Drift
 */

import { useState } from 'react';
import { MessageCircle, X, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CommerceWidgetProps {
  category?: string;
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
}

export function CommerceWidget({
  category,
  position = 'bottom-right',
  primaryColor = '#0070f3',
}: CommerceWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const positionClasses =
    position === 'bottom-right'
      ? 'bottom-4 right-4'
      : 'bottom-4 left-4';

  return (
    <div className={`fixed ${positionClasses} z-50`}>
      {!isOpen ? (
        /* Floating Button */
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg hover:scale-110 transition-transform"
          style={{ backgroundColor: primaryColor }}
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      ) : (
        /* Chat Window */
        <Card
          className={`shadow-2xl transition-all duration-300 ${
            isMinimized ? 'h-14' : 'h-[600px]'
          } w-[400px] flex flex-col`}
        >
          {/* Header */}
          <div
            className="flex-none px-4 py-3 border-b flex items-center justify-between"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center gap-2 text-white">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">Product Advisor</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 p-1 rounded"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <div className="flex-1 overflow-hidden">
              <iframe
                src={`/commerce-chat?category=${category || ''}&embed=true`}
                className="w-full h-full border-0"
                title="Product Advisor Chat"
              />
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
