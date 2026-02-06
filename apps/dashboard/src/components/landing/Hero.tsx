"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";

const codeSnippet = `import { RelayStack } from "@relaystack/sdk";

const relay = new RelayStack({
  apiKey: process.env.RELAY_API_KEY,
});

const response = await relay.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: "Hello!" }],
});`;

function TypewriterCode() {
  const [displayedCode, setDisplayedCode] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < codeSnippet.length) {
      const timeout = setTimeout(() => {
        setDisplayedCode(prev => prev + codeSnippet[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 25);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex]);

  return (
    <pre className="text-sm text-left overflow-hidden">
      <code>
        {displayedCode.split('\n').map((line, i) => (
          <div key={i} className="leading-relaxed">
            {line.includes('import') && <span className="text-purple-400">{line.split(' ')[0]} </span>}
            {line.includes('import') && <span className="text-cyan-300">{line.split(' ').slice(1, 3).join(' ')} </span>}
            {line.includes('import') && <span className="text-white/60">{line.split(' ').slice(3).join(' ')}</span>}
            {line.includes('const') && !line.includes('response') && (
              <>
                <span className="text-purple-400">const </span>
                <span className="text-cyan-300">relay </span>
                <span className="text-white/60">= </span>
                <span className="text-purple-400">new </span>
                <span className="text-yellow-300">RelayStack</span>
                <span className="text-white/60">{"({"}</span>
              </>
            )}
            {line.includes('apiKey') && (
              <>
                <span className="text-white/40">  </span>
                <span className="text-cyan-300">apiKey</span>
                <span className="text-white/60">: </span>
                <span className="text-green-400">process.env.RELAY_API_KEY</span>
                <span className="text-white/60">,</span>
              </>
            )}
            {line.includes('});') && line.length < 5 && <span className="text-white/60">{line}</span>}
            {line.includes('const response') && (
              <>
                <span className="text-purple-400">const </span>
                <span className="text-cyan-300">response </span>
                <span className="text-white/60">= </span>
                <span className="text-purple-400">await </span>
                <span className="text-cyan-300">relay</span>
                <span className="text-white/60">.chat.completions.</span>
                <span className="text-yellow-300">create</span>
                <span className="text-white/60">{"({"}</span>
              </>
            )}
            {line.includes('model:') && (
              <>
                <span className="text-white/40">  </span>
                <span className="text-cyan-300">model</span>
                <span className="text-white/60">: </span>
                <span className="text-green-400">"gpt-4"</span>
                <span className="text-white/60">,</span>
              </>
            )}
            {line.includes('messages:') && (
              <>
                <span className="text-white/40">  </span>
                <span className="text-cyan-300">messages</span>
                <span className="text-white/60">: [{"{ "}</span>
                <span className="text-cyan-300">role</span>
                <span className="text-white/60">: </span>
                <span className="text-green-400">"user"</span>
                <span className="text-white/60">, </span>
                <span className="text-cyan-300">content</span>
                <span className="text-white/60">: </span>
                <span className="text-green-400">"Hello!"</span>
                <span className="text-white/60">{" }],"}</span>
              </>
            )}
            {line === '});' && <span className="text-white/60">{line}</span>}
            {line === '' && <br />}
          </div>
        ))}
        <span className="animate-pulse">|</span>
      </code>
    </pre>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-sm text-white/60 mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Now in Public Beta
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-white to-purple-400 bg-clip-text text-transparent">
                Relay on US
              </span>
            </h1>

            <p className="text-xl text-white/60 mb-8 max-w-lg">
              The unified AI gateway for production applications. One SDK, every provider, 
              automatic failovers, and real-time observability.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/login"
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity"
              >
                Start Free →
              </Link>
              <Link
                href="#demo"
                className="px-6 py-3 rounded-lg border border-white/20 text-white font-medium hover:bg-white/5 transition-colors"
              >
                Watch Demo
              </Link>
            </div>

            <div className="flex items-center gap-8 mt-12 text-sm text-white/40">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                50k free requests/mo
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                No credit card required
              </div>
            </div>
          </motion.div>

          {/* Right - Code Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Floating code card */}
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl" />
              
              <div className="relative bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                {/* Window header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="ml-4 text-xs text-white/40">app.ts</span>
                </div>
                
                {/* Code content */}
                <div className="p-6 font-mono">
                  <TypewriterCode />
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.4 }}
                className="absolute -top-4 -right-4 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-medium"
              >
                ✓ 99.99% Uptime
              </motion.div>

              {/* Floating stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.4 }}
                className="absolute -bottom-6 -left-6 px-4 py-3 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10"
              >
                <div className="text-xs text-white/40 mb-1">Latency</div>
                <div className="text-lg font-semibold text-cyan-400">~45ms</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-1.5 h-1.5 rounded-full bg-white/60"
          />
        </div>
      </motion.div>
    </section>
  );
}
