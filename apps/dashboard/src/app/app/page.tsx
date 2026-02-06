"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Plus,
  ArrowRight,
} from "lucide-react";
import { api, getApiKey } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs";

// Mock data for demo
const mockStats = {
  totalRequests: 125847,
  requestsChange: 12.5,
  successRate: 99.2,
  successRateChange: 0.3,
  avgLatency: 245,
  latencyChange: -8.2,
  totalCost: 142.50,
  costChange: 15.3,
};

const mockRecentRequests = [
  { id: "req_1", model: "gpt-4", provider: "OpenAI", status: "success", latency: 234, tokens: 156, cost: 0.012, time: "2 min ago" },
  { id: "req_2", model: "claude-3-sonnet", provider: "Anthropic", status: "success", latency: 312, tokens: 203, cost: 0.008, time: "5 min ago" },
  { id: "req_3", model: "gpt-4o-mini", provider: "OpenAI", status: "success", latency: 145, tokens: 89, cost: 0.002, time: "8 min ago" },
  { id: "req_4", model: "gemini-1.5-pro", provider: "Google", status: "error", latency: 0, tokens: 0, cost: 0, time: "12 min ago" },
  { id: "req_5", model: "gpt-4", provider: "OpenAI", status: "rate_limited", latency: 12, tokens: 0, cost: 0, time: "15 min ago" },
];

const mockProviderUsage = [
  { name: "OpenAI", requests: 45230, percentage: 36 },
  { name: "Anthropic", requests: 38120, percentage: 30 },
  { name: "Google", requests: 25340, percentage: 20 },
  { name: "Mistral", requests: 17157, percentage: 14 },
];

function StatCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  format = "number" 
}: { 
  title: string; 
  value: number; 
  change: number; 
  icon: any;
  format?: "number" | "percent" | "currency" | "ms";
}) {
  const formatValue = () => {
    switch (format) {
      case "percent": return `${value}%`;
      case "currency": return `$${value.toFixed(2)}`;
      case "ms": return `${value}ms`;
      default: return value.toLocaleString();
    }
  };

  const isPositive = change > 0;
  const changeColor = format === "ms" 
    ? (isPositive ? "text-red-400" : "text-green-400")
    : (isPositive ? "text-green-400" : "text-red-400");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-white/5">
          <Icon className="w-5 h-5 text-white/60" />
        </div>
        <div className={`flex items-center gap-1 text-sm ${changeColor}`}>
          {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {Math.abs(change)}%
        </div>
      </div>
      <div className="text-3xl font-semibold mb-1">{formatValue()}</div>
      <div className="text-sm text-white/40">{title}</div>
    </motion.div>
  );
}

export default function OverviewPage() {
  const { accessToken } = useAuth();
  const currentToken = accessToken || getApiKey();

  const { data: health } = useQuery({
    queryKey: ["health"],
    queryFn: api.health,
    refetchInterval: 30000,
    enabled: !!currentToken,
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Welcome back</h1>
          <p className="text-white/50">Here's what's happening with your AI infrastructure</p>
        </div>
        <Link
          href="/app/projects/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Requests"
          value={mockStats.totalRequests}
          change={mockStats.requestsChange}
          icon={Activity}
        />
        <StatCard
          title="Success Rate"
          value={mockStats.successRate}
          change={mockStats.successRateChange}
          icon={CheckCircle2}
          format="percent"
        />
        <StatCard
          title="Avg Latency"
          value={mockStats.avgLatency}
          change={mockStats.latencyChange}
          icon={Clock}
          format="ms"
        />
        <StatCard
          title="Total Cost"
          value={mockStats.totalCost}
          change={mockStats.costChange}
          icon={DollarSign}
          format="currency"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request volume chart placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">Request Volume</h3>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm rounded-lg bg-white/10 text-white">24h</button>
              <button className="px-3 py-1 text-sm rounded-lg text-white/50 hover:bg-white/5">7d</button>
              <button className="px-3 py-1 text-sm rounded-lg text-white/50 hover:bg-white/5">30d</button>
            </div>
          </div>
          {/* Chart placeholder */}
          <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-xl">
            <div className="text-center text-white/30">
              <BarChart3 className="w-12 h-12 mx-auto mb-2" />
              <p>Request volume chart</p>
              <p className="text-sm">(Coming soon)</p>
            </div>
          </div>
        </motion.div>

        {/* Provider usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm"
        >
          <h3 className="font-semibold mb-6">Provider Usage</h3>
          <div className="space-y-4">
            {mockProviderUsage.map((provider) => (
              <div key={provider.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">{provider.name}</span>
                  <span className="text-sm text-white/50">{provider.percentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                    style={{ width: `${provider.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent requests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold">Recent Requests</h3>
          <Link href="/app/logs" className="flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-sm font-medium text-white/40">Request ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-white/40">Model</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-white/40">Provider</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-white/40">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-white/40">Latency</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-white/40">Tokens</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-white/40">Cost</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-white/40">Time</th>
              </tr>
            </thead>
            <tbody>
              {mockRecentRequests.map((req) => (
                <tr key={req.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-mono text-sm">{req.id}</td>
                  <td className="py-3 px-4 text-sm">{req.model}</td>
                  <td className="py-3 px-4 text-sm">{req.provider}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                      req.status === "success" 
                        ? "bg-green-500/20 text-green-400" 
                        : req.status === "error"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {req.status === "success" && <CheckCircle2 className="w-3 h-3" />}
                      {req.status === "error" && <AlertTriangle className="w-3 h-3" />}
                      {req.status === "rate_limited" && <Zap className="w-3 h-3" />}
                      {req.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-white/60">{req.latency}ms</td>
                  <td className="py-3 px-4 text-sm text-white/60">{req.tokens}</td>
                  <td className="py-3 px-4 text-sm text-white/60">${req.cost.toFixed(3)}</td>
                  <td className="py-3 px-4 text-sm text-white/40">{req.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* System status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-3 h-3 rounded-full ${health?.status === "ok" ? "bg-green-400" : "bg-red-400"}`} />
            <span className="font-medium">Gateway API</span>
          </div>
          <p className="text-sm text-white/40">{health?.status === "ok" ? "Operational" : "Issues detected"}</p>
        </div>
        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-3 h-3 rounded-full ${health?.db === "ok" ? "bg-green-400" : "bg-red-400"}`} />
            <span className="font-medium">Database</span>
          </div>
          <p className="text-sm text-white/40">{health?.db === "ok" ? "Connected" : "Connection issues"}</p>
        </div>
        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-3 h-3 rounded-full ${health?.redis === "ok" || health?.redis === "not_configured" ? "bg-green-400" : "bg-red-400"}`} />
            <span className="font-medium">Rate Limiting</span>
          </div>
          <p className="text-sm text-white/40">
            {health?.redis === "ok" ? "Redis connected" : health?.redis === "not_configured" ? "Using Cloudflare KV" : "Issues detected"}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
