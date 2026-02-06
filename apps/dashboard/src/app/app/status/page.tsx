"use client";

import { motion } from "framer-motion";
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Activity,
  Wifi,
  Database,
  Server,
  Globe,
} from "lucide-react";
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs";

const systemStatus = {
  gateway: { status: "operational", latency: 45 },
  database: { status: "operational", latency: 12 },
  redis: { status: "operational", latency: 3 },
};

const providerStatus = [
  { name: "OpenAI", status: "operational", latency: 234, uptime: 99.98 },
  { name: "Anthropic", status: "operational", latency: 312, uptime: 99.95 },
  { name: "Google AI", status: "operational", latency: 189, uptime: 99.99 },
  { name: "Mistral", status: "degraded", latency: 567, uptime: 98.5 },
  { name: "Cohere", status: "operational", latency: 245, uptime: 99.9 },
  { name: "Groq", status: "operational", latency: 89, uptime: 99.97 },
];

const incidents = [
  {
    id: "inc_1",
    title: "Mistral API Degraded Performance",
    status: "investigating",
    time: "2 hours ago",
    description: "We are investigating reports of increased latency with Mistral API requests.",
  },
  {
    id: "inc_2",
    title: "Scheduled Maintenance Complete",
    status: "resolved",
    time: "2 days ago",
    description: "Database maintenance has been completed successfully.",
  },
];

const uptimeHistory = [
  { day: "Mon", uptime: 100 },
  { day: "Tue", uptime: 100 },
  { day: "Wed", uptime: 99.8 },
  { day: "Thu", uptime: 100 },
  { day: "Fri", uptime: 100 },
  { day: "Sat", uptime: 100 },
  { day: "Sun", uptime: 99.95 },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "operational":
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    case "degraded":
      return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    case "outage":
      return <XCircle className="w-5 h-5 text-red-400" />;
    default:
      return <Clock className="w-5 h-5 text-white/40" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "operational":
      return "bg-green-500";
    case "degraded":
      return "bg-yellow-500";
    case "outage":
      return "bg-red-500";
    default:
      return "bg-white/20";
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "operational":
      return "bg-green-500/20 text-green-400";
    case "degraded":
      return "bg-yellow-500/20 text-yellow-400";
    case "outage":
      return "bg-red-500/20 text-red-400";
    case "investigating":
      return "bg-yellow-500/20 text-yellow-400";
    case "resolved":
      return "bg-green-500/20 text-green-400";
    default:
      return "bg-white/10 text-white/40";
  }
};

export default function StatusPage() {
  const allOperational = Object.values(systemStatus).every((s) => s.status === "operational") &&
    providerStatus.every((p) => p.status === "operational");

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <Breadcrumbs />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold mb-1">System Status</h1>
        <p className="text-white/50">Monitor the health of RelayStack services and providers</p>
      </div>

      {/* Overall status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-2xl border ${
          allOperational
            ? "border-green-500/30 bg-green-500/5"
            : "border-yellow-500/30 bg-yellow-500/5"
        }`}
      >
        <div className="flex items-center gap-4">
          {allOperational ? (
            <CheckCircle className="w-10 h-10 text-green-400" />
          ) : (
            <AlertCircle className="w-10 h-10 text-yellow-400" />
          )}
          <div>
            <div className="text-2xl font-semibold">
              {allOperational ? "All Systems Operational" : "Partial Degradation"}
            </div>
            <div className="text-white/50">Last updated: {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </motion.div>

      {/* Uptime chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold">7-Day Uptime</h3>
          <div className="text-2xl font-semibold text-green-400">99.96%</div>
        </div>
        <div className="flex items-end gap-2 h-20">
          {uptimeHistory.map((day) => (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
              <div
                className={`w-full rounded-t transition-all ${
                  day.uptime === 100 ? "bg-green-500" : day.uptime > 99 ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ height: `${day.uptime}%` }}
              />
              <span className="text-xs text-white/40">{day.day}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* System components */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
      >
        <h3 className="font-semibold mb-6">Core Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-white/40" />
              <div>
                <div className="font-medium">Gateway API</div>
                <div className="text-sm text-white/40">{systemStatus.gateway.latency}ms avg</div>
              </div>
            </div>
            {getStatusIcon(systemStatus.gateway.status)}
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-white/40" />
              <div>
                <div className="font-medium">Database</div>
                <div className="text-sm text-white/40">{systemStatus.database.latency}ms avg</div>
              </div>
            </div>
            {getStatusIcon(systemStatus.database.status)}
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-white/40" />
              <div>
                <div className="font-medium">Redis Cache</div>
                <div className="text-sm text-white/40">{systemStatus.redis.latency}ms avg</div>
              </div>
            </div>
            {getStatusIcon(systemStatus.redis.status)}
          </div>
        </div>
      </motion.div>

      {/* Provider status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
      >
        <h3 className="font-semibold mb-6">AI Providers</h3>
        <div className="space-y-3">
          {providerStatus.map((provider) => (
            <div
              key={provider.name}
              className={`flex items-center justify-between p-4 rounded-xl ${
                provider.status === "operational" ? "bg-white/5" : "bg-yellow-500/10 border border-yellow-500/20"
              }`}
            >
              <div className="flex items-center gap-4">
                {getStatusIcon(provider.status)}
                <div>
                  <div className="font-medium">{provider.name}</div>
                  <div className="text-sm text-white/40">
                    {provider.latency}ms • {provider.uptime}% uptime
                  </div>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs capitalize ${getStatusBadge(provider.status)}`}>
                {provider.status}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Incidents */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
      >
        <h3 className="font-semibold mb-6">Recent Incidents</h3>
        <div className="space-y-4">
          {incidents.map((incident) => (
            <div key={incident.id} className="p-4 rounded-xl bg-white/5">
              <div className="flex items-start justify-between mb-2">
                <div className="font-medium">{incident.title}</div>
                <span className={`px-2 py-0.5 rounded text-xs capitalize ${getStatusBadge(incident.status)}`}>
                  {incident.status}
                </span>
              </div>
              <p className="text-sm text-white/50 mb-2">{incident.description}</p>
              <div className="text-xs text-white/30">{incident.time}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Subscribe */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-1">Subscribe to Updates</h3>
            <p className="text-sm text-white/50">Get notified about incidents and maintenance</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity">
            <Globe className="w-4 h-4" />
            Subscribe
          </button>
        </div>
      </motion.div>
    </div>
  );
}
