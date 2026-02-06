"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Clock,
  Check,
  X,
  AlertTriangle,
  ExternalLink,
  Copy,
} from "lucide-react";
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs";

const mockLogs = [
  {
    id: "req_abc123",
    timestamp: "2024-02-05T14:32:15Z",
    model: "gpt-4-turbo",
    provider: "OpenAI",
    status: "success",
    latency: 1234,
    tokens: { input: 156, output: 423 },
    cost: 0.0287,
    project: "Production API",
    environment: "production",
  },
  {
    id: "req_def456",
    timestamp: "2024-02-05T14:31:45Z",
    model: "claude-3-sonnet",
    provider: "Anthropic",
    status: "success",
    latency: 892,
    tokens: { input: 89, output: 312 },
    cost: 0.0145,
    project: "Production API",
    environment: "production",
  },
  {
    id: "req_ghi789",
    timestamp: "2024-02-05T14:31:12Z",
    model: "gpt-4",
    provider: "OpenAI",
    status: "error",
    latency: 5000,
    tokens: { input: 200, output: 0 },
    cost: 0,
    error: "Rate limit exceeded",
    project: "Mobile App Backend",
    environment: "staging",
  },
  {
    id: "req_jkl012",
    timestamp: "2024-02-05T14:30:55Z",
    model: "mistral-large",
    provider: "Mistral",
    status: "success",
    latency: 567,
    tokens: { input: 45, output: 178 },
    cost: 0.0089,
    project: "Production API",
    environment: "production",
  },
  {
    id: "req_mno345",
    timestamp: "2024-02-05T14:30:22Z",
    model: "gpt-3.5-turbo",
    provider: "OpenAI",
    status: "success",
    latency: 345,
    tokens: { input: 78, output: 234 },
    cost: 0.0012,
    project: "Internal Tools",
    environment: "development",
  },
  {
    id: "req_pqr678",
    timestamp: "2024-02-05T14:29:45Z",
    model: "claude-3-opus",
    provider: "Anthropic",
    status: "rate_limited",
    latency: 0,
    tokens: { input: 0, output: 0 },
    cost: 0,
    error: "API key rate limited",
    project: "Production API",
    environment: "production",
  },
];

const mockRequestDetail = {
  id: "req_abc123",
  timestamp: "2024-02-05T14:32:15Z",
  model: "gpt-4-turbo",
  provider: "OpenAI",
  status: "success",
  latency: 1234,
  tokens: { input: 156, output: 423 },
  cost: 0.0287,
  request: {
    model: "gpt-4-turbo",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "What is the capital of France?" },
    ],
    temperature: 0.7,
    max_tokens: 500,
  },
  response: {
    id: "chatcmpl-abc123",
    object: "chat.completion",
    created: 1707143535,
    model: "gpt-4-turbo",
    choices: [
      {
        index: 0,
        message: { role: "assistant", content: "The capital of France is Paris." },
        finish_reason: "stop",
      },
    ],
    usage: { prompt_tokens: 156, completion_tokens: 423, total_tokens: 579 },
  },
  headers: {
    "x-request-id": "req_abc123",
    "x-relaystack-project": "Production API",
    "x-relaystack-environment": "production",
  },
  timing: {
    queued: 5,
    routing: 12,
    provider: 1200,
    total: 1234,
  },
};

