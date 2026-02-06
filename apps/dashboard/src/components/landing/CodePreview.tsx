"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Copy, Check } from "lucide-react";

const codeExamples = {
  typescript: {
    label: "TypeScript",
    code: `import { RelayStack } from "@relaystack/sdk";

// Initialize with your API key
const relay = new RelayStack({
  apiKey: process.env.RELAY_API_KEY,
});

// Make requests just like OpenAI SDK
const response = await relay.chat.completions.create({
  model: "gpt-4",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "What is the capital of France?" },
  ],
  temperature: 0.7,
  max_tokens: 150,
});

console.log(response.choices[0].message.content);
// → "The capital of France is Paris."

// Access metadata
console.log(response._meta.provider);  // "openai"
console.log(response._meta.latency);   // 245
console.log(response._meta.cost);      // 0.0012`,
  },
  python: {
    label: "Python",
    code: `from relaystack import RelayStack
import os

# Initialize with your API key
relay = RelayStack(api_key=os.environ["RELAY_API_KEY"])

# Make requests just like OpenAI SDK
response = relay.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is the capital of France?"},
    ],
    temperature=0.7,
    max_tokens=150,
)

print(response.choices[0].message.content)
# → "The capital of France is Paris."

# Access metadata
print(response._meta.provider)  # "openai"
print(response._meta.latency)   # 245
print(response._meta.cost)      # 0.0012`,
  },
  curl: {
    label: "cURL",
    code: `curl -X POST https://api.relaystack.io/v1/chat/completions \\
  -H "Authorization: Bearer $RELAY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "What is the capital of France?"}
    ],
    "temperature": 0.7,
    "max_tokens": 150
  }'

# Response:
# {
#   "id": "chatcmpl-abc123",
#   "choices": [{
#     "message": {
#       "role": "assistant",
#       "content": "The capital of France is Paris."
#     }
#   }],
#   "_meta": {
#     "provider": "openai",
#     "latency": 245,
#     "cost": 0.0012
#   }
# }`,
  },
};

export function CodePreview() {
  const [activeTab, setActiveTab] = useState<keyof typeof codeExamples>("typescript");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeExamples[activeTab].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-cyan-400 text-sm uppercase tracking-wider mb-4">SDK</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Drop-in Replacement
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Works with your existing code. Just change the import and add your RelayStack API key.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl" />
          
          <div className="relative bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            {/* Header with tabs */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-1">
                {Object.entries(codeExamples).map(([key, { label }]) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as keyof typeof codeExamples)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === key
                        ? "bg-white/10 text-white"
                        : "text-white/50 hover:text-white/80"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Code content */}
            <div className="p-6 overflow-x-auto">
              <pre className="text-sm font-mono leading-relaxed">
                <code>
                  {codeExamples[activeTab].code.split('\n').map((line, i) => (
                    <div key={i} className="hover:bg-white/5 -mx-6 px-6">
                      {/* Basic syntax highlighting */}
                      {line.includes('import') && (
                        <span>
                          <span className="text-purple-400">import</span>
                          <span className="text-white/70">{line.replace('import', '')}</span>
                        </span>
                      )}
                      {line.includes('from') && !line.includes('import') && (
                        <span>
                          <span className="text-purple-400">from</span>
                          <span className="text-white/70">{line.replace('from', '')}</span>
                        </span>
                      )}
                      {line.includes('const ') && (
                        <span>
                          <span className="text-purple-400">const </span>
                          <span className="text-cyan-300">{line.split('const ')[1].split(' ')[0]}</span>
                          <span className="text-white/70">{line.split('const ')[1].split(' ').slice(1).join(' ')}</span>
                        </span>
                      )}
                      {line.includes('await ') && !line.includes('const') && (
                        <span>
                          <span className="text-purple-400">await </span>
                          <span className="text-white/70">{line.replace('await ', '')}</span>
                        </span>
                      )}
                      {line.includes('console.log') && (
                        <span>
                          <span className="text-cyan-300">console</span>
                          <span className="text-white/70">.log{line.split('console.log')[1]}</span>
                        </span>
                      )}
                      {line.includes('// ') && (
                        <span className="text-white/30">{line}</span>
                      )}
                      {line.includes('# ') && (
                        <span className="text-white/30">{line}</span>
                      )}
                      {line.includes('curl') && (
                        <span className="text-cyan-300">{line}</span>
                      )}
                      {!line.includes('import') && 
                       !line.includes('from') && 
                       !line.includes('const ') && 
                       !line.includes('await ') && 
                       !line.includes('console.log') && 
                       !line.includes('// ') &&
                       !line.includes('# ') &&
                       !line.includes('curl') && (
                        <span className="text-white/70">{line}</span>
                      )}
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </div>
        </motion.div>

        {/* Install command */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 flex justify-center"
        >
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-xl border border-white/10 bg-white/[0.02]">
            <span className="text-white/40 text-sm">Install:</span>
            <code className="text-sm font-mono text-cyan-400">npm install @relaystack/sdk</code>
            <button
              onClick={() => {
                navigator.clipboard.writeText("npm install @relaystack/sdk");
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="text-white/40 hover:text-white transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
