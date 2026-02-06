"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for side projects and experiments",
    features: [
      "1 organization",
      "1 project",
      "2 environments (dev/prod)",
      "50,000 requests/month",
      "7-day log retention",
      "1 seat",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    description: "For small teams shipping to production",
    features: [
      "1 organization",
      "3 projects",
      "500,000 requests/month",
      "30-day log retention",
      "5 seats",
      "Budgets + kill switches",
      "Request replay",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$299",
    period: "/month",
    description: "For growing teams with advanced needs",
    features: [
      "1 organization",
      "10 projects",
      "5,000,000 requests/month",
      "90-day log retention",
      "20 seats",
      "Advanced routing rules",
      "Per-route retries/timeouts",
      "Forced fallback config",
    ],
    cta: "Get Started",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    price: "$2,000",
    period: "/month",
    description: "For large organizations with compliance needs",
    features: [
      "Unlimited organizations",
      "Unlimited projects",
      "25,000,000 requests/month",
      "365-day log retention",
      "Unlimited seats",
      "Audit export (CSV/JSON)",
      "Dedicated support SLA",
      "SSO & SAML",
      "Custom contracts",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-emerald-400 text-sm uppercase tracking-wider mb-4">Pricing</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            Start free, scale as you grow. No hidden fees, no surprises.
          </p>
        </motion.div>

        {/* Pricing grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl ${
                plan.highlighted
                  ? "border-2 border-cyan-500/50"
                  : "border border-white/10"
              } bg-white/[0.02] backdrop-blur-sm overflow-hidden`}
            >
              {plan.badge && (
                <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-cyan-500 to-purple-500 text-xs font-medium rounded-bl-lg">
                  {plan.badge}
                </div>
              )}

              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-white/40">{plan.period}</span>
                </div>
                <p className="text-sm text-white/50 mb-6">{plan.description}</p>

                <Link
                  href={plan.name === "Enterprise" ? "/contact" : "/login"}
                  className={`block w-full py-2.5 rounded-lg text-center font-medium text-sm transition-colors ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:opacity-90"
                      : "bg-white/10 hover:bg-white/15"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>

              <div className="border-t border-white/10 p-6">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white/70">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Overage note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-4 px-6 py-4 rounded-xl border border-white/10 bg-white/[0.02]">
            <div className="text-left">
              <div className="text-sm font-medium mb-1">Overage pricing (all paid plans)</div>
              <div className="text-sm text-white/50">
                <span className="text-cyan-400">$0.15</span> per additional 1,000 requests
                <span className="text-white/30 ml-2">•</span>
                <span className="ml-2">1M extra = $150</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* FAQ teaser */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-white/40 text-sm">
            Have questions?{" "}
            <Link href="/contact" className="text-cyan-400 hover:underline">
              Contact us
            </Link>
            {" "}or check our{" "}
            <Link href="/docs/faq" className="text-cyan-400 hover:underline">
              FAQ
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
