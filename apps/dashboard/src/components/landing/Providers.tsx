"use client";

import { motion } from "framer-motion";

const providers = [
  { name: "OpenAI", logo: "🟢", color: "from-green-400 to-emerald-600" },
  { name: "Anthropic", logo: "🔶", color: "from-orange-400 to-amber-600" },
  { name: "Google AI", logo: "🔵", color: "from-blue-400 to-blue-600" },
  { name: "Azure", logo: "🔷", color: "from-cyan-400 to-blue-500" },
  { name: "AWS Bedrock", logo: "🟡", color: "from-yellow-400 to-orange-500" },
  { name: "Mistral", logo: "🟣", color: "from-purple-400 to-violet-600" },
  { name: "Cohere", logo: "🔴", color: "from-red-400 to-rose-600" },
  { name: "Groq", logo: "⚡", color: "from-pink-400 to-fuchsia-600" },
];

export function Providers() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-white/40 text-sm uppercase tracking-wider mb-4">Integrations</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            One SDK. Every Provider.
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Connect to any AI provider with a single integration. Switch models instantly, 
            no code changes required.
          </p>
        </motion.div>

        {/* Provider grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {providers.map((provider, index) => (
            <motion.div
              key={provider.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group relative"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${provider.color} opacity-0 group-hover:opacity-20 rounded-xl blur-xl transition-opacity duration-300`} />
              <div className="relative p-6 rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-sm hover:border-white/20 transition-all duration-300">
                <div className="text-4xl mb-3">{provider.logo}</div>
                <div className="font-medium text-white/80">{provider.name}</div>
                <div className="text-xs text-white/40 mt-1">Supported</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Custom models note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-white/60">
            <span className="text-purple-400">+</span>
            Custom models & self-hosted LLMs supported
          </div>
        </motion.div>
      </div>
    </section>
  );
}
