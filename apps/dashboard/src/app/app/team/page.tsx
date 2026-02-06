"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Mail,
  Plus,
  MoreVertical,
  Shield,
  Clock,
  Check,
  X,
  Trash2,
} from "lucide-react";
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs";

const mockTeam = [
  {
    id: "user_1",
    name: "John Smith",
    email: "john@company.com",
    role: "owner",
    avatar: null,
    lastActive: "2 minutes ago",
    status: "online",
  },
  {
    id: "user_2",
    name: "Sarah Johnson",
    email: "sarah@company.com",
    role: "admin",
    avatar: null,
    lastActive: "1 hour ago",
    status: "online",
  },
  {
    id: "user_3",
    name: "Mike Chen",
    email: "mike@company.com",
    role: "developer",
    avatar: null,
    lastActive: "3 hours ago",
    status: "offline",
  },
  {
    id: "user_4",
    name: "Emily Davis",
    email: "emily@company.com",
    role: "viewer",
    avatar: null,
    lastActive: "1 day ago",
    status: "offline",
  },
];

const mockInvitations = [
  {
    id: "invite_1",
    email: "alex@company.com",
    role: "developer",
    invitedBy: "John Smith",
    invitedAt: "2024-02-01",
    status: "pending",
  },
];

const roles = {
  owner: {
    label: "Owner",
    color: "bg-purple-500/20 text-purple-400",
    description: "Full access, manage billing and team",
  },
  admin: {
    label: "Admin",
    color: "bg-cyan-500/20 text-cyan-400",
    description: "Manage projects, keys, and settings",
  },
  developer: {
    label: "Developer",
    color: "bg-green-500/20 text-green-400",
    description: "Create and manage API keys",
  },
  viewer: {
    label: "Viewer",
    color: "bg-white/10 text-white/60",
    description: "View-only access to dashboard",
  },
};

export default function TeamPage() {
  const [showInviteModal, setShowInviteModal] = useState(false);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Team Members</h1>
          <p className="text-white/50">Manage who has access to your organization</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
        >
          <div className="flex items-center gap-2 text-white/50 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-sm">Total Members</span>
          </div>
          <div className="text-3xl font-semibold">{mockTeam.length}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
        >
          <div className="flex items-center gap-2 text-white/50 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-sm">Online Now</span>
          </div>
          <div className="text-3xl font-semibold">
            {mockTeam.filter((m) => m.status === "online").length}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
        >
          <div className="flex items-center gap-2 text-white/50 mb-2">
            <Mail className="w-4 h-4" />
            <span className="text-sm">Pending Invites</span>
          </div>
          <div className="text-3xl font-semibold">{mockInvitations.length}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
        >
          <div className="flex items-center gap-2 text-white/50 mb-2">
            <Shield className="w-4 h-4" />
            <span className="text-sm">Seat Limit</span>
          </div>
          <div className="text-3xl font-semibold">{mockTeam.length}/20</div>
        </motion.div>
      </div>

      {/* Roles overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]"
      >
        <h3 className="font-semibold mb-4">Role Permissions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(roles).map(([key, role]) => (
            <div key={key} className="p-4 rounded-xl bg-white/5">
              <span className={`px-2 py-0.5 rounded text-xs ${role.color}`}>
                {role.label}
              </span>
              <p className="text-sm text-white/50 mt-2">{role.description}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Team members */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden"
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-4 px-6 text-sm font-medium text-white/40">Member</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-white/40">Role</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-white/40">Status</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-white/40">Last Active</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-white/40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockTeam.map((member) => (
              <tr key={member.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-medium">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-white/40">{member.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-0.5 rounded text-xs ${roles[member.role as keyof typeof roles].color}`}>
                    {roles[member.role as keyof typeof roles].label}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        member.status === "online" ? "bg-green-400" : "bg-white/20"
                      }`}
                    />
                    <span className="text-sm text-white/50 capitalize">{member.status}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-1 text-sm text-white/50">
                    <Clock className="w-3 h-3" />
                    {member.lastActive}
                  </div>
                </td>
                <td className="py-4 px-6">
                  {member.role !== "owner" && (
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Pending invitations */}
      {mockInvitations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/5"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4 text-yellow-400" />
            Pending Invitations
          </h3>
          <div className="space-y-3">
            {mockInvitations.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5"
              >
                <div>
                  <div className="font-medium">{invite.email}</div>
                  <div className="text-sm text-white/40">
                    Invited by {invite.invitedBy} on {new Date(invite.invitedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${roles[invite.role as keyof typeof roles].color}`}>
                    {roles[invite.role as keyof typeof roles].label}
                  </span>
                  <button className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                    Resend
                  </button>
                  <button className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Invite modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowInviteModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg p-6 rounded-2xl border border-white/10 bg-black/95 backdrop-blur-xl"
          >
            <h2 className="text-xl font-semibold mb-6">Invite Team Member</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="colleague@company.com"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Role</label>
                <select className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/20">
                  <option value="viewer">Viewer - View-only access</option>
                  <option value="developer">Developer - Create and manage API keys</option>
                  <option value="admin">Admin - Full management access</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Message (optional)</label>
                <textarea
                  placeholder="Add a personal message to the invitation..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity">
                Send Invitation
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
