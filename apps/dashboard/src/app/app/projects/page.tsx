"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FolderKanban,
  Plus,
  Search,
  MoreVertical,
  Settings,
  Trash2,
  ExternalLink,
  Activity,
} from "lucide-react";
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs";

const mockProjects = [
  {
    id: "proj_1",
    name: "Production API",
    description: "Main production API gateway",
    environments: ["production", "staging"],
    requests24h: 45230,
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "proj_2",
    name: "Mobile App Backend",
    description: "AI features for mobile application",
    environments: ["production", "development"],
    requests24h: 12450,
    status: "active",
    createdAt: "2024-02-01",
  },
  {
    id: "proj_3",
    name: "Internal Tools",
    description: "Internal AI-powered tools",
    environments: ["development"],
    requests24h: 892,
    status: "active",
    createdAt: "2024-02-20",
  },
];

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);

  const filteredProjects = mockProjects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Projects</h1>
          <p className="text-white/50">Manage your AI gateway projects and environments</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Search & filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20"
          />
        </div>
      </div>

      {/* Projects grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={`/app/projects/${project.id}`}
              className="block p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm hover:border-white/20 hover:bg-white/[0.04] transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
                  <FolderKanban className="w-5 h-5 text-cyan-400" />
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    // Show menu
                  }}
                  className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
                >
                  <MoreVertical className="w-4 h-4 text-white/50" />
                </button>
              </div>

              <h3 className="font-semibold mb-1">{project.name}</h3>
              <p className="text-sm text-white/50 mb-4 line-clamp-2">{project.description}</p>

              {/* Environments */}
              <div className="flex flex-wrap gap-2 mb-4">
                {project.environments.map((env) => (
                  <span
                    key={env}
                    className={`px-2 py-0.5 rounded text-xs ${
                      env === "production"
                        ? "bg-green-500/20 text-green-400"
                        : env === "staging"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {env}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-white/40">
                  <Activity className="w-4 h-4" />
                  {project.requests24h.toLocaleString()} req/24h
                </div>
                <span className="text-white/30">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}

        {/* New project card */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: filteredProjects.length * 0.1 }}
          onClick={() => setShowNewModal(true)}
          className="p-6 rounded-2xl border-2 border-dashed border-white/10 hover:border-white/20 hover:bg-white/[0.02] transition-all flex flex-col items-center justify-center text-white/40 hover:text-white/60 min-h-[200px]"
        >
          <Plus className="w-8 h-8 mb-2" />
          <span className="text-sm font-medium">Create New Project</span>
        </motion.button>
      </div>

      {/* New project modal */}
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
            <h2 className="text-xl font-semibold mb-6">Create New Project</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Project Name</label>
                <input
                  type="text"
                  placeholder="My AI Project"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Description</label>
                <textarea
                  placeholder="Brief description of this project..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Initial Environment</label>
                <select className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-white/20">
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
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
                Create Project
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
