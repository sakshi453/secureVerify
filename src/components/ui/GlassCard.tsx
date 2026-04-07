"use client";

import React from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className = "",
  hover = true,
  glow = false,
  onClick,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl
        bg-white/[0.04] backdrop-blur-xl
        border border-white/[0.08]
        transition-all duration-300
        ${hover ? "hover:bg-white/[0.07] hover:border-accent/30 hover:shadow-[0_0_30px_rgba(0,255,136,0.1)] cursor-pointer" : ""}
        ${glow ? "border-accent/30 shadow-[0_0_20px_rgba(0,255,136,0.15)]" : ""}
        ${className}
      `}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.03] via-transparent to-accent/[0.01] pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
