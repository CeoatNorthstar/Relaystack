"use client";

import { motion } from "framer-motion";
import {
  History,
  Search,
  Download,
  User,
  Settings,
  Key,
  Trash2,
  Plus,
  Edit2,
  Shield,
} from "lucide-react";
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs";

const mockAuditLogs = [
  {
    id: "audit_1",
    timestamp: "2024-02-05T14:32:15Z",
    user: "John Smith",
    action: "api_key.created",
    resource: "Production API Key",
    ip: "192.168.1.100",
    details: "Created new API key for production environment",
  },
  {
    id: "audit_2",
    timestamp: "2024-02-05T14:28:45Z",
    user: "Sarah Johnson",
    action: "project.updated",
    resource: "Mobile App Backend",
    ip: "192.168.1.101",
    details: "Updated project settings",
  },
  {
    id: "audit_3",
    timestamp: "2024-02-05T14:15:22Z",
    user: "John Smith",
    action: "team.invite",
    resource: "alex@company.com",
    ip: "192.168.1.100",
    details: "Invited new team member with developer role",
  },
  {
    id: "audit_4",
    timestamp: "2024-02-05T13:45:00Z",
    user: "Mike Chen",
    action: "budget.created",
    resource: "Production API",
    ip: "192.168.1.102",
    details: "Created budget rule with $5000 monthly limit",
  },
  {
    id: "audit_5",
    timestamp: "2024-02-05T12:30:15Z",
    user: "Sarah Johnson",
    action: "provider.configured",
    resource: "OpenAI",
    ip: "192.168.1.101",
    details: "Configured OpenAI API key",
  },
  {
    id: "audit_6",
    timestamp: "2024-02-05T11:20:45Z",
    user: "John Smith",
    action: "api_key.revoked",
    resource: "Old Test Key",
    ip: "192.168.1.100",
    details: "Revoked API key",
  },
];

const actionIcons: Record<string, React.ReactNode> = {
  "api_key.created": <Key className="w-4 h-4 text-green-400" />,
  "api_key.revoked": <Key className="w-4 h-4 text-red-400" />,
  "project.updated": <Settings className="w-4 h-4 text-cyan-400" />,
  "project.created": <Plus className="w-4 h-4 text-green-400" />,
  "project.deleted": <Trash2 className="w-4 h-4 text-red-400" />,
  "team.invite": <User className="w-4 h-4 text-purple-400" />,
  "team.remove": <User className="w-4 h-4 text-red-400" />,
  "budget.created": <Shield className="w-4 h-4 text-yellow-400" />,
  "provider.configured": <Settings className="w-4 h-4 text-cyan-400" />,
};

const actionLabels: Record<string, string> = {
  "api_key.created": "API Key Created",
  "api_key.revoked": "API Key Revoked",
  "project.updated": "Project Updated",
  "project.created": "Project Created",
  "project.deleted": "Project Deleted",
  "team.invite": "Team Invite Sent",
  "team.remove": "Team Member Removed",
  "budget.created": "Budget Rule Created",
  "provider.configured": "Provider Configured",
};

export default function AuditPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Audit Log</h1>
          <p className="text-white/50">Track all administrative actions in your organization</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-colors">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Enterprise badge */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
        <Shield className="w-5 h-5 text-purple-400" />
        <div>
          <div className="font-medium text-purple-400">Enterprise Feature</div>
          <div className="text-sm text-white/50">
            Full audit log with 365-day retention and compliance export
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search by user, action, or resource..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20"
          />
        </div>
        <select className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/20">
          <option value="">All Users</option>
          <option value="john">John Smith</option>
          <option value="sarah">Sarah Johnson</option>
          <option value="mike">Mike Chen</option>
        </select>
        <select className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/20">
          <option value="">All Actions</option>
          <option value="api_key">API Key</option>
          <option value="project">Project</option>
          <option value="team">Team</option>
          <option value="budget">Budget</option>
          <option value="provider">Provider</option>
        </select>
        <select className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/20">
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="365d">Last 365 days</option>
        </select>
      </div>

      {/* Audit log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {mockAuditLogs.map((log, index) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-white/5">
                {actionIcons[log.action] || <History className="w-4 h-4 text-white/40" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{actionLabels[log.action] || log.action}</span>
                  <span className="text-white/30">•</span>
                  <span className="text-sm text-white/50">{log.resource}</span>
                </div>
                <div className="text-sm text-white/40 mb-2">{log.details}</div>
                <div className="flex items-center gap-4 text-xs text-white/30">
                  <span>By {log.user}</span>
                  <span>•</span>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                  <span>•</span>
                  <span>IP: {log.ip}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-white/50">
        <div>Showing 1-6 of 234 events</div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded border border-white/10 hover:bg-white/5 disabled:opacity-50" disabled>
            Previous
          </button>
          <button className="px-3 py-1 rounded border border-white/10 hover:bg-white/5">Next</button>
        </div>
      </div>
    </div>
  );
}
