/**
 * High-Converting Chat Client V2
 *
 * Redesigned for maximum conversion with:
 * - Beautiful demo suggestion cards
 * - Clear value proposition
 * - Progressive feature disclosure
 * - Social proof indicators
 * - Premium tier benefits
 */

import { useState, useEffect, useRef } from 'react';
import { MessageList } from '@/components/ai/MessageList';
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorTrigger,
} from '@/components/ai/elements/model-selector';
import { PromptInputSpeechButton } from '@/components/ai/elements/prompt-input';
import { AgentMessage, type AgentUIMessage } from '@/components/ai/AgentMessage';
import { secureSetItem, secureGetItem, secureRemoveItem } from '@/lib/security';
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from '@/components/ai/elements/message';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai/elements/conversation';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai/elements/reasoning';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Brain,
  GlobeIcon,
  CheckIcon,
  CopyIcon,
  CheckCheckIcon,
  Sparkles,
  Zap,
  Shield,
  ChartBar,
  Code2,
  Palette,
  Database,
  FileSearch,
  Users,
  TrendingUp,
  Lock,
  Unlock,
  Star,
  ArrowRight,
  Play,
  Layers,
  Bot,
  Wand2,
  LineChart,
  Table,
  FormInput,
  Calendar,
  MessageSquare,
  Image,
  Search,
  Mic,
  Plus,
  ShoppingCart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ChatStatus } from 'ai';

// Category definitions with icons and colors
const DEMO_CATEGORIES = {
  'ai-features': {
    name: 'AI Features',
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-gradient-to-br from-purple-500/10 to-pink-500/10',
    borderColor: 'border-purple-500/20',
    description: 'Advanced AI capabilities'
  },
  'data-viz': {
    name: 'Data & Analytics',
    icon: ChartBar,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10',
    borderColor: 'border-blue-500/20',
    description: 'Visualize and analyze data'
  },
  'ui-generation': {
    name: 'UI Generation',
    icon: Palette,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10',
    borderColor: 'border-green-500/20',
    description: 'Generate UI components'
  },
  'productivity': {
    name: 'Productivity',
    icon: Zap,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-gradient-to-br from-orange-500/10 to-red-500/10',
    borderColor: 'border-orange-500/20',
    description: 'Boost your productivity'
  }
};

// Enhanced demo suggestions with categories
const DEMO_SUGGESTIONS = [
  {
    id: 'chart',
    prompt: "Show me beautiful conversion rate charts comparing AI chat vs traditional forms. Include: 1) Sales funnel showing drop-off at each stage (Landing → Engagement → Qualification → Demo → Closed Won), 2) Upsell success rates (Basic → Pro → Enterprise → Annual), 3) Code to production deployment timeline with Cloudflare, and 4) Edge performance metrics (response time + requests/sec). Make the charts visually stunning with clear comparisons showing AI chat crushing traditional forms.",
    title: "Charts",
    description: "Create interactive visualizations",
    category: 'data-viz',
    icon: LineChart,
    premium: false,
    popular: true
  },
  {
    id: 'product',
    prompt: "Show me the Efficient Slice Toaster product card with a working Add to Cart button. Make it look professional with product image, price, rating, stock count, and quantity selector.",
    title: "Products",
    description: "E-commerce product cards",
    category: 'ui-generation',
    icon: ShoppingCart,
    premium: false,
    popular: true
  },
  {
    id: 'table',
    prompt: "📋 Create a data table (demo)",
    title: "Tables",
    description: "Structure data beautifully",
    category: 'data-viz',
    icon: Table,
    premium: false
  },
  {
    id: 'form',
    prompt: "📝 Build a contact form (demo)",
    title: "Forms",
    description: "Generate forms instantly",
    category: 'ui-generation',
    icon: FormInput,
    premium: false
  },
  {
    id: 'timeline',
    prompt: "⏱️ Show project timeline (demo)",
    title: "Timeline",
    description: "Visualize project milestones",
    category: 'ui-generation',
    icon: Calendar,
    premium: false
  },
];

// Value propositions for conversion
const VALUE_PROPS: any[] = [];

// Trust indicators
const TRUST_BADGES: any[] = [];

