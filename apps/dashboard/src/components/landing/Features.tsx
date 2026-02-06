"use client";

import { motion } from "framer-motion";
import { 
  Zap, 
  Shield, 
  BarChart3, 
  RefreshCcw, 
  DollarSign, 
  Layers,
  Clock,
  Lock
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Smart Routing",
    description: "Automatically route requests to the best provider based on latency, cost, or custom rules.",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
  },
  {
    icon: RefreshCcw,
    title: "Instant Fallbacks",
    description: "Zero downtime with automatic failover. If one provider fails, we switch instantly.",
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
  },
  {
    icon: BarChart3,
    title: "Real-time Logging",
    description: "Every request tracked with latency, tokens, cost, and full request/response data.",
    color: "text-green-400",
    bgColor: "bg-green-400/10",
  },
  {
    icon: Shield,
    title: "Rate Limiting",
    description: "Built-in protection against abuse. Set limits per API key, user, or globally.",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
  },
  {
    icon: DollarSign,
    title: "Cost Analytics",
    description: "Track spend per model, project, and user. Set budgets and kill switches.",
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
  },
  {
    icon: Layers,
    title: "Multi-Provider",
    description: "OpenAI, Anthropic, Google, Azure, Bedrock, Mistral, and more. One unified API.",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
  {
    icon: Clock,
    title: "Request Replay",
    description: "Debug issues by replaying any historical request. Perfect for troubleshooting.",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "SOC2 compliant, audit logs, SSO, and role-based access control.",
    color: "text-red-400",
    bgColor: "bg-red-400/10",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-cyan-400 text-sm uppercase tracking-wider mb-4">Features</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Scale AI
            </span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Built for production workloads. Trusted by startups and enterprises alike.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="h-full p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