export default function LogsPage() {
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<typeof mockRequestDetail | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <Check className="w-4 h-4 text-green-400" />;
      case "error":
        return <X className="w-4 h-4 text-red-400" />;
      case "rate_limited":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default:
        return <Clock className="w-4 h-4 text-white/40" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500/20 text-green-400";
      case "error":
        return "bg-red-500/20 text-red-400";
      case "rate_limited":
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-white/10 text-white/40";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Request Logs</h1>
          <p className="text-white/50">View and analyze all API requests through RelayStack</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
              autoRefresh
                ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                : "border-white/10 text-white/60 hover:bg-white/5"
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? "animate-spin" : ""}`} />
            {autoRefresh ? "Live" : "Auto-refresh"}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search by request ID, model..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20"
          />
        </div>
        <select className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/20">
          <option value="">All Projects</option>
          <option value="1">Production API</option>
          <option value="2">Mobile App Backend</option>
          <option value="3">Internal Tools</option>
        </select>
        <select className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/20">
          <option value="">All Status</option>
          <option value="success">Success</option>
          <option value="error">Error</option>
          <option value="rate_limited">Rate Limited</option>
        </select>
        <select className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/20">
          <option value="">All Providers</option>
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="mistral">Mistral</option>
        </select>
        <select className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/20">
          <option value="1h">Last 1 hour</option>
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
      </div>

      {/* Logs table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden"
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="w-8"></th>
              <th className="text-left py-4 px-4 text-sm font-medium text-white/40">Time</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-white/40">Request ID</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-white/40">Model</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-white/40">Provider</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-white/40">Status</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-white/40">Latency</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-white/40">Tokens</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-white/40">Cost</th>
              <th className="text-left py-4 px-4 text-sm font-medium text-white/40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockLogs.map((log) => (
              <>
                <tr
                  key={log.id}
                  className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer"
                  onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                >
                  <td className="py-3 px-2">
                    {expandedLog === log.id ? (
                      <ChevronDown className="w-4 h-4 text-white/40" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-white/40" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-white/60">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono text-cyan-400">{log.id}</code>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(log.id, log.id);
                        }}
                        className="p-1 rounded hover:bg-white/10"
                      >
                        {copiedId === log.id ? (
                          <Check className="w-3 h-3 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-white/40" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">{log.model}</td>
                  <td className="py-3 px-4 text-sm text-white/60">{log.provider}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${getStatusBadge(
                        log.status
                      )}`}
                    >
                      {getStatusIcon(log.status)}
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-white/60">
                    {log.latency > 0 ? `${log.latency}ms` : "—"}
                  </td>
                  <td className="py-3 px-4 text-sm text-white/60">
                    {log.tokens.input + log.tokens.output > 0
                      ? `${log.tokens.input + log.tokens.output}`
                      : "—"}
                  </td>
                  <td className="py-3 px-4 text-sm text-white/60">
                    {log.cost > 0 ? `$${log.cost.toFixed(4)}` : "—"}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLog(mockRequestDetail);
                      }}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
                {expandedLog === log.id && (
                  <tr className="bg-white/[0.02]">
                    <td colSpan={10} className="px-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-white/40 mb-1">Project</div>
                          <div className="text-sm">{log.project}</div>
                        </div>
                        <div>
                          <div className="text-xs text-white/40 mb-1">Environment</div>
                          <div className="text-sm">{log.environment}</div>
                        </div>
                        {log.error && (
                          <div className="col-span-2">
                            <div className="text-xs text-white/40 mb-1">Error</div>
                            <div className="text-sm text-red-400">{log.error}</div>
                          </div>
                        )}
                        <div>
                          <div className="text-xs text-white/40 mb-1">Input Tokens</div>
                          <div className="text-sm">{log.tokens.input}</div>
                        </div>
                        <div>
                          <div className="text-xs text-white/40 mb-1">Output Tokens</div>
                          <div className="text-sm">{log.tokens.output}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-white/50">
        <div>Showing 1-6 of 1,234 requests</div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded border border-white/10 hover:bg-white/5 disabled:opacity-50" disabled>
            Previous
          </button>
          <button className="px-3 py-1 rounded border border-white/10 hover:bg-white/5">Next</button>
        </div>
      </div>

      {/* Detail modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedLog(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-black/95 backdrop-blur-xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-black/95">
              <div>
                <h2 className="text-xl font-semibold">Request Details</h2>
                <code className="text-sm text-cyan-400">{selectedLog.id}</code>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Timing breakdown */}
              <div>
                <h3 className="text-sm font-medium text-white/60 mb-3">Timing Breakdown</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="text-2xl font-semibold">{selectedLog.timing.queued}ms</div>
                    <div className="text-xs text-white/40">Queued</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="text-2xl font-semibold">{selectedLog.timing.routing}ms</div>
                    <div className="text-xs text-white/40">Routing</div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="text-2xl font-semibold">{selectedLog.timing.provider}ms</div>
                    <div className="text-xs text-white/40">Provider</div>
                  </div>
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <div className="text-2xl font-semibold text-cyan-400">{selectedLog.timing.total}ms</div>
                    <div className="text-xs text-white/40">Total</div>
                  </div>
                </div>
              </div>

              {/* Request */}
              <div>
                <h3 className="text-sm font-medium text-white/60 mb-3">Request</h3>
                <pre className="p-4 rounded-xl bg-white/5 text-sm font-mono overflow-x-auto">
                  <code>{JSON.stringify(selectedLog.request, null, 2)}</code>
                </pre>
              </div>

              {/* Response */}
              <div>
                <h3 className="text-sm font-medium text-white/60 mb-3">Response</h3>
                <pre className="p-4 rounded-xl bg-white/5 text-sm font-mono overflow-x-auto">
                  <code>{JSON.stringify(selectedLog.response, null, 2)}</code>
                </pre>
              </div>

              {/* Headers */}
              <div>
                <h3 className="text-sm font-medium text-white/60 mb-3">Headers</h3>
                <pre className="p-4 rounded-xl bg-white/5 text-sm font-mono overflow-x-auto">
                  <code>{JSON.stringify(selectedLog.headers, null, 2)}</code>
                </pre>
              </div>
            </div>

            <div className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-black/95">
              <button className="px-4 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-colors">
                Copy Request
              </button>
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity">
                Replay Request
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
