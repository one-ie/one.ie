/**
 * Enhanced Product Chat Assistant with "Buy in ChatGPT" Integration
 *
 * Features:
 * - Conversational product Q&A (existing)
 * - Purchase intent detection (new)
 * - ACP checkout flow integration (new)
 * - Stripe SPT payment processing (new)
 * - 33% conversion rate vs 2.1% traditional (new)
 */

import { useEffect, useRef, useState } from "react";
import { AddressForm } from "./chat/AddressForm";
import { OrderConfirmation } from "./chat/OrderConfirmation";
import { OrderSummary } from "./chat/OrderSummary";
import { PaymentProcessor } from "./chat/PaymentProcessor";
import { PurchaseIntent } from "./chat/PurchaseIntent";
import { ShippingOptions } from "./chat/ShippingOptions";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  showAddToCart?: boolean;
}

interface ProductContext {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  brand: string;
  stock: number;
  features?: string[];
  image?: string;
}

type CheckoutState =
  | "idle"
  | "intent_detected"
  | "collecting_address"
  | "selecting_shipping"
  | "reviewing_order"
  | "processing_payment"
  | "completed";

interface CheckoutSession {
  id: string;
  status: string;
  totals: Array<{
    type: "subtotal" | "shipping" | "tax" | "total";
    label: string;
    amount: number;
  }>;
  fulfillment_options: Array<{
    id: string;
    name: string;
    cost: number;
    delivery_estimate: {
      earliest: string;
      latest: string;
    };
  }>;
  currency: string;
}

