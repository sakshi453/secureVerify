"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  FileCheck,
  Lock,
  Blocks,
  ArrowRight,
  CheckCircle,
  Globe,
  Zap,
} from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import Navbar from "@/components/Navbar";
import GlassCard from "@/components/ui/GlassCard";
import { AuthProvider } from "@/context/AuthContext";

const features = [
  {
    icon: Lock,
    title: "Tamper-Proof",
    desc: "SHA-256 hashing + blockchain immutability ensures certificates cannot be forged or altered.",
  },
  {
    icon: Blocks,
    title: "On-Chain Storage",
    desc: "Certificate records are stored permanently on Polygon, accessible by anyone globally.",
  },
  {
    icon: Globe,
    title: "IPFS Distributed",
    desc: "Full certificate data is stored on IPFS, ensuring decentralized and resilient access.",
  },
  {
    icon: Zap,
    title: "Instant Verification",
    desc: "Verify any certificate in seconds by uploading a PDF or scanning a QR code.",
  },
];

const stats = [
  { value: "100%", label: "Tamper Proof" },
  { value: "<3s", label: "Verification Time" },
  { value: "∞", label: "Record Retention" },
  { value: "0", label: "Trust Required" },
];

function HomeContent() {
  return (
    <main className="relative min-h-screen">
      <AnimatedBackground />
      <Navbar />

      {/* ─── Hero Section ─── */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-8"
            >
              <Shield className="h-4 w-4" />
              Powered by Polygon Blockchain
            </motion.div>

            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Verify Credentials
              <br />
              <span className="gradient-text">On The Blockchain</span>
            </h1>

            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
              SecureVerify brings trustless certificate verification to education.
              Issue, store, and verify academic credentials with cryptographic
              proof — no intermediaries needed.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard">
                <motion.button
                  className="btn-primary text-base px-8 py-4 rounded-2xl flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FileCheck className="h-5 w-5" />
                  Issue Certificates
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              </Link>
              <Link href="/verify">
                <motion.button
                  className="btn-secondary text-base px-8 py-4 rounded-2xl flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <CheckCircle className="h-5 w-5" />
                  Verify Now
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Floating Stats */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="glass p-5 text-center"
              >
                <p className="text-2xl sm:text-3xl font-bold gradient-text">
                  {stat.value}
                </p>
                <p className="text-text-muted text-sm mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why <span className="gradient-text">SecureVerify</span>?
            </h2>
            <p className="text-text-secondary max-w-lg mx-auto">
              A next-generation credential verification platform built on
              decentralized infrastructure.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <GlassCard className="p-6 h-full">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                step: "01",
                title: "Institutional Login",
                desc: "University admins sign in with Firebase Authentication to access the issuer dashboard.",
              },
              {
                step: "02",
                title: "Upload Certificate Data",
                desc: "Enter student details manually or bulk-upload via CSV. Data is SHA-256 hashed for integrity.",
              },
              {
                step: "03",
                title: "Store on IPFS & Blockchain",
                desc: "Certificate metadata is pinned to IPFS. The hash + CID are recorded on Polygon's smart contract.",
              },
              {
                step: "04",
                title: "Verify Instantly",
                desc: "Anyone can verify by uploading a PDF or scanning a QR code. The hash is checked against the blockchain.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className="p-6 flex items-start gap-6" hover={false}>
                  <div className="text-3xl font-bold gradient-text flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                    <p className="text-text-secondary text-sm">{item.desc}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 py-12 px-4 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" />
            <span className="font-semibold gradient-text">SecureVerify</span>
          </div>
          <p className="text-text-muted text-sm">
            © 2024 SecureVerify. Decentralized Certificate Verification.
          </p>
        </div>
      </footer>
    </main>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <HomeContent />
    </AuthProvider>
  );
}
