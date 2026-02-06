"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Check, X, AlertTriangle, DollarSign } from "lucide-react";

const scenarios = [
  {
    id: "success",
    title: "Normal Request",
    description: "Request routed to OpenAI, response returned successfully",
    icon: Check,
    iconColor: "text-green-400",
    iconBg: "bg-green-400/10",
    code: `// Your code
const response = await relay.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "Hello!" }],
});`,
    response: {
      status: 200,
      provider: "OpenAI",
      model: "gpt-4",
      latency: "245ms",
      tokens: 42,
      cost: "$0.0012",
      output: `{
  "id": "chatcmpl-abc123",
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "Hello! How can I help you today?"
    }
  }],
  "usage": { "total_tokens": 42 }
}`,
    },
  },
  {
    id: "fallback",
    title: "Automatic Fallback",
    description: "OpenAI times out, automatically switches to Anthropic",
    icon: AlertTriangle,
    iconColor: "text-yellow-400",
    iconBg: "bg-yellow-400/10",
    code: `// Same code - no changes needed
const response = await relay.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "Hello!" }],
});`,
    response: {
      status: 200,
      provider: "Anthropic (fallback)",
      model: "claude-3-sonnet",
      latency: "892ms",
      tokens: 38,
      cost: "$0.0009",
      output: `{
  "id": "msg-xyz789",
  "choices": [{
    "message": {
      "role": "assistant", 
      "content": "Hello! I'm here to help."
    }
  }],
  "_meta": { "fallback": true, "reason": "timeout" }
}`,
    },
  },
  {
    id: "ratelimit",
    title: "Rate Limit Protection",
    description: "Request exceeds rate limit, blocked before hitting provider",
    icon: X,
    iconColor: "text-red-400",
    iconBg: "bg-red-400/10",
    code: `// 101st request in the last minute
const response = await relay.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "Hello!" }],
});`,
    response: {
      status: 429,
      provider: "—",
      model: "—",
      latency: "12ms",
      tokens: 0,
      cost: "$0.00",
      output: `{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit: 100 req/min exceeded",
    "retry_after": 45
  }
}`,
    },
  },
  {
    id: "cost",
    title: "Cost Optimization",
    description: "Same request, different providers - see the cost difference",
    icon: DollarSign,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-400/10",
    code: `// Route to cheapest provider
const response = await relay.chat.completions.create({
  model: "gpt-4",
  routing: { strategy: "cost" },
  messages: [{ role: "user", content: "Summarize..." }],
});`,
    response: {
      status: 200,
      provider: "Mistral",
      model: "mistral-large",
      latency: "312ms",
      tokens: 156,
      cost: "$0.0008",
      output: `{
  "choices": [{
    "message": {
      "content": "Here's a summary..."
    }
  }],
  "_meta": {
    "routing": "cost",
    "savings": "62% vs gpt-4"
  }
}`,
    },
  },
];

export function InteractiveDemo() {
  const [activeScenario, setActiveScenario] = useState(scenarios[0]);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedResponse, setDisplayedResponse] = useState("");

  useEffect(() => {
    setIsTyping(true);
    setDisplayedResponse("");
    
    const response = activeScenario.response.output;
    let index = 0;
    
    const timer = setInterval(() => {
      if (index < response.length) {
        setDisplayedResponse(response.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 10);

    return () => clearInterval(timer);
  }, [activeScenario]);

  return (
    <section id="demo" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-purple-400 text-sm uppercase tracking-wider mb-4">Interactive Demo</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            See It In Action
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Experience how RelayStack handles different scenarios in production.
          </p>
        </motion.div>

        {/* Scenario tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => setActiveScenario(scenario)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                activeScenario.id === scenario.id
                  ? "bg-white/10 border-white/20"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              <div className={`w-6 h-6 rounded-md ${scenario.iconBg} flex items-center justify-center`}>
                <scenario.icon className={`w-4 h-4 ${scenario.iconColor}`} />
              </div>
              <span className="text-sm font-medium">{scenario.title}</span>
            </button>
          ))}
        </div>

        {/* Demo content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScenario.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid lg:grid-cols-2 gap-6"
          >
            {/* Code panel */}
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-4 text-xs text-white/40">your-app.ts</span>
              </div>
              <div className="p-6">
                <pre className="text-sm font-mono">
                  <code className="text-white/70">{activeScenario.code}</code>
                </pre>
              </div>
              <div className="px-6 pb-6">
                <p className="text-sm text-white/40">{activeScenario.description}</p>
              </div>
            </div>

            {/* Response panel */}
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-mono ${
                    activeScenario.response.status === 200 
                      ? "bg-green-500/20 text-green-400" 
                      : "bg-red-500/20 text-red-400"
                  }`}>
                    {activeScenario.response.status}
                  </span>
                  <span className="text-xs text-white/40">Response</span>
                </div>
                {isTyping && (
                  <span className="text-xs text-cyan-400 animate-pulse">Processing...</span>
                )}
              </div>

              {/* Response stats */}
              <div className="grid grid-cols-4 gap-4 p-4 border-b border-white/10 bg-white/[0.01]">
                <div>
                  <div className="text-xs text-white/40 mb-1">Provider</div>
                  <div className="text-sm font-medium">{activeScenario.response.provider}</div>
                </div>
                <div>
                  <div className="text-xs text-white/40 mb-1">Latency</div>
                  <div className="text-sm font-medium text-cyan-400">{activeScenario.response.latency}</div>
                </div>
                <div>
                  <div className="text-xs text-white/40 mb-1">Tokens</div>
                  <div className="text-sm font-medium">{activeScenario.response.tokens}</div>
                </div>
                <div>
                  <div className="text-xs text-white/40 mb-1">Cost</div>
                  <div className="text-sm font-medium text-emerald-400">{activeScenario.response.cost}</div>
                </div>
              </div>

              {/* Response body */}
              <div className="p-6">
                <pre className="text-sm font-mono overflow-x-auto">
                  <code className="text-white/70">
                    {displayedResponse}
                    {isTyping && <span className="animate-pulse">|</span>}
                  </code>
                </pre>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