const POPULAR_MODELS = [
  // Free models
  {
    id: 'google/gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    chef: 'Google',
    chefSlug: 'google',
    providers: ['google'],
    free: true,
    context: '1M'
  },
  {
    id: 'openrouter/polaris-alpha',
    name: 'Polaris Alpha',
    chef: 'OpenRouter',
    chefSlug: 'openrouter',
    providers: ['openrouter'],
    free: true,
    context: '256K'
  },
  {
    id: 'tngtech/deepseek-r1t2-chimera:free',
    name: 'DeepSeek R1T2 Chimera',
    chef: 'TNG',
    chefSlug: 'tng',
    providers: ['tng'],
    free: true,
    context: '164K'
  },
  {
    id: 'z-ai/glm-4.5-air:free',
    name: 'GLM 4.5 Air',
    chef: 'Z.AI',
    chefSlug: 'z-ai',
    providers: ['z-ai'],
    free: true,
    context: '131K'
  },
  {
    id: 'tngtech/deepseek-r1t-chimera:free',
    name: 'DeepSeek R1T Chimera',
    chef: 'TNG',
    chefSlug: 'tng',
    providers: ['tng'],
    free: true,
    context: '164K'
  },
  // Premium models - Frontier
  {
    id: 'anthropic/claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    chef: 'Anthropic',
    chefSlug: 'anthropic',
    providers: ['anthropic'],
    free: false,
    context: '1M'
  },
  {
    id: 'openai/gpt-5',
    name: 'GPT-5',
    chef: 'OpenAI',
    chefSlug: 'openai',
    providers: ['openai'],
    free: false,
    context: '400K'
  },
  {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    chef: 'Google',
    chefSlug: 'google',
    providers: ['google'],
    free: false,
    context: '1M'
  },
  {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude Sonnet 4',
    chef: 'Anthropic',
    chefSlug: 'anthropic',
    providers: ['anthropic'],
    free: false,
    context: '1M'
  },
  // Premium - Fast models
  {
    id: 'x-ai/grok-code-fast-1',
    name: 'Grok Code Fast 1',
    chef: 'xAI',
    chefSlug: 'x-ai',
    providers: ['x-ai'],
    free: false,
    context: '256K'
  },
  {
    id: 'x-ai/grok-4-fast',
    name: 'Grok 4 Fast',
    chef: 'xAI',
    chefSlug: 'x-ai',
    providers: ['x-ai'],
    free: false,
    context: '2M'
  },
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    chef: 'Google',
    chefSlug: 'google',
    providers: ['google'],
    free: false,
    context: '1M'
  },
  {
    id: 'google/gemini-2.0-flash-001',
    name: 'Gemini 2.0 Flash',
    chef: 'Google',
    chefSlug: 'google',
    providers: ['google'],
    free: false,
    context: '1M'
  },
  // Premium - Efficient
  {
    id: 'openai/gpt-5-mini',
    name: 'GPT-5 Mini',
    chef: 'OpenAI',
    chefSlug: 'openai',
    providers: ['openai'],
    free: false,
    context: '400K'
  },
  {
    id: 'anthropic/claude-haiku-4.5',
    name: 'Claude Haiku 4.5',
    chef: 'Anthropic',
    chefSlug: 'anthropic',
    providers: ['anthropic'],
    free: false,
    context: '200K'
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    chef: 'OpenAI',
    chefSlug: 'openai',
    providers: ['openai'],
    free: false,
    context: '128K'
  },
  {
    id: 'deepseek/deepseek-chat-v3.1',
    name: 'DeepSeek V3.1',
    chef: 'DeepSeek',
    chefSlug: 'deepseek',
    providers: ['deepseek'],
    free: false,
    context: '164K'
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B',
    chef: 'Meta',
    chefSlug: 'meta',
    providers: ['meta'],
    free: false,
    context: '131K'
  },
];

const STORAGE_KEY = 'openrouter-api-key';
const MODEL_KEY = 'openrouter-model';

// Extended message type for premium features
interface ExtendedMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  type?: 'text' | 'reasoning' | 'tool_call' | 'ui';
  payload?: any;
  timestamp?: number;
  reasoning?: {
    content: string;
    duration?: number;
  };
  isReasoningComplete?: boolean;
  isReasoningStreaming?: boolean;
}