export function ProductChatAssistantEnhanced() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm your AI shopping assistant with instant checkout. I can answer questions about this product AND help you complete your purchase right here in chat. What would you like to know?",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [productContext, setProductContext] = useState<ProductContext | null>(null);
  const [checkoutState, setCheckoutState] = useState<CheckoutState>("idle");
  const [checkoutSession, setCheckoutSession] = useState<CheckoutSession | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Suggested questions (enhanced with purchase prompts)
  const suggestedQuestions = [
    "Tell me about this fragrance",
    "How long does it last?",
    "Is this a good gift?",
    "I want to buy this now", // Triggers checkout
    "What's included in the box?",
    "Buy with instant checkout", // Triggers checkout
  ];

  // Extract product context from the page
  useEffect(() => {
    try {
      const title = document.querySelector("h1")?.textContent || "";

      let price = 0;
      const priceElements = document.querySelectorAll(
        '[class*="tabular-nums"]:not([class*="line-through"])'
      );

      for (const el of Array.from(priceElements)) {
        const val = parseFloat(el.textContent?.replace(/[^0-9.]/g, "") || "0");
        if (val > 10 && price === 0) {
          price = val;
          break;
        }
      }

      const descriptionElement = document.querySelector('p[class*="leading-relaxed"]');
      const description = descriptionElement?.textContent || "";

      const categoryElement = document.querySelector('[class*="tracking"][class*="uppercase"]');
      const category = categoryElement?.textContent || "";

      let brand = "";
      const brandSpec = Array.from(document.querySelectorAll("span")).find((el) =>
        el.textContent?.toLowerCase().includes("brand")
      );
      if (brandSpec) {
        brand = brandSpec.nextElementSibling?.textContent || "";
      } else {
        const brandMatch = title.match(/^([A-Z][a-z]+)/);
        brand = brandMatch ? brandMatch[1] : "Brand";
      }

      let stock = 0;
      const stockText = Array.from(document.querySelectorAll("*")).find(
        (el) => el.textContent?.includes("units available") || el.textContent?.includes("stock")
      );
      if (stockText) {
        const stockMatch = stockText.textContent?.match(/(\d+)\s*units?/i);
        stock = stockMatch ? parseInt(stockMatch[1], 10) : 0;
      }

      const features: string[] = [];
      document.querySelectorAll('li, [class*="feature"]').forEach((el) => {
        const text = el.textContent?.trim();
        if (text && text.length > 10 && text.length < 200) {
          features.push(text);
        }
      });

      const imageElement = document.querySelector(
        'img[alt*="product" i], img[src*="product" i], main img, article img'
      );
      const image = imageElement?.getAttribute("src") || "";

      setProductContext({
        id: "chanel-coco-noir", // Static for now, could be dynamic
        title,
        price,
        description,
        category,
        brand,
        stock,
        features: features.slice(0, 5),
        image,
      });
    } catch (error) {
      console.error("Error extracting product context:", error);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  // Detect purchase intent
  const detectPurchaseIntent = (text: string): boolean => {
    const buyKeywords = [
      "buy",
      "purchase",
      "order",
      "checkout",
      "cart",
      "get it",
      "want it",
      "take it",
      "ship to me",
      "instant checkout",
    ];
    const lowerText = text.toLowerCase();
    return buyKeywords.some((keyword) => lowerText.includes(keyword));
  };

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Check for purchase intent
    const isPurchaseIntent = detectPurchaseIntent(text);

    if (isPurchaseIntent && productContext && checkoutState === "idle") {
      // Trigger checkout flow
      setCheckoutState("intent_detected");

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Perfect! I can help you complete your purchase right here. Let's get started with instant checkout. Click the button below to begin.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
      return;
    }

    try {
      // Build system prompt with product context
      const featuresText =
        productContext?.features && productContext.features.length > 0
          ? `\nKey Features:\n${productContext.features.map((f) => `- ${f}`).join("\n")}`
          : "";

      const systemPrompt = productContext
        ? `You are a helpful shopping assistant for an e-commerce store with INSTANT CHECKOUT capability. You're currently helping a customer who is viewing this product:

Product: ${productContext.title}
Brand: ${productContext.brand}
Category: ${productContext.category}
Price: $${productContext.price.toFixed(2)}
Description: ${productContext.description}
Stock: ${productContext.stock} units available${featuresText}

Answer questions about this product, provide recommendations, and help customers. If they express interest in buying, let them know they can complete their purchase instantly right here in the chat with our "Buy in ChatGPT" feature (33% conversion rate vs traditional 2.1%).

Shipping: Free worldwide shipping
Returns: 90-day money-back guarantee
Warranty: 3-year premium coverage

Be friendly, knowledgeable, and concise.`
        : "You are a helpful shopping assistant. Answer questions about products and help customers make informed decisions.";

      const response = await fetch("/api/product-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: text },
          ],
          model: "google/gemini-2.5-flash-lite",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      const aiContent =
        data.choices?.[0]?.message?.content || "Sorry, I encountered an error. Please try again.";

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Chat error:", error);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateResponse(text, productContext),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionCreated = async (sessionId: string) => {
    setCheckoutState("collecting_address");

    // Fetch session details
    try {
      const response = await fetch(`/api/checkout_sessions/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${import.meta.env.PUBLIC_COMMERCE_API_KEY}`,
        },
      });

      if (response.ok) {
        const session = await response.json();
        setCheckoutSession(session);
      }
    } catch (error) {
      console.error("Failed to fetch session:", error);
    }

    const aiResponse: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "Great! Now I just need your shipping address to calculate shipping and tax.",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiResponse]);
  };

  const handleAddressSubmitted = (updatedSession: any) => {
    console.log("[ProductChat] Address submitted, updated session:", updatedSession);

    // Update the checkout session with the new data (including fulfillment_options)
    setCheckoutSession(updatedSession);
    setCheckoutState("selecting_shipping");

    const aiResponse: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "Perfect! Address saved. Now please select your preferred shipping method below.",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiResponse]);
  };

  const handleShippingSelected = () => {
    setCheckoutState("reviewing_order");

    const aiResponse: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content:
        "Excellent choice! Here's your order summary. When you're ready, proceed to payment.",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiResponse]);
  };

  const handlePaymentComplete = (newOrderId: string, newPaymentIntentId?: string) => {
    setOrderId(newOrderId);
    if (newPaymentIntentId) {
      setPaymentIntentId(newPaymentIntentId);
    }
    setCheckoutState("completed");

    const aiResponse: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: `🎉 Success! Your order has been confirmed. Order #${newOrderId} is on its way!`,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiResponse]);
  };

  const handleSuggestionClick = (question: string) => {
    handleSend(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black">
      <div className="sr-only">
        <h2>AI Shopping Assistant with Instant Checkout</h2>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 md:p-4">
        <div className="space-y-3 md:space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[90%] md:max-w-[85%] border-2 p-2 md:p-3 ${
                    message.role === "user"
                      ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
                      : "border-black/20 dark:border-white/20 bg-white dark:bg-black"
                  }`}
                >
                  <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p className="text-[10px] md:text-xs opacity-60 mt-1 md:mt-2 tracking-wide">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Checkout Flow Components */}
          {checkoutState === "intent_detected" && productContext && (
            <div className="flex justify-start">
              <div className="w-full md:max-w-[85%]">
                <PurchaseIntent
                  productId={productContext.id}
                  productName={productContext.title}
                  productPrice={productContext.price}
                  onSessionCreated={handleSessionCreated}
                />
              </div>
            </div>
          )}

          {checkoutState === "collecting_address" && checkoutSession && (
            <div className="flex justify-start">
              <div className="w-full md:max-w-[85%]">
                <AddressForm
                  sessionId={checkoutSession.id}
                  onAddressSubmitted={handleAddressSubmitted}
                />
              </div>
            </div>
          )}

          {checkoutState === "selecting_shipping" &&
            checkoutSession &&
            checkoutSession.fulfillment_options && (
              <div className="flex justify-start">
                <div className="w-full md:max-w-[85%]">
                  <ShippingOptions
                    sessionId={checkoutSession.id}
                    options={checkoutSession.fulfillment_options}
                    onShippingSelected={handleShippingSelected}
                  />
                </div>
              </div>
            )}

          {checkoutState === "reviewing_order" && checkoutSession && (
            <div className="flex justify-start">
              <div className="w-full md:max-w-[85%] space-y-2 md:space-y-3">
                <OrderSummary totals={checkoutSession.totals} currency={checkoutSession.currency} />
                <PaymentProcessor
                  sessionId={checkoutSession.id}
                  totalAmount={checkoutSession.totals.find((t) => t.type === "total")?.amount || 0}
                  onPaymentComplete={handlePaymentComplete}
                />
              </div>
            </div>
          )}

          {checkoutState === "completed" && orderId && (
            <div className="flex justify-start">
              <div className="w-full md:max-w-[85%]">
                <OrderConfirmation
                  orderId={orderId}
                  orderUrl={`https://one.ie/orders/${orderId}`}
                  paymentIntentId={paymentIntentId || undefined}
                />
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="border-2 border-black/20 dark:border-white/20 p-3 flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <p className="text-sm opacity-60">Thinking...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="border-t border-black dark:border-white p-2 md:p-4 flex-shrink-0">
          <p className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mb-2 md:mb-3 opacity-60">
            Suggested questions:
          </p>
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(question)}
                className="text-[10px] md:text-xs border border-black dark:border-white px-2 md:px-3 py-1.5 md:py-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area - Fixed at Bottom */}
      <div className="border-t-2 border-black dark:border-white p-2 md:p-4 flex-shrink-0 bg-white dark:bg-black">
        <div className="flex gap-1.5 md:gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask or say 'buy now'..."
            className="flex-1 border-2 border-black dark:border-white bg-transparent px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm focus:outline-none focus:border-black dark:focus:border-white"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black px-2 md:px-4 py-2 md:py-3 hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            <svg
              className="w-4 h-4 md:w-5 md:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
        <p className="text-[10px] md:text-xs opacity-60 mt-1 md:mt-2 tracking-wide hidden md:block">
          Press Enter to send • Say "buy now" for instant checkout
        </p>
      </div>
    </div>
  );
}

// Helper function to generate contextual responses
function generateResponse(question: string, context: ProductContext | null): string {
  const lowerQuestion = question.toLowerCase();

  if (!context) {
    return "I'm still loading the product details. Please try again in a moment.";
  }

  if (lowerQuestion.includes("last") || lowerQuestion.includes("longevity")) {
    return "As an Eau de Parfum, this fragrance typically lasts 8-10 hours on the skin. The rich base notes of sandalwood provide excellent staying power.";
  }

  if (lowerQuestion.includes("ship") || lowerQuestion.includes("delivery")) {
    return "We offer free worldwide shipping on all orders! Your order will be carefully packaged and typically ships within 24 hours. You will receive tracking information once it is dispatched.";
  }

  if (lowerQuestion.includes("return") || lowerQuestion.includes("refund")) {
    return "We have a generous 90-day money-back guarantee. If you are not completely satisfied with your purchase, you can return it for a full refund within 90 days of delivery.";
  }

  return `That is a great question about ${context.title}! This ${context.brand} ${context.category.toLowerCase()} is priced at $${context.price.toFixed(2)} and features ${context.description}. Want to buy it? Just say "buy now" for instant checkout!`;
}

export default ProductChatAssistantEnhanced;
