"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = false }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      className={cn(
        "glass rounded-2xl p-6 glow",
        hover && "cursor-pointer transition-shadow hover:shadow-[0_0_60px_rgba(255,255,255,0.08)]",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

interface StatusBadgeProps {
  status: "ok" | "error" | "loading";
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border",
        status === "ok" && "status-ok",
        status === "error" && "status-error",
        status === "loading" && "bg-white/10 text-white/60 border-white/20"
      )}
    >
      <span
        className={cn(
          "w-2 h-2 rounded-full",
          status === "ok" && "bg-emerald-400 animate-pulse",
          status === "error" && "bg-red-400",
          status === "loading" && "bg-white/40 animate-pulse"
        )}
      />
      {label || status.toUpperCase()}
    </div>
  );
}

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function GlassInput({ label, error, className, ...props }: GlassInputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm text-white/60 font-medium">{label}</label>
      )}
      <input
        className={cn(
          "w-full px-4 py-3 rounded-xl glass-input text-white placeholder:text-white/30",
          "focus:outline-none focus:ring-2 focus:ring-white/20",
          error && "border-red-500/50 focus:ring-red-500/30",
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

interface GlassButtonProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "secondary";
  loading?: boolean;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

export function GlassButton({
  children,
  variant = "default",
  loading,
  className,
  disabled,
  type = "button",
  onClick,
}: GlassButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={cn(
        "px-6 py-3 rounded-xl font-medium transition-all duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variant === "default" && "glass-button text-white",
        variant === "primary" && "glass-button-primary",
        variant === "secondary" && "glass-button text-white/70 hover:text-white",
        className
      )}
      disabled={disabled || loading}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}

export function Logo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };
  const iconSizes = {
    sm: 18,
    md: 24,
    lg: 32,
  };
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("rounded-xl bg-white flex items-center justify-center", sizeClasses[size])}>
        <svg
          width={iconSizes[size]}
          height={iconSizes[size]}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            fill="black"
          />
          <path
            d="M2 17L12 22L22 17"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 12L12 17L22 12"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="text-xl font-semibold tracking-tight">RelayStack</span>
    </div>
  );
}