// Mock premium responses for demo
const DEMO_RESPONSES: Record<string, ExtendedMessage[]> = {
  'agent reasoning': [
    {
      id: 'demo-reasoning',
      role: 'assistant',
      content: '',
      type: 'reasoning',
      payload: {
        steps: [
          { step: 1, title: "Analyzing request", description: "Understanding what the user wants to see", completed: true },
          { step: 2, title: "Preparing demonstration", description: "Setting up agent reasoning visualization", completed: true },
          { step: 3, title: "Generating response", description: "Creating structured output with reasoning steps", completed: true }
        ]
      },
      timestamp: Date.now(),
    },
    {
      id: 'demo-text',
      role: 'assistant',
      content: 'This is an example of agent reasoning! The steps above show how an AI agent thinks through a problem step-by-step. In a real implementation, these would be generated dynamically as the agent processes your request.',
      type: 'text',
      timestamp: Date.now(),
    }
  ],
  'tool calls': [
    {
      id: 'demo-tool-1',
      role: 'assistant',
      content: '',
      type: 'tool_call',
      payload: {
        name: 'search_database',
        args: { query: 'recent sales data', limit: 10 },
        result: { count: 5, items: ['Item 1', 'Item 2', 'Item 3'] },
        status: 'completed'
      },
      timestamp: Date.now(),
    },
    {
      id: 'demo-tool-2',
      role: 'assistant',
      content: '',
      type: 'tool_call',
      payload: {
        name: 'calculate_metrics',
        args: { metric: 'revenue', period: 'last_month' },
        result: { revenue: 125000, growth: 15.5 },
        status: 'completed'
      },
      timestamp: Date.now(),
    },
    {
      id: 'demo-text',
      role: 'assistant',
      content: 'These tool calls show how an AI agent can execute functions and display the arguments and results. Click the chevron to expand and see the details!',
      type: 'text',
      timestamp: Date.now(),
    }
  ],
  'sales chart': [
    {
      id: 'demo-chart-1',
      role: 'assistant',
      content: '',
      type: 'ui',
      payload: {
        component: 'chart',
        data: {
          title: 'Sales Funnel: AI Chat vs Traditional Forms',
          chartType: 'bar',
          labels: ['Landing Page', 'Engagement', 'Qualification', 'Demo Request', 'Closed Won'],
          datasets: [
            { label: 'AI Chat', data: [100, 82, 67, 54, 38], color: '#10b981' },
            { label: 'Traditional Form', data: [100, 34, 23, 12, 5], color: '#94a3b8' }
          ]
        }
      },
      timestamp: Date.now(),
    },
    {
      id: 'demo-chart-2',
      role: 'assistant',
      content: '',
      type: 'ui',
      payload: {
        component: 'chart',
        data: {
          title: 'Upsell & Cross-sell Success Rate',
          chartType: 'bar',
          labels: ['Basic Plan', 'Pro Plan Upsell', 'Enterprise Add-ons', 'Annual Commitment'],
          datasets: [
            { label: 'AI Chat Conversational', data: [100, 68, 42, 73], color: '#3b82f6' },
            { label: 'Traditional Forms', data: [100, 22, 8, 31], color: '#94a3b8' }
          ]
        }
      },
      timestamp: Date.now(),
    },
    {
      id: 'demo-chart-3',
      role: 'assistant',
      content: '',
      type: 'ui',
      payload: {
        component: 'chart',
        data: {
          title: 'Code to Production: Deployment Pipeline',
          chartType: 'line',
          labels: ['Code Push', 'Build Start', 'Tests Pass', 'Cloudflare Deploy', 'Live Traffic'],
          datasets: [
            { label: 'Deployment Time (seconds)', data: [0, 12, 45, 67, 89], color: '#f59e0b' }
          ]
        }
      },
      timestamp: Date.now(),
    },
    {
      id: 'demo-chart-4',
      role: 'assistant',
      content: '',
      type: 'ui',
      payload: {
        component: 'chart',
        data: {
          title: 'Cloudflare Edge Performance',
          chartType: 'line',
          labels: ['0s', '10s', '20s', '30s', '40s', '50s', '60s'],
          datasets: [
            { label: 'Response Time (ms)', data: [8, 9, 7, 8, 9, 8, 7], color: '#8b5cf6' },
            { label: 'Requests/sec', data: [1200, 1450, 1380, 1520, 1490, 1560, 1610], color: '#3b82f6' }
          ]
        }
      },
      timestamp: Date.now(),
    },
    {
      id: 'demo-text',
      role: 'assistant',
      content: '🚀 **Conversion Funnel Analysis:**\n\n📊 **AI Chat crushes every funnel stage:**\n✅ **7.6x better closed-won rate** (38% vs 5%)\n✅ **68% upsell success** vs 22% with forms\n✅ **3.1x higher cross-sell** on add-ons\n✅ **2.4x annual commitment rate**\n\n⚡ **Deployment Pipeline:**\n✅ **89 seconds** from code to production\n✅ **Cloudflare Edge** delivers <10ms response times\n✅ **1,500+ req/sec** with zero performance degradation\n\n**AI chat doesn\'t just convert better—it tracks, analyzes, and optimizes every step from visitor to customer to champion.** The data speaks for itself. 📈',
      type: 'text',
      timestamp: Date.now(),
    }
  ],
  'data table': [
    {
      id: 'demo-table',
      role: 'assistant',
      content: '',
      type: 'ui',
      payload: {
        component: 'table',
        data: {
          title: 'Top Customers',
          headers: ['Customer', 'Orders', 'Revenue', 'Status'],
          rows: [
            ['Acme Corp', '45', '$125,000', 'Active'],
            ['TechStart Inc', '32', '$98,500', 'Active'],
            ['Global Solutions', '28', '$76,200', 'Pending'],
            ['Innovation Labs', '19', '$54,800', 'Active']
          ]
        }
      },
      timestamp: Date.now(),
    },
    {
      id: 'demo-text',
      role: 'assistant',
      content: 'This table displays structured data in an easy-to-read format. Perfect for showing analysis results!',
      type: 'text',
      timestamp: Date.now(),
    }
  ],
  'contact form': [
    {
      id: 'demo-form',
      role: 'assistant',
      content: '',
      type: 'ui',
      payload: {
        component: 'form',
        data: {
          title: 'Contact Us',
          fields: [
            { label: 'Name', type: 'text', name: 'name', required: true },
            { label: 'Email', type: 'email', name: 'email', required: true },
            { label: 'Phone', type: 'tel', name: 'phone', required: false },
            { label: 'Message', type: 'text', name: 'message', required: true }
          ],
          submitLabel: 'Send Message'
        }
      },
      timestamp: Date.now(),
    },
    {
      id: 'demo-text',
      role: 'assistant',
      content: 'The AI can generate dynamic forms based on your requirements. This makes it easy to collect structured data from users!',
      type: 'text',
      timestamp: Date.now(),
    }
  ],
  'timeline': [
    {
      id: 'demo-timeline',
      role: 'assistant',
      content: '',
      type: 'ui',
      payload: {
        component: 'timeline',
        data: {
          title: 'Project Milestones',
          events: [
            { title: 'Project kickoff', timestamp: '2025-01-01' },
            { title: 'Design phase completed', timestamp: '2025-01-15' },
            { title: 'Development started', timestamp: '2025-02-01' },
            { title: 'Beta testing', timestamp: '2025-03-01' },
            { title: 'Launch date', timestamp: '2025-04-01' }
          ]
        }
      },
      timestamp: Date.now(),
    },
    {
      id: 'demo-text',
      role: 'assistant',
      content: 'Timelines help visualize events and milestones chronologically. Great for project planning and status updates!',
      type: 'text',
      timestamp: Date.now(),
    }
  ]
};

