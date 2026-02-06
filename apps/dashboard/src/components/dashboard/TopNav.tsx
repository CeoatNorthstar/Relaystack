"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Building2,
  Plus,
  Check,
} from "lucide-react";

export function TopNav() {
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const orgMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (orgMenuRef.current && !orgMenuRef.current.contains(event.target as Node)) {
        setOrgMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentOrg = user?.organizations?.[0];

  return (
    <header className="h-16 border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left: Org selector & Search */}
        <div className="flex items-center gap-4">
          {/* Organization selector */}
          <div className="relative" ref={orgMenuRef}>
            <button
              onClick={() => setOrgMenuOpen(!orgMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Building2 className="w-4 h-4 text-white/50" />
              <span className="text-sm font-medium max-w-[150px] truncate">
                {currentOrg?.name || "Select Organization"}
              </span>
              <ChevronDown className="w-4 h-4 text-white/50" />
            </button>

            {orgMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 rounded-xl border border-white/10 bg-black/95 backdrop-blur-xl shadow-xl overflow-hidden">
                <div className="p-2">
                  <div className="px-3 py-2 text-xs text-white/40 uppercase tracking-wider">
                    Organizations
                  </div>
                  {user?.organizations?.map((org) => (
                    <button
                      key={org.id}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400/20 to-purple-500/20 flex items-center justify-center">
                          <span className="text-sm font-medium">{org.name[0]}</span>
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium">{org.name}</div>
                          <div className="text-xs text-white/40">{org.role}</div>
                        </div>
                      </div>
                      {org.id === currentOrg?.id && (
                        <Check className="w-4 h-4 text-cyan-400" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="border-t border-white/10 p-2">
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-white/50 hover:text-white">
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">Create Organization</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search... (⌘K)"
              className="w-64 pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all"
            />
          </div>
        </div>

        {/* Right: Actions & User */}
        <div className="flex items-center gap-4">
          {/* Quick actions */}
          <button className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-sm font-medium hover:opacity-90 transition-opacity">
            + New Project
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
            <Bell className="w-5 h-5 text-white/50" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400"></span>
          </button>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                <span className="text-sm font-medium text-black">
                  {user?.name?.[0] || user?.email?.[0] || "U"}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-white/50" />
            </button>

            {userMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 rounded-xl border border-white/10 bg-black/95 backdrop-blur-xl shadow-xl overflow-hidden">
                <div className="p-3 border-b border-white/10">
                  <div className="font-medium">{user?.name}</div>
                  <div className="text-sm text-white/50">{user?.email}</div>
                </div>
                <div className="p-2">
                  <Link
                    href="/app/settings"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <User className="w-4 h-4 text-white/50" />
                    <span className="text-sm">Profile</span>
                  </Link>
                  <Link
                    href="/app/settings"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-white/50" />
                    <span className="text-sm">Settings</span>
                  </Link>
                </div>
                <div className="border-t border-white/10 p-2">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
