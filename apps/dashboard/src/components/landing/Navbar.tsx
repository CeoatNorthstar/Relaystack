"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/10" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
              <span className="text-black font-bold text-sm">R</span>
            </div>
            <span className="font-semibold text-lg">RelayStack</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-white/60 hover:text-white transition-colors text-sm">
              Features
            </Link>
            <Link href="#demo" className="text-white/60 hover:text-white transition-colors text-sm">
              Demo
            </Link>
            <Link href="#pricing" className="text-white/60 hover:text-white transition-colors text-sm">
              Pricing
            </Link>
            <Link href="/docs" className="text-white/60 hover:text-white transition-colors text-sm">
              Docs
            </Link>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-white/60 hover:text-white transition-colors text-sm">
              Sign in
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-white text-black font-medium text-sm hover:bg-white/90 transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden pt-4 pb-6 space-y-4"
          >
            <Link href="#features" className="block text-white/60 hover:text-white">Features</Link>
            <Link href="#demo" className="block text-white/60 hover:text-white">Demo</Link>
            <Link href="#pricing" className="block text-white/60 hover:text-white">Pricing</Link>
            <Link href="/docs" className="block text-white/60 hover:text-white">Docs</Link>
            <div className="pt-4 border-t border-white/10 space-y-3">
              <Link href="/login" className="block text-white/60 hover:text-white">Sign in</Link>
              <Link
                href="/login"
                className="block w-full text-center px-4 py-2 rounded-lg bg-white text-black font-medium"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