// Demo suggestion card component - ultra minimal
function DemoCard({
  suggestion,
  onSelect,
  isLocked = false
}: {
  suggestion: typeof DEMO_SUGGESTIONS[0];
  onSelect: (prompt: string) => void;
  isLocked?: boolean;
}) {
  const Icon = suggestion.icon;

  return (
    <button
      className={cn(
        "w-full p-2 rounded-lg bg-background",
        "hover:bg-accent transition-colors",
        "cursor-pointer",
        isLocked && "opacity-60"
      )}
      onClick={() => !isLocked && onSelect(suggestion.prompt)}
    >
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-foreground flex-shrink-0" />
        <span className="font-medium text-xs text-foreground">
          {suggestion.title}
        </span>
      </div>
    </button>
  );
}

// Hero section component - removed, content moved to main layout

export function ChatClientV2() {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('google/gemini-2.5-flash-lite');
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [conversationCopied, setConversationCopied] = useState(false);
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedModelData = POPULAR_MODELS.find((m) => m.id === selectedModel);
  const hasApiKey = !!apiKey;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load API key and model from secure storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = secureGetItem(STORAGE_KEY);
      const savedModel = localStorage.getItem(MODEL_KEY); // Model selection is not sensitive

      if (savedKey) {
        setApiKey(savedKey);
      }
      if (savedModel) {
        setSelectedModel(savedModel);
      }
    }
  }, []);

  // Save API key to secure storage
  const handleSaveApiKey = () => {
    if (apiKey && typeof window !== 'undefined') {
      secureSetItem(STORAGE_KEY, apiKey);
      localStorage.setItem(MODEL_KEY, selectedModel);
      toast({
        title: "API Key Saved",
        description: "All premium features are now unlocked!",
      });
      setShowSettings(false);
    }
  };

  // Clear stored key
  const handleClearKey = () => {
    if (typeof window !== 'undefined') {
      secureRemoveItem(STORAGE_KEY);
      localStorage.removeItem(MODEL_KEY);
    }
    setApiKey('');
    setMessages([]);
    toast({
      title: "API Key Removed",
      description: "Switched back to free tier",
    });
  };

  // Handle demo selection
  const handleDemoSelect = (prompt: string) => {
    // All demos work in free tier!
    handleSubmit({ text: prompt, files: [] } as any, new Event('submit') as any);
  };

  // Copy message to clipboard
  const handleCopyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      });
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy message to clipboard",
        variant: "destructive",
      });
    }
  };

  // Copy entire conversation
  const handleCopyConversation = async () => {
    try {
      const conversationText = messages
        .map(msg => {
          const role = msg.role === 'user' ? 'You' : 'Assistant';
          return `${role}: ${msg.content}`;
        })
        .join('\n\n');

      await navigator.clipboard.writeText(conversationText);
      setConversationCopied(true);
      toast({
        title: "Conversation copied!",
        description: "Entire conversation copied to clipboard",
      });

      setTimeout(() => setConversationCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy conversation to clipboard",
        variant: "destructive",
      });
    }
  };

  // Handle voice input
  const handleTranscriptionChange = (text: string) => {
    if (textareaRef.current) {
      textareaRef.current.value = text;
    }
  };

  // Handle web search
  const handleWebSearch = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const currentText = textarea.value;
      if (currentText.trim()) {
        textarea.value = `Search the web for: ${currentText}`;
        toast({
          title: "Web Search",
          description: "Your query will include web search results.",
        });
      } else {
        toast({
          title: "Enter a query",
          description: "Please type what you want to search for.",
          variant: "destructive",
        });
      }
    }
  };

  // Submit message to API
  const handleSubmit = async (message: any, event?: React.FormEvent<HTMLFormElement>) => {
    const text = message?.text || '';
    const files = message?.files || [];

    if (!text.trim() || isLoading) return;

    // Check if premium model selected without API key
    const selectedModelInfo = POPULAR_MODELS.find(m => m.id === selectedModel);
    if (selectedModelInfo && !selectedModelInfo.free && !apiKey) {
      // Show settings modal instead of making request
      setShowSettings(true);
      toast({
        title: "API Key Required",
        description: `${selectedModelInfo.name} requires an OpenRouter API key. Add your key or switch to a free model.`,
      });
      return;
    }

    const userMessage: ExtendedMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      type: 'text',
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    // Check if this is a demo request
    const messageLower = text.toLowerCase();
    let demoKey: string | null = null;

    // Check for conversion charts request
    if (messageLower.includes('conversion rate charts') ||
        (messageLower.includes('sales funnel') && messageLower.includes('upsell'))) {
      demoKey = 'sales chart';
    }
    // Check for other demo requests
    else if (messageLower.includes('(demo)')) {
      for (const key of Object.keys(DEMO_RESPONSES)) {
        if (messageLower.includes(key)) {
          demoKey = key;
          break;
        }
      }
    }

    // If demo request, return mock responses
    if (demoKey && DEMO_RESPONSES[demoKey]) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setMessages(prev => [...prev, ...DEMO_RESPONSES[demoKey]]);
        setIsLoading(false);
        return;
      } catch (err) {
        console.error('Demo error:', err);
        setError('Failed to show demo');
        setIsLoading(false);
        return;
      }
    }

    try {
      // Always make the API call - free tier works without API key!
      const allMessages = [
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: text.trim() }
      ];

      // Enable generative UI only for demo prompts or when explicitly requested
      const isGenerativeUIRequest = text.toLowerCase().includes('(demo)') ||
                                     text.toLowerCase().includes('chart') ||
                                     text.toLowerCase().includes('table') ||
                                     text.toLowerCase().includes('visualiz') ||
                                     text.toLowerCase().includes('product') ||
                                     text.toLowerCase().includes('toaster');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: allMessages,
          apiKey,
          model: selectedModel,
          enableGenerativeUI: isGenerativeUIRequest,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let assistantContent = '';
      const assistantMessage: ExtendedMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
        type: 'text',
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Read streaming response
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);

              // Check for UI component messages (charts, tables, etc.)
              if (parsed.type && parsed.type !== 'text') {
                console.log('Received UI component:', parsed.type, parsed.payload);
                const uiMessage: ExtendedMessage = {
                  id: `ui-${crypto.randomUUID()}`,
                  role: 'assistant',
                  content: '',
                  type: parsed.type as any,
                  payload: parsed.payload,
                  timestamp: Date.now(),
                };
                setMessages(prev => [...prev, uiMessage]);
              }
              // Check for regular text content
              else if (parsed.choices?.[0]?.delta?.content) {
                assistantContent += parsed.choices[0].delta.content;
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantMessage.id
                      ? { ...msg, content: assistantContent }
                      : msg
                  )
                );
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  // Render message
  const renderMessage = (msg: ExtendedMessage) => {
    const isCopied = copiedMessageId === msg.id;

    return (
      <Message key={msg.id} from={msg.role}>
        <div>
          {msg.reasoning && (
            <Reasoning
              duration={msg.reasoning.duration}
              isStreaming={msg.isReasoningStreaming}
            >
              <ReasoningTrigger />
              <ReasoningContent>
                {msg.reasoning.content}
              </ReasoningContent>
            </Reasoning>
          )}

          {msg.type && msg.type !== 'text' && msg.type !== 'reasoning' && (
            <div className="mb-4">
              <AgentMessage
                message={{
                  type: msg.type as any,
                  payload: msg.payload,
                  timestamp: msg.timestamp || Date.now(),
                }}
              />
            </div>
          )}

          {(msg.role === 'user' || msg.isReasoningComplete || !msg.reasoning) && msg.content && (
            <MessageContent
              className={cn(
                "group-[.is-user]:rounded-[24px] group-[.is-user]:bg-[#2f2f2f] group-[.is-user]:text-[#ececec]",
                "group-[.is-assistant]:bg-transparent group-[.is-assistant]:p-0 group-[.is-assistant]:text-foreground"
              )}
            >
              <MessageResponse>{msg.content}</MessageResponse>
            </MessageContent>
          )}

          {msg.content && msg.role === 'assistant' && (
            <MessageActions className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <MessageAction
                tooltip={isCopied ? "Copied!" : "Copy message"}
                onClick={() => handleCopyMessage(msg.id, msg.content)}
              >
                {isCopied ? (
                  <CheckCheckIcon className="h-4 w-4" />
                ) : (
                  <CopyIcon className="h-4 w-4" />
                )}
              </MessageAction>
            </MessageActions>
          )}
        </div>
      </Message>
    );
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="relative flex size-full flex-col overflow-hidden items-center justify-center bg-background">
      <style>{`
        textarea:focus, input:focus, button:focus {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }

        /* Code block styling */
        .is-assistant pre {
          background-color: hsl(var(--muted)) !important;
          border: 1px solid hsl(var(--border)) !important;
          border-radius: 0.5rem !important;
          padding: 1rem !important;
          overflow-x: auto !important;
          margin: 0.5rem 0 !important;
        }

        .is-assistant code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
          font-size: 0.875rem !important;
          line-height: 1.5 !important;
        }

        .is-assistant pre code {
          background: none !important;
          padding: 0 !important;
          border: none !important;
          border-radius: 0 !important;
        }

        .is-assistant :not(pre) > code {
          background-color: hsl(var(--muted)) !important;
          padding: 0.125rem 0.375rem !important;
          border-radius: 0.25rem !important;
          font-size: 0.875em !important;
        }

        .is-assistant pre > div {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          margin-bottom: 0.5rem !important;
          padding-bottom: 0.5rem !important;
          border-bottom: 1px solid hsl(var(--border)) !important;
        }

        .is-assistant pre > div > span {
          font-size: 0.75rem !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          color: hsl(var(--muted-foreground)) !important;
        }

        /* Smooth transitions */
        .input-container {
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .demo-cards {
          transition: opacity 0.4s ease-out, transform 0.4s ease-out;
        }

        .demo-cards.hidden {
          opacity: 0;
          transform: translateY(20px);
          pointer-events: none;
        }
      `}</style>

      {/* Top Right: Add API Key Button */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(true)}
          className="gap-2"
        >
          <Unlock className="w-4 h-4" />
          Add API Key
        </Button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Unlock Premium Features</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => {
                // Same as Clear button - clear key and reset to free model
                if (typeof window !== 'undefined') {
                  localStorage.removeItem(STORAGE_KEY);
                  localStorage.removeItem(MODEL_KEY);
                }
                setApiKey('');
                setSelectedModel('google/gemini-2.5-flash-lite');
                setMessages([]);
                setShowSettings(false);
              }}>
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription className="text-xs">
                  ✨ <strong>Chat is 100% FREE with Gemini Flash Lite!</strong> No API key required.
                  Add an OpenRouter key only if you want access to GPT-4, Claude, and 50+ other models.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="api-key">OpenRouter API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                />
                <p className="text-xs text-muted-foreground">
                  Get a free key from{' '}
                  <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    OpenRouter
                  </a>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Select Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger id="model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POPULAR_MODELS.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex items-center gap-2">
                          {model.name}
                          {model.free && (
                            <Badge variant="secondary" className="text-xs">Free</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSaveApiKey} className="flex-1">
                  Unlock Features
                </Button>
                {apiKey && (
                  <Button variant="destructive" size="sm" onClick={handleClearKey}>
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error Display - Centered */}
      {error && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl z-20 px-6 py-2">
          <Alert variant="destructive">
            <AlertDescription>
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Messages Area - Only show when there are messages */}
      {hasMessages && (
        <Conversation className="w-full" initial="auto" resize="auto">
          <ConversationContent className="max-w-3xl mx-auto px-4 pb-[200px]">
            {messages.map(msg => renderMessage(msg))}
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Brain className="h-4 w-4 animate-pulse text-purple-500" />
                <span className="text-sm">Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      )}

      {/* Centered Layout - Empty State */}
      {!hasMessages && (
        <div className="flex flex-col items-center justify-center min-h-screen w-full px-4">
          <div className="w-full max-w-2xl input-container">
            {/* Centered Input */}
            <div className="relative flex flex-col bg-[hsl(var(--color-sidebar))] rounded-2xl p-3 gap-3 focus-within:outline-none border-2 border-border">
              {/* Text input area */}
              <textarea
                ref={textareaRef}
                placeholder="Ask anything..."
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none ring-0 focus:outline-none focus:ring-0 text-base resize-none min-h-[80px] px-2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const value = e.currentTarget.value.trim();
                    if (value) {
                      handleSubmit({ text: value, files: attachments } as any, e as any);
                      e.currentTarget.value = '';
                      setAttachments([]);
                    }
                  }
                }}
              />

              {/* Attached files */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 px-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center gap-1 bg-zinc-700/50 rounded-lg px-2 py-1 text-xs text-zinc-300">
                      <span>{file.name}</span>
                      <button
                        onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                        className="text-zinc-400 hover:text-zinc-200"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Enhanced button row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  {/* Attachment button */}
                  <input
                    type="file"
                    id="file-input-center"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setAttachments(prev => [...prev, ...files]);
                      e.target.value = '';
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => document.getElementById('file-input-center')?.click()}
                    title="Attach files"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>

                  {/* Voice input */}
                  <div className="inline-flex">
                    <PromptInputSpeechButton
                      textareaRef={textareaRef}
                      onTranscriptionChange={handleTranscriptionChange}
                      className="h-9 w-9"
                    />
                  </div>

                  {/* Web search */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5"
                    onClick={handleWebSearch}
                    title="Search the web"
                  >
                    <GlobeIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Search</span>
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Model selector */}
                  <div className="flex items-center gap-2">
                    <ModelSelector
                      onOpenChange={setModelSelectorOpen}
                      open={modelSelectorOpen}
                    >
                      <ModelSelectorTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          {selectedModelData?.name || 'Select Model'}
                        </Button>
                      </ModelSelectorTrigger>
                      <ModelSelectorContent>
                        <ModelSelectorInput placeholder="Search models..." />
                        <ModelSelectorList>
                          <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>

                          {/* Free Models */}
                          <ModelSelectorGroup heading="Free Models" key="free">
                            {POPULAR_MODELS.filter((m) => m.free).map((m) => (
                              <ModelSelectorItem
                                key={m.id}
                                onSelect={() => {
                                  setSelectedModel(m.id);
                                  setModelSelectorOpen(false);
                                }}
                                value={m.id}
                              >
                                <ModelSelectorLogo provider={m.chefSlug} />
                                <ModelSelectorName>{m.name}</ModelSelectorName>
                                <Badge variant="secondary" className="ml-2 text-xs">Free</Badge>
                                {selectedModel === m.id && <CheckIcon className="ml-auto size-4" />}
                              </ModelSelectorItem>
                            ))}
                          </ModelSelectorGroup>

                          {/* Premium Models */}
                          {['OpenAI', 'Anthropic', 'Google', 'xAI', 'DeepSeek', 'Meta'].map((chef) => {
                            const chefModels = POPULAR_MODELS.filter((m) => !m.free && m.chef === chef);
                            if (chefModels.length === 0) return null;

                            return (
                              <ModelSelectorGroup heading={chef} key={chef}>
                                {chefModels.map((m) => (
                                  <ModelSelectorItem
                                    key={m.id}
                                    onSelect={() => {
                                      if (!hasApiKey) {
                                        setModelSelectorOpen(false);
                                        setShowSettings(true);
                                        toast({
                                          title: "API Key Required",
                                          description: `${m.name} requires an OpenRouter API key.`,
                                        });
                                      } else {
                                        setSelectedModel(m.id);
                                        setModelSelectorOpen(false);
                                      }
                                    }}
                                    value={m.id}
                                  >
                                    <ModelSelectorLogo provider={m.chefSlug} />
                                    <ModelSelectorName>{m.name}</ModelSelectorName>
                                    {!hasApiKey && <Lock className="ml-2 h-3 w-3 text-muted-foreground" />}
                                    {selectedModel === m.id && <CheckIcon className="ml-auto size-4" />}
                                  </ModelSelectorItem>
                                ))}
                              </ModelSelectorGroup>
                            );
                          })}
                        </ModelSelectorList>
                      </ModelSelectorContent>
                    </ModelSelector>
                  </div>

                  {/* Send button */}
                  <Button
                    className="gap-2"
                    disabled={isLoading}
                    onClick={() => {
                      const textarea = textareaRef.current;
                      if (textarea && textarea.value.trim()) {
                        handleSubmit({ text: textarea.value, files: attachments } as any, new Event('submit') as any);
                        textarea.value = '';
                        setAttachments([]);
                      }
                    }}
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        <span className="hidden sm:inline">Sending</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        <span className="hidden sm:inline">Send</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Demo Cards - Below Input */}
            <div className={cn("demo-cards w-full", hasMessages && "hidden")} style={{ marginTop: '20px' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
                {DEMO_SUGGESTIONS.map((suggestion) => (
                  <DemoCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onSelect={handleDemoSelect}
                    isLocked={false}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Input Area - When Messages Exist */}
      {hasMessages && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl z-10 px-4 pb-4 input-container">
          {/* Copy Conversation Button */}
          <div className="flex justify-center mb-3">
            <Button
              variant={conversationCopied ? "default" : "outline"}
              size="sm"
              onClick={handleCopyConversation}
              className={cn(
                "transition-all duration-200",
                conversationCopied
                  ? 'bg-green-600 hover:bg-green-700 text-white border-green-600'
                  : ''
              )}
            >
              {conversationCopied ? (
                <>
                  <CheckCheckIcon className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <CopyIcon className="h-4 w-4 mr-2" />
                  Copy Conversation
                </>
              )}
            </Button>
          </div>

        <div className="relative flex flex-col bg-[hsl(var(--color-sidebar))] rounded-2xl p-3 gap-3 focus-within:outline-none border-2 border-border">
          {/* Text input area */}
          <textarea
            ref={textareaRef}
            placeholder="Ask anything..."
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none ring-0 focus:outline-none focus:ring-0 text-base resize-none min-h-[80px] px-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const value = e.currentTarget.value.trim();
                if (value) {
                  handleSubmit({ text: value, files: attachments } as any, e as any);
                  e.currentTarget.value = '';
                  setAttachments([]);
                }
              }
            }}
          />

          {/* Attached files */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-2">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center gap-1 bg-zinc-700/50 rounded-lg px-2 py-1 text-xs text-zinc-300">
                  <span>{file.name}</span>
                  <button
                    onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                    className="text-zinc-400 hover:text-zinc-200"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Enhanced button row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              {/* Attachment button */}
              <input
                type="file"
                id="file-input"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setAttachments(prev => [...prev, ...files]);
                  e.target.value = '';
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => document.getElementById('file-input')?.click()}
                title="Attach files"
              >
                <Plus className="h-4 w-4" />
              </Button>

              {/* Voice input */}
              <div className="inline-flex">
                <PromptInputSpeechButton
                  textareaRef={textareaRef}
                  onTranscriptionChange={handleTranscriptionChange}
                  className="h-9 w-9"
                />
              </div>

              {/* Web search */}
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={handleWebSearch}
                title="Search the web"
              >
                <GlobeIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {/* Model selector */}
              <div className="flex items-center gap-2">
                <ModelSelector
                  onOpenChange={setModelSelectorOpen}
                  open={modelSelectorOpen}
                >
                  <ModelSelectorTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      {selectedModelData?.name || 'Select Model'}
                    </Button>
                  </ModelSelectorTrigger>
                  <ModelSelectorContent>
                    <ModelSelectorInput placeholder="Search models..." />
                    <ModelSelectorList>
                      <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>

                      {/* Free Models */}
                      <ModelSelectorGroup heading="Free Models" key="free">
                        {POPULAR_MODELS.filter((m) => m.free).map((m) => (
                          <ModelSelectorItem
                            key={m.id}
                            onSelect={() => {
                              setSelectedModel(m.id);
                              setModelSelectorOpen(false);
                            }}
                            value={m.id}
                          >
                            <ModelSelectorLogo provider={m.chefSlug} />
                            <ModelSelectorName>{m.name}</ModelSelectorName>
                            <Badge variant="secondary" className="ml-2 text-xs">Free</Badge>
                            {selectedModel === m.id && <CheckIcon className="ml-auto size-4" />}
                          </ModelSelectorItem>
                        ))}
                      </ModelSelectorGroup>

                      {/* Premium Models */}
                      {['OpenAI', 'Anthropic', 'Google', 'xAI', 'DeepSeek', 'Meta'].map((chef) => {
                        const chefModels = POPULAR_MODELS.filter((m) => !m.free && m.chef === chef);
                        if (chefModels.length === 0) return null;

                        return (
                          <ModelSelectorGroup heading={chef} key={chef}>
                            {chefModels.map((m) => (
                              <ModelSelectorItem
                                key={m.id}
                                onSelect={() => {
                                  if (!hasApiKey) {
                                    setModelSelectorOpen(false);
                                    setShowSettings(true);
                                    toast({
                                      title: "API Key Required",
                                      description: `${m.name} requires an OpenRouter API key.`,
                                    });
                                  } else {
                                    setSelectedModel(m.id);
                                    setModelSelectorOpen(false);
                                  }
                                }}
                                value={m.id}
                              >
                                <ModelSelectorLogo provider={m.chefSlug} />
                                <ModelSelectorName>{m.name}</ModelSelectorName>
                                {!hasApiKey && <Lock className="ml-2 h-3 w-3 text-muted-foreground" />}
                                {selectedModel === m.id && <CheckIcon className="ml-auto size-4" />}
                              </ModelSelectorItem>
                            ))}
                          </ModelSelectorGroup>
                        );
                      })}
                    </ModelSelectorList>
                  </ModelSelectorContent>
                </ModelSelector>
              </div>

              {/* Send button */}
              <Button
                className="gap-2"
                disabled={isLoading}
                onClick={() => {
                  const textarea = textareaRef.current;
                  if (textarea && textarea.value.trim()) {
                    handleSubmit({ text: textarea.value, files: attachments } as any, new Event('submit') as any);
                    textarea.value = '';
                    setAttachments([]);
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span className="hidden sm:inline">Sending</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span className="hidden sm:inline">Send</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}