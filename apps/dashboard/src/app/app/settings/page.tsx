"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Building2,
  CreditCard,
  Shield,
  Bell,
  Camera,
  Save,
  Key,
  Smartphone,
  Mail,
  AlertTriangle,
} from "lucide-react";
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs";

const tabs = [
  { id: "account", label: "Account", icon: User },
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
];

const mockUser = {
  name: "John Smith",
  email: "john@company.com",
  avatar: null,
};

const mockOrg = {
  name: "Acme Inc",
  id: "org_abc123",
  plan: "Growth",
  createdAt: "2024-01-01",
};

const mockPlan = {
  name: "Growth",
  price: 299,
  features: ["10 projects", "5M requests/mo", "90-day log retention", "20 seats"],
  usage: {
    requests: { used: 2847293, limit: 5000000 },
    projects: { used: 4, limit: 10 },
    seats: { used: 4, limit: 20 },
  },
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account");

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <Breadcrumbs />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold mb-1">Settings</h1>
        <p className="text-white/50">Manage your account and organization settings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-cyan-400 text-white"
                : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Account tab */}
      {activeTab === "account" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Profile */}
          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
            <h3 className="font-semibold mb-6">Profile</h3>
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-2xl font-semibold text-white">
                  {mockUser.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <button className="absolute -bottom-1 -right-1 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Full Name</label>
                    <input
                      type="text"
                      defaultValue={mockUser.name}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue={mockUser.email}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/20"
                    />
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          {/* Change password */}
          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
            <h3 className="font-semibold mb-6">Change Password</h3>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm text-white/60 mb-2">Current Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/20"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/20"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/20"
                />
              </div>
              <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium transition-colors">
                Update Password
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Organization tab */}
      {activeTab === "organization" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
            <h3 className="font-semibold mb-6">Organization Details</h3>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm text-white/60 mb-2">Organization Name</label>
                <input
                  type="text"
                  defaultValue={mockOrg.name}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/20"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Organization ID</label>
                <input
                  type="text"
                  value={mockOrg.id}
                  disabled
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white/40"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>

          {/* Danger zone */}
          <div className="p-6 rounded-2xl border border-red-500/30 bg-red-500/5">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-4 h-4" />
              Danger Zone
            </h3>
            <p className="text-sm text-white/50 mb-4">
              Once you delete your organization, there is no going back. All data will be permanently removed.
            </p>
            <button className="px-4 py-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors">
              Delete Organization
            </button>
          </div>
        </motion.div>
      )}

      {/* Billing tab */}
      {activeTab === "billing" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Current plan */}
          <div className="p-6 rounded-2xl border border-cyan-500/30 bg-cyan-500/5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-white/50 mb-1">Current Plan</div>
                <div className="text-2xl font-semibold mb-2">{mockPlan.name}</div>
                <div className="text-3xl font-bold text-cyan-400">
                  ${mockPlan.price}<span className="text-lg text-white/40">/month</span>
                </div>
              </div>
              <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium transition-colors">
                Change Plan
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {mockPlan.features.map((feature) => (
                <div key={feature} className="text-sm text-white/60">✓ {feature}</div>
              ))}
            </div>
          </div>

          {/* Usage */}
          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
            <h3 className="font-semibold mb-6">Current Usage</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/60">Requests</span>
                  <span className="text-sm">
                    {(mockPlan.usage.requests.used / 1000000).toFixed(2)}M / {mockPlan.usage.requests.limit / 1000000}M
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                    style={{ width: `${(mockPlan.usage.requests.used / mockPlan.usage.requests.limit) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/60">Projects</span>
                  <span className="text-sm">{mockPlan.usage.projects.used} / {mockPlan.usage.projects.limit}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                    style={{ width: `${(mockPlan.usage.projects.used / mockPlan.usage.projects.limit) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/60">Team Seats</span>
                  <span className="text-sm">{mockPlan.usage.seats.used} / {mockPlan.usage.seats.limit}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                    style={{ width: `${(mockPlan.usage.seats.used / mockPlan.usage.seats.limit) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
            <h3 className="font-semibold mb-6">Payment Method</h3>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-white/10">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-medium">•••• •••• •••• 4242</div>
                  <div className="text-sm text-white/40">Expires 12/25</div>
                </div>
              </div>
              <button className="text-sm text-cyan-400 hover:text-cyan-300">Update</button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Security tab */}
      {activeTab === "security" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* 2FA */}
          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-white/10">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Two-Factor Authentication</h3>
                  <p className="text-sm text-white/50">
                    Add an extra layer of security to your account
                  </p>
                </div>
              </div>
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity">
                Enable 2FA
              </button>
            </div>
          </div>

          {/* Sessions */}
          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
            <h3 className="font-semibold mb-6">Active Sessions</h3>
            <div className="space-y-4">
              {[
                { device: "MacBook Pro - Chrome", location: "San Francisco, CA", current: true },
                { device: "iPhone 14 Pro - Safari", location: "San Francisco, CA", current: false },
              ].map((session, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {session.device}
                      {session.current && (
                        <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-white/40">{session.location}</div>
                  </div>
                  {!session.current && (
                    <button className="text-sm text-red-400 hover:text-red-300">Revoke</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* API Access */}
          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-white/10">
                <Key className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">API Access Logs</h3>
                <p className="text-sm text-white/50 mb-4">
                  View recent API authentication attempts
                </p>
                <button className="text-sm text-cyan-400 hover:text-cyan-300">View Logs →</button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Notifications tab */}
      {activeTab === "notifications" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
            <h3 className="font-semibold mb-6">Email Notifications</h3>
            <div className="space-y-4">
              {[
                { label: "Security alerts", description: "Get notified about security-related events", enabled: true },
                { label: "Usage alerts", description: "Receive alerts when approaching usage limits", enabled: true },
                { label: "Budget alerts", description: "Get notified when budget thresholds are reached", enabled: true },
                { label: "Weekly digest", description: "Receive a weekly summary of your usage", enabled: false },
                { label: "Product updates", description: "Learn about new features and improvements", enabled: false },
              ].map((notification) => (
                <div key={notification.label} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <div className="font-medium">{notification.label}</div>
                    <div className="text-sm text-white/40">{notification.description}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={notification.enabled} className="sr-only peer" />
                    <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-cyan-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Webhook */}
          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
            <h3 className="font-semibold mb-6">Webhook Notifications</h3>
            <p className="text-sm text-white/50 mb-4">
              Receive notifications via webhook for integration with your own systems.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Webhook URL</label>
                <input
                  type="text"
                  placeholder="https://your-server.com/webhooks/relaystack"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium transition-colors">
                <Save className="w-4 h-4" />
                Save Webhook
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
