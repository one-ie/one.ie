/**
 * Free Tier Chat Component (OpenRouter)
 * 
 * Access to all AI models through OpenRouter
 */

import { useState } from 'react';
import { useClientChat } from '@/hooks/ai/basic/useClientChat';

const POPULAR_MODELS = [
  { id: 'openai/gpt-4', name: 'GPT-4 (OpenAI)' },
  { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo (OpenAI)' },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus (Anthropic)' },
  { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet (Anthropic)' },
  { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B (Meta)' },
  { id: 'google/gemini-pro', name: 'Gemini Pro (Google)' },
];

export function FreeChatExample() {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('openai/gpt-4');
  const [chatStarted, setChatStarted] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useClientChat({
    apiKey,
    model: selectedModel,
  });

  if (!chatStarted) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Start Free Chat</h2>
        <p className="text-gray-600 mb-4">
          Enter your OpenRouter API key to access all AI models. Your key is only used 
          client-side and never stored on our servers.
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">OpenRouter API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-or-v1-..."
            className="w-full px-4 py-2 border rounded"
          />
          <p className="text-xs text-gray-500 mt-1">
            Get your key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenRouter</a>
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Select Model</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          >
            {POPULAR_MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => apiKey && setChatStarted(true)}
          disabled={!apiKey}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-300"
        >
          Start Chat
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Free Tier Chat</h2>
          <p className="text-sm text-gray-600">
            Model: {POPULAR_MODELS.find(m => m.id === selectedModel)?.name}
          </p>
        </div>
        <button
          onClick={() => setChatStarted(false)}
          className="text-sm text-blue-600 hover:underline"
        >
          Change Model
        </button>
      </div>

      {/* Messages */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4 min-h-[400px] max-h-[600px] overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-gray-500 text-center">Start a conversation...</p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-3 p-3 rounded ${
              message.role === 'user' 
                ? 'bg-blue-100 ml-12' 
                : 'bg-white mr-12 shadow-sm'
            }`}
          >
            <div className="text-sm font-medium mb-1 text-gray-600">
              {message.role === 'user' ? 'You' : 'AI'}
            </div>
            <div className="text-gray-900 whitespace-pre-wrap">{message.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="text-gray-500 text-center animate-pulse">AI is thinking...</div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded mb-4">
          <strong>Error:</strong> {error.message}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>

      {/* Upgrade prompt */}
      {messages.length > 10 && (
        <div className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            <div className="flex-1">
              <p className="font-semibold mb-1">💡 Upgrade to Premium</p>
              <p className="text-sm opacity-90">
                Your messages will be lost on page refresh. 
                <a href="/upgrade" className="underline ml-1 font-medium">Enable persistence for $29/mo</a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Messages are ephemeral (lost on refresh). Using OpenRouter with your API key.
      </div>
    </div>
  );
}
