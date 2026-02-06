"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  AlertTriangle,
  Power,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs";

const mockBudgets = [
  {
    id: "budget_1",
    project: "Production API",
    monthlyLimit: 5000,
    currentSpend: 2847.32,
    killSwitch: true,
    alerts: [50, 75, 90],
    status: "active",
  },
  {
    id: "budget_2",
    project: "Mobile App Backend",
    monthlyLimit: 1000,
    currentSpend: 456.78,
    killSwitch: false,
    alerts: [75, 90],
    status: "active",
  },
  {
    id: "budget_3",
    project: "Internal Tools",
    monthlyLimit: 500,
    currentSpend: 234.56,
    killSwitch: true,
    alerts: [90],
    status: "active",
  },
];

export default function BudgetsPage() {
  const [showNewModal, setShowNewModal] = useState(false);

  const totalBudget = mockBudgets.reduce((acc, b) => acc + b.monthlyLimit, 0);
  const totalSpend = mockBudgets.reduce((acc, b) => acc + b.currentSpend, 0);
  const projectedSpend = (totalSpend / 5) * 30; // Assuming day 5 of month

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Budgets & Kill Switches</h1>
          <p className="text-white/50">Set spending limits and automatic cutoffs for your projects</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Budget Rule
        </button>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
        >
          <div className="flex items-center gap-2 text-white/50 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Total Budget</span>
          </div>
          <div className="text-3xl font-semibold">${totalBudget.toLocaleString()}</div>
          <div className="text-sm text-white/40">This month</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
        >
          <div className="flex items-center gap-2 text-white/50 mb-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Current Spend</span>
          </div>
          <div className="text-3xl font-semibold">${totalSpend.toLocaleString()}</div>
          <div className="text-sm text-white/40">
            {((totalSpend / totalBudget) * 100).toFixed(1)}% used
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
        >
          <div className="flex items-center gap-2 text-white/50 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Projected Spend</span>
          </div>
          <div className={`text-3xl font-semibold ${projectedSpend > totalBudget ? "text-red-400" : ""}`}>
            ${projectedSpend.toLocaleString()}
          </div>
          <div className="text-sm text-white/40">End of month</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
        >
          <div className="flex items-center gap-2 text-white/50 mb-2">
            <Power className="w-4 h-4" />
            <span className="text-sm">Kill Switches</span>
          </div>
          <div className="text-3xl font-semibold">
            {mockBudgets.filter((b) => b.killSwitch).length}/{mockBudgets.length}
          </div>
          <div className="text-sm text-white/40">Active</div>
        </motion.div>
      </div>

      {/* Budget rules */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {mockBudgets.map((budget) => {
          const utilization = (budget.currentSpend / budget.monthlyLimit) * 100;
          const isWarning = utilization > 75;
          const isCritical = utilization > 90;

          return (
            <div
              key={budget.id}
              className={`p-6 rounded-2xl border ${
                isCritical
                  ? "border-red-500/30 bg-red-500/5"
                  : isWarning
                  ? "border-yellow-500/30 bg-yellow-500/5"
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{budget.project}</h3>
                  <p className="text-sm text-white/50">
                    Monthly limit: ${budget.monthlyLimit.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {budget.killSwitch && (
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs">
                      <Power className="w-3 h-3" />
                      Kill Switch Enabled
                    </div>
                  )}
                  <button className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/50">
                    ${budget.currentSpend.toLocaleString()} spent
                  </span>
                  <span className={`text-sm font-medium ${isCritical ? "text-red-400" : isWarning ? "text-yellow-400" : ""}`}>
                    {utilization.toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isCritical
                        ? "bg-red-500"
                        : isWarning
                        ? "bg-yellow-500"
                        : "bg-gradient-to-r from-cyan-500 to-purple-500"
                    }`}
                    style={{ width: `${Math.min(utilization, 100)}%` }}
                  />
                </div>
              </div>

              {/* Alert thresholds */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-white/40">Alert at:</span>
                {budget.alerts.map((threshold) => (
                  <span
                    key={threshold}
                    className={`px-2 py-0.5 rounded text-xs ${
                      utilization >= threshold
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-white/5 text-white/40"
                    }`}
                  >
                    {threshold}%
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* New budget modal */}
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
            <h2 className="text-xl font-semibold mb-6">Create Budget Rule</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Project</label>
                <select className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/20">
                  <option value="">Select a project</option>
                  <option value="1">Production API</option>
                  <option value="2">Mobile App Backend</option>
                  <option value="3">Internal Tools</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Monthly Limit ($)</label>
                <input
                  type="number"
                  placeholder="5000"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">Alert Thresholds</label>
                <div className="flex gap-2">
                  {[50, 75, 90, 100].map((threshold) => (
                    <label key={threshold} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked={threshold !== 100}
                        className="rounded"
                      />
                      <span className="text-sm">{threshold}%</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <div>
                  <div className="font-medium text-red-400">Kill Switch</div>
                  <div className="text-sm text-white/50">
                    Automatically stop requests when budget is exceeded
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-red-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
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
                Create Rule
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
