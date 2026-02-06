"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Key,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  MoreVertical,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs";

const mockApiKeys = [
  {
    id: "key_1",
    name: "Production API Key",
    key: "rsk_live_abc123def456ghi789jkl012mno345",
    project: "Production API",
    environment: "production",
    permissions: ["read", "write"],
    lastUsed: "2 minutes ago",
    createdAt: "2024-01-15",
    status: "active",
  },
  {
    id: "key_2",
    name: "Staging API Key",
    key: "rsk_test_xyz789abc123def456ghi789jkl012",
    project: "Production API",
    environment: "staging",
    permissions: ["read", "write"],
    lastUsed: "1 hour ago",
    createdAt: "2024-01-20",
    status: "active",
  },
  {
    id: "key_3",
    name: "Mobile App Key",
    key: "rsk_live_mno345pqr678stu901vwx234yza567",
    project: "Mobile App Backend",
    environment: "production",
    permissions: ["read"],
    lastUsed: "5 minutes ago",
    createdAt: "2024-02-01",
    status: "active",
  },
];

export default function ApiKeysPage() {
  const [showNewModal, setShowNewModal] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleReveal = (keyId: string) => {
    setRevealedKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const copyKey = (keyId: string, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const maskKey = (key: string) => {
    return key.slice(0, 12) + "••••••••••••••••" + key.slice(-4);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">API Keys</h1>
          <p className="text-white/50">Manage your Stack Tokens for API authentication</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Create Key
        </button>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
        <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-yellow-200">
            API keys provide full access to your account. Keep them secure and never share them publicly.
          </p>
        </div>
      </div>

      {/* Keys table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm overflow-hidden"
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-4 px-6 text-sm font-medium text-white/40">Name</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-white/40">Key</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-white/40">Project</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-white/40">Environment</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-white/40">Last Used</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-white/40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockApiKeys.map((apiKey) => (
              <tr key={apiKey.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5">
                      <Key className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <div className="font-medium">{apiKey.name}</div>
                      <div className="text-xs text-white/40">
                        Created {new Date(apiKey.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-white/60">
                      {revealedKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                    </code>
                    <button
                      onClick={() => toggleReveal(apiKey.id)}
                      className="p-1 rounded hover:bg-white/10 transition-colors"
                    >
                      {revealedKeys.has(apiKey.id) ? (
                        <EyeOff className="w-4 h-4 text-white/40" />
                      ) : (
                        <Eye className="w-4 h-4 text-white/40" />
                      )}
                    </button>
                    <button
                      onClick={() => copyKey(apiKey.id, apiKey.key)}
                      className="p-1 rounded hover:bg-white/10 transition-colors"
                    >
                      {copiedKey === apiKey.id ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-white/40" />
                      )}
                    </button>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm">{apiKey.project}</td>
                <td className="py-4 px-6">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      apiKey.environment === "production"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {apiKey.environment}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-white/50">{apiKey.lastUsed}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* New key modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowNewModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg p-6 rounded-2xl border border-white/10 bg-black/95 backdrop-blur-xl"
          >
            <h2 className="text-xl font-semibold mb-6">Create API Key</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Key Name</label>
                <input
                  type="text"
                  placeholder="e.g., Production API Key"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Project</label>
                <select className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/20">
                  <option value="">Select a project</option>
                  <option value="proj_1">Production API</option>
                  <option value="proj_2">Mobile App Backend</option>
                  <option value="proj_3">Internal Tools</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Environment</label>
                <select className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/20">
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Permissions</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Read</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Write</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Expiration</label>
                <select className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/20">
                  <option value="never">Never</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="365">1 year</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity">
                Create Key
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
