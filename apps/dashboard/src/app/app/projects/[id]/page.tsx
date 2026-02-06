"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Settings,
  Globe,
  Key,
  GitBranch,
  Activity,
  Clock,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  Trash2,
  Power,
} from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs";

const mockProject = {
  id: "proj_abc123",
  name: "Production API",
  description: "Main production API gateway for all services",
  status: "active",
  createdAt: "2024-01-15",
  environments: [
    {
      id: "env_1",
      name: "production",
      url: "https://api.example.com",
      apiKey: "rsk_live_abc123def456ghi789jkl012",
      requests24h: 125432,
      status: "active",
    },
    {
      id: "env_2",
      name: "staging",
      url: "https://staging-api.example.com",
      apiKey: "rsk_test_xyz789abc123def456ghi789",
      requests24h: 8234,
      status: "active",
    },
    {
      id: "env_3",
      name: "development",
      url: "https://dev-api.example.com",
      apiKey: "rsk_dev_mno345pqr678stu901vwx234",
      requests24h: 1234,
      status: "active",
    },
  ],
  routes: [
    {
      id: "route_1",
      path: "/chat/completions",
      primaryProvider: "OpenAI",
      fallbackProvider: "Anthropic",
      timeout: 30000,
      retries: 3,
    },
    {
      id: "route_2",
      path: "/embeddings",
      primaryProvider: "OpenAI",
      fallbackProvider: null,
      timeout: 10000,
      retries: 1,
    },
  ],
  stats: {
    requests24h: 134900,
    successRate: 99.8,
    avgLatency: 892,
    cost24h: 234.56,
  },
  budget: {
    limit: 5000,
    current: 2847.32,
    killSwitch: true,
  },
};

const tabs = ["Overview", "Environments", "Routes", "Settings"];

export default function ProjectDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState("Overview");
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleReveal = (id: string) => {
    setRevealedKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const copyKey = (id: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const maskKey = (key: string) => key.slice(0, 12) + "••••••••••••" + key.slice(-4);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/app/projects"
            className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors mt-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-semibold">{mockProject.name}</h1>
              <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">
                Active
              </span>
            </div>
            <p className="text-white/50">{mockProject.description}</p>
            <p className="text-sm text-white/30 mt-1">ID: {mockProject.id}</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-colors">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-px">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 border-b-2 transition-colors ${
              activeTab === tab
                ? "border-cyan-400 text-white"
                : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "Overview" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-2 text-white/50 mb-2">
                <Activity className="w-4 h-4" />
                <span className="text-sm">Requests (24h)</span>
              </div>
              <div className="text-3xl font-semibold">{(mockProject.stats.requests24h / 1000).toFixed(1)}K</div>
            </div>
            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-2 text-white/50 mb-2">
                <Check className="w-4 h-4" />
                <span className="text-sm">Success Rate</span>
              </div>
              <div className="text-3xl font-semibold text-green-400">{mockProject.stats.successRate}%</div>
            </div>
            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-2 text-white/50 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Avg Latency</span>
              </div>
              <div className="text-3xl font-semibold">{mockProject.stats.avgLatency}ms</div>
            </div>
            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-2 text-white/50 mb-2">
                <span className="text-sm">💰</span>
                <span className="text-sm">Cost (24h)</span>
              </div>
              <div className="text-3xl font-semibold">${mockProject.stats.cost24h}</div>
            </div>
          </div>

          {/* Budget status */}
          <div className={`p-6 rounded-2xl border ${
            mockProject.budget.current / mockProject.budget.limit > 0.75
              ? "border-yellow-500/30 bg-yellow-500/5"
              : "border-white/10 bg-white/[0.02]"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Budget Status</h3>
              {mockProject.budget.killSwitch && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs">
                  <Power className="w-3 h-3" />
                  Kill Switch Active
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/50">${mockProject.budget.current.toLocaleString()} spent</span>
              <span className="text-sm">{((mockProject.budget.current / mockProject.budget.limit) * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                style={{ width: `${(mockProject.budget.current / mockProject.budget.limit) * 100}%` }}
              />
            </div>
            <div className="text-sm text-white/40 mt-2">Monthly limit: ${mockProject.budget.limit.toLocaleString()}</div>
          </div>
        </motion.div>
      )}

      {/* Environments Tab */}
      {activeTab === "Environments" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-end">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" />
              Add Environment
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockProject.environments.map((env) => (
              <div
                key={env.id}
                className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-white/40" />
                    <span className="font-semibold capitalize">{env.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    env.name === "production"
                      ? "bg-green-500/20 text-green-400"
                      : env.name === "staging"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-white/10 text-white/60"
                  }`}>
                    {env.name}
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-white/40 mb-1">URL</div>
                    <div className="text-white/70 truncate">{env.url}</div>
                  </div>
                  <div>
                    <div className="text-white/40 mb-1">API Key</div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-white/60 truncate">
                        {revealedKeys.has(env.id) ? env.apiKey : maskKey(env.apiKey)}
                      </code>
                      <button onClick={() => toggleReveal(env.id)} className="p-1 hover:bg-white/10 rounded">
                        {revealedKeys.has(env.id) ? (
                          <EyeOff className="w-3 h-3 text-white/40" />
                        ) : (
                          <Eye className="w-3 h-3 text-white/40" />
                        )}
                      </button>
                      <button
                        onClick={() => copyKey(env.id, env.apiKey)}
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        {copiedId === env.id ? (
                          <Check className="w-3 h-3 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-white/40" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="text-white/40 mb-1">Requests (24h)</div>
                    <div className="text-white/70">{env.requests24h.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Routes Tab */}
      {activeTab === "Routes" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-end">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" />
              Add Route
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-6 text-sm font-medium text-white/40">Path</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-white/40">Primary</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-white/40">Fallback</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-white/40">Timeout</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-white/40">Retries</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-white/40">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockProject.routes.map((route) => (
                  <tr key={route.id} className="border-b border-white/5">
                    <td className="py-4 px-6">
                      <code className="text-sm font-mono text-cyan-400">{route.path}</code>
                    </td>
                    <td className="py-4 px-6 text-sm">{route.primaryProvider}</td>
                    <td className="py-4 px-6 text-sm text-white/50">{route.fallbackProvider || "—"}</td>
                    <td className="py-4 px-6 text-sm text-white/50">{route.timeout / 1000}s</td>
                    <td className="py-4 px-6 text-sm text-white/50">{route.retries}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white">
                          <Settings className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Settings Tab */}
      {activeTab === "Settings" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
            <h3 className="font-semibold mb-6">Project Details</h3>
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-sm text-white/60 mb-2">Project Name</label>
                <input
                  type="text"
                  defaultValue={mockProject.name}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/20"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Description</label>
                <textarea
                  defaultValue={mockProject.description}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/20 resize-none"
                />
              </div>
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity">
                Save Changes
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-red-500/30 bg-red-500/5">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-4 h-4" />
              Danger Zone
            </h3>
            <p className="text-sm text-white/50 mb-4">
              Deleting this project will remove all environments, routes, and API keys. This action cannot be undone.
            </p>
            <button className="px-4 py-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors">
              Delete Project
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
