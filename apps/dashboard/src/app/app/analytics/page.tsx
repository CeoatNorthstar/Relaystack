"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Zap,
  AlertCircle,
  Download,
} from "lucide-react";
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs";

const timeRanges = ["24h", "7d", "30d", "90d"];

const mockMetrics = {
  totalRequests: 847293,
  totalTokens: 45892341,
  totalCost: 2847.32,
  avgLatency: 892,
  errorRate: 0.23,
  successRate: 99.77,
};

const mockChartData = {
  requests: [
    { date: "Mon", value: 12400 },
    { date: "Tue", value: 14200 },
    { date: "Wed", value: 11800 },
    { date: "Thu", value: 15600 },
    { date: "Fri", value: 13200 },
    { date: "Sat", value: 9800 },
    { date: "Sun", value: 10200 },
  ],
  providers: [
    { name: "OpenAI", value: 62, color: "#10b981" },
    { name: "Anthropic", value: 25, color: "#f59e0b" },
    { name: "Mistral", value: 10, color: "#8b5cf6" },
    { name: "Other", value: 3, color: "#6b7280" },
  ],
  models: [
    { name: "gpt-4-turbo", requests: 324521, cost: 1245.32 },
    { name: "claude-3-sonnet", requests: 198234, cost: 584.12 },
    { name: "gpt-3.5-turbo", requests: 156789, cost: 89.43 },
    { name: "mistral-large", requests: 89234, cost: 156.78 },
    { name: "claude-3-haiku", requests: 78515, cost: 45.67 },
  ],
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d");

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Analytics</h1>
          <p className="text-white/50">Track your API usage, costs, and performance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-white/10 overflow-hidden">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-sm transition-colors ${
                  timeRange === range
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
        >
          <div className="flex items-center gap-2 text-white/50 mb-2">
            <Zap className="w-4 h-4" />
            <span className="text-sm">Total Requests</span>
          </div>
          <div className="text-3xl font-semibold mb-1">
            {(mockMetrics.totalRequests / 1000).toFixed(1)}K
          </div>
          <div className="flex items-center gap-1 text-sm text-green-400">
            <TrendingUp className="w-3 h-3" />
            +12.5% from last period
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
        >
          <div className="flex items-center gap-2 text-white/50 mb-2">
            <span className="text-sm">📊</span>
            <span className="text-sm">Total Tokens</span>
          </div>
          <div className="text-3xl font-semibold mb-1">
            {(mockMetrics.totalTokens / 1000000).toFixed(1)}M
          </div>
          <div className="flex items-center gap-1 text-sm text-green-400">
            <TrendingUp className="w-3 h-3" />
            +8.2% from last period
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
        >
          <div className="flex items-center gap-2 text-white/50 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Total Cost</span>
          </div>
          <div className="text-3xl font-semibold mb-1">${mockMetrics.totalCost.toLocaleString()}</div>
          <div className="flex items-center gap-1 text-sm text-red-400">
            <TrendingDown className="w-3 h-3" />
            -3.2% from last period
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
        >
          <div className="flex items-center gap-2 text-white/50 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Avg Latency</span>
          </div>
          <div className="text-3xl font-semibold mb-1">{mockMetrics.avgLatency}ms</div>
          <div className="flex items-center gap-1 text-sm text-green-400">
            <TrendingDown className="w-3 h-3" />
            -15ms from last period
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
        >
          <div className="flex items-center gap-2 text-white/50 mb-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Error Rate</span>
          </div>
          <div className="text-3xl font-semibold mb-1">{mockMetrics.errorRate}%</div>
          <div className="flex items-center gap-1 text-sm text-green-400">
            <TrendingDown className="w-3 h-3" />
            -0.05% from last period
          </div>
        </motion.div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request volume chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
        >
          <h3 className="font-semibold mb-6">Request Volume</h3>
          <div className="h-64 flex items-end gap-2">
            {mockChartData.requests.map((day, i) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-cyan-500/80 to-purple-500/80 transition-all hover:from-cyan-400 hover:to-purple-400"
                  style={{ height: `${(day.value / 16000) * 100}%` }}
                />
                <span className="text-xs text-white/40">{day.date}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Provider breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
        >
          <h3 className="font-semibold mb-6">Provider Distribution</h3>
          <div className="space-y-4">
            {mockChartData.providers.map((provider) => (
              <div key={provider.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{provider.name}</span>
                  <span className="text-sm text-white/50">{provider.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${provider.value}%`,
                      backgroundColor: provider.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Model usage table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
      >
        <h3 className="font-semibold mb-6">Top Models by Usage</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-sm font-medium text-white/40">#</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-white/40">Model</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-white/40">Requests</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-white/40">Cost</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-white/40">Share</th>
            </tr>
          </thead>
          <tbody>
            {mockChartData.models.map((model, i) => {
              const totalRequests = mockChartData.models.reduce((acc, m) => acc + m.requests, 0);
              const share = ((model.requests / totalRequests) * 100).toFixed(1);
              return (
                <tr key={model.name} className="border-b border-white/5">
                  <td className="py-3 px-4 text-sm text-white/40">{i + 1}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm">{model.name}</span>
                  </td>
                  <td className="py-3 px-4 text-right text-sm">
                    {model.requests.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-white/60">
                    ${model.cost.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-cyan-400"
                          style={{ width: `${share}%` }}
                        />
                      </div>
                      <span className="text-sm text-white/50 w-12">{share}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>

      {/* Additional charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
        >
          <h3 className="font-semibold mb-6">Latency Distribution</h3>
          <div className="h-40 flex items-end gap-1">
            {[5, 12, 25, 35, 45, 55, 48, 32, 18, 8, 4, 2].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full rounded-t bg-gradient-to-t from-green-500/60 to-cyan-500/60"
                  style={{ height: `${height * 2}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-white/40">
            <span>0ms</span>
            <span>500ms</span>
            <span>1s</span>
            <span>2s</span>
            <span>5s+</span>
          </div>
        </motion.div>

        {/* Error breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
        >
          <h3 className="font-semibold mb-6">Error Breakdown</h3>
          <div className="space-y-4">
            {[
              { type: "Rate Limited (429)", count: 1234, color: "bg-yellow-500" },
              { type: "Server Error (500)", count: 456, color: "bg-red-500" },
              { type: "Timeout", count: 234, color: "bg-orange-500" },
              { type: "Invalid Request (400)", count: 123, color: "bg-purple-500" },
            ].map((error) => (
              <div key={error.type} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${error.color}`} />
                <div className="flex-1">
                  <div className="text-sm">{error.type}</div>
                </div>
                <div className="text-sm text-white/50">{error.count.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
