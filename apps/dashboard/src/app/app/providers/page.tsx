"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plug,
  Check,
  X,
  Settings,
  Plus,
  Eye,
  EyeOff,
  TestTube,
  AlertCircle,
} from "lucide-react";
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs";

const providers = [
  {
    id: "openai",
    name: "OpenAI",
    logo: "🟢",
    description: "GPT-4, GPT-3.5, DALL-E, Whisper",
    configured: true,
    models: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"],
    status: "healthy",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    logo: "🔶",
    description: "Claude 3 Opus, Sonnet, Haiku",
    configured: true,
    models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
    status: "healthy",
  },
  {
    id: "google",
    name: "Google AI",
    logo: "🔵",
    description: "Gemini Pro, Gemini Ultra",
    configured: false,
    models: ["gemini-1.5-pro", "gemini-1.5-flash"],
    status: "not_configured",
  },
  {
    id: "azure",
    name: "Azure OpenAI",
    logo: "🔷",
    description: "Azure-hosted OpenAI models",
    configured: false,
    models: ["gpt-4", "gpt-35-turbo"],
    status: "not_configured",
  },
  {
    id: "mistral",
    name: "Mistral",
    logo: "🟣",
    description: "Mistral Large, Medium, Small",
    configured: true,
    models: ["mistral-large", "mistral-medium", "mistral-small"],
    status: "healthy",
  },
  {
    id: "cohere",
    name: "Cohere",
    logo: "🔴",
    description: "Command, Embed, Rerank",
    configured: false,
    models: ["command", "command-light", "embed"],
    status: "not_configured",
  },
  {
    id: "groq",
    name: "Groq",
    logo: "⚡",
    description: "Ultra-fast inference",
    configured: false,
    models: ["llama-3-70b", "mixtral-8x7b"],
    status: "not_configured",
  },
  {
    id: "bedrock",
    name: "AWS Bedrock",
    logo: "🟡",
    description: "Claude, Llama, Titan",
    configured: false,
    models: ["anthropic.claude-v2", "meta.llama2-70b"],
    status: "not_configured",
  },
];

export default function ProvidersPage() {
  const [configureModal, setConfigureModal] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [testingConnection, setTestingConnection] = useState(false);

  const selectedProvider = providers.find((p) => p.id === configureModal);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    // Simulate test
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setTestingConnection(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <Breadcrumbs />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold mb-1">AI Providers</h1>
        <p className="text-white/50">
          Configure your AI provider API keys. RelayStack will route requests to these providers.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="text-3xl font-semibold mb-1">
            {providers.filter((p) => p.configured).length}
          </div>
          <div className="text-sm text-white/50">Configured Providers</div>
        </div>
        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="text-3xl font-semibold mb-1">
            {providers.filter((p) => p.status === "healthy").length}
          </div>
          <div className="text-sm text-white/50">Healthy Connections</div>
        </div>
        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="text-3xl font-semibold mb-1">
            {providers.reduce((acc, p) => acc + p.models.length, 0)}
          </div>
          <div className="text-sm text-white/50">Available Models</div>
        </div>
      </div>

      {/* Provider grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {providers.map((provider, index) => (
          <motion.div
            key={provider.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-6 rounded-2xl border ${
              provider.configured
                ? "border-green-500/30 bg-green-500/5"
                : "border-white/10 bg-white/[0.02]"
            } hover:border-white/20 transition-all`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">{provider.logo}</div>
              {provider.configured ? (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">
                  <Check className="w-3 h-3" />
                  Active
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-white/40 text-xs">
                  <X className="w-3 h-3" />
                  Not configured
                </div>
              )}
            </div>

            <h3 className="font-semibold mb-1">{provider.name}</h3>
            <p className="text-sm text-white/50 mb-4">{provider.description}</p>

            {/* Models */}
            <div className="flex flex-wrap gap-1 mb-4">
              {provider.models.slice(0, 3).map((model) => (
                <span
                  key={model}
                  className="px-2 py-0.5 rounded text-xs bg-white/5 text-white/60"
                >
                  {model}
                </span>
              ))}
              {provider.models.length > 3 && (
                <span className="px-2 py-0.5 rounded text-xs bg-white/5 text-white/40">
                  +{provider.models.length - 3}
                </span>
              )}
            </div>

            <button
              onClick={() => setConfigureModal(provider.id)}
              className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                provider.configured
                  ? "bg-white/10 hover:bg-white/15"
                  : "bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90"
              }`}
            >
              {provider.configured ? "Manage" : "Configure"}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Configure modal */}
      {configureModal && selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setConfigureModal(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg p-6 rounded-2xl border border-white/10 bg-black/95 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">{selectedProvider.logo}</span>
              <div>
                <h2 className="text-xl font-semibold">{selectedProvider.name}</h2>
                <p className="text-sm text-white/50">{selectedProvider.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">API Key</label>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    placeholder={`Enter your ${selectedProvider.name} API key`}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="w-full px-4 py-3 pr-20 rounded-lg bg-white/5 border border-white/10 text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/10"
                  >
                    {showApiKey ? (
                      <EyeOff className="w-4 h-4 text-white/40" />
                    ) : (
                      <Eye className="w-4 h-4 text-white/40" />
                    )}
                  </button>
                </div>
              </div>

              {selectedProvider.id === "azure" && (
                <>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Endpoint URL</label>
                    <input
                      type="text"
                      placeholder="https://your-resource.openai.azure.com"
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Deployment Name</label>
                    <input
                      type="text"
                      placeholder="gpt-4-deployment"
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20"
                    />
                  </div>
                </>
              )}

              {/* Test connection */}
              <button
                onClick={handleTestConnection}
                disabled={testingConnection || !apiKeyInput}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                <TestTube className={`w-4 h-4 ${testingConnection ? "animate-pulse" : ""}`} />
                {testingConnection ? "Testing..." : "Test Connection"}
              </button>

              {/* Available models */}
              <div>
                <label className="block text-sm text-white/60 mb-2">Available Models</label>
                <div className="flex flex-wrap gap-2">
                  {selectedProvider.models.map((model) => (
                    <span
                      key={model}
                      className="px-3 py-1 rounded-lg bg-white/5 text-sm text-white/70"
                    >
                      {model}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-3 mt-6">
              {selectedProvider.configured && (
                <button className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
                  Remove
                </button>
              )}
              <div className="flex gap-3 ml-auto">
                <button
                  onClick={() => setConfigureModal(null)}
                  className="px-4 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity">
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
