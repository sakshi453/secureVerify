"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wallet, 
  Search, 
  FileText, 
  QrCode, 
  Share2, 
  ExternalLink, 
  ShieldCheck, 
  Loader2,
  AlertCircle,
  Download
} from "lucide-react";
import { ethers } from "ethers";
import AnimatedBackground from "@/components/AnimatedBackground";
import Navbar from "@/components/Navbar";
import GlassCard from "@/components/ui/GlassCard";
import { QRCodeSVG } from "qrcode.react";

interface Certificate {
  studentName: string;
  degree: string;
  issueDate: string;
  ipfsCID: string;
  issuer: string;
  txHash?: string;
}

export default function HolderPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedQR, setSelectedQR] = useState<string | null>(null);

  const connectWallet = async () => {
    const win = typeof window !== "undefined" ? (window as any) : null;
    if (win && typeof win.ethereum !== "undefined") {
      try {
        setLoading(true);
        const provider = new ethers.BrowserProvider(win.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
        setError(null);
      } catch (err) {
        setError("Failed to connect wallet. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      setError("Please install MetaMask to access your records.");
    }
  };

  const fetchRecords = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) return;

    setLoading(true);
    setError(null);
    try {
      // API call to fetch records matching the Student ID and Wallet Address
      const res = await fetch("/api/holder/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, account }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      setCertificates(data.records);
      
      if (data.records.length === 0) {
        setError("No records found for this Student ID.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch records.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen">
      <AnimatedBackground />
      <Navbar />

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-28 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4 border border-accent/20">
            <Wallet className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Student <span className="gradient-text">Portal</span>
          </h1>
          <p className="text-text-secondary">
            Securely access, view, and share your academic achievements.
          </p>
        </motion.div>

        {/* Action Area */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar: Auth & Search */}
          <div className="md:col-span-1 space-y-6">
            <GlassCard hover={false} className="p-6">
              <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
                Authentication
              </h2>
              {!account ? (
                <button 
                  onClick={connectWallet}
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                  Connect Wallet
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-accent/10 border border-accent/20">
                  <p className="text-[10px] text-text-muted mb-1">Connected Address</p>
                  <p className="text-xs font-mono text-accent truncate">{account}</p>
                </div>
              )}
            </GlassCard>

            <GlassCard hover={false} className="p-6">
              <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
                Find Records
              </h2>
              <form onSubmit={fetchRecords} className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input 
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Enter Student ID"
                    className="input-field pl-10 text-sm"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  disabled={loading || !account}
                  className="btn-secondary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Fetch Records
                </button>
              </form>
            </GlassCard>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
              >
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-400">{error}</p>
              </motion.div>
            )}
          </div>

          {/* Main Content: Records List */}
          <div className="md:col-span-2 space-y-4">
            <AnimatePresence mode="wait">
              {certificates.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center py-20 px-8 bg-white/[0.02] rounded-3xl border border-white/5 border-dashed"
                >
                  <FileText className="h-16 w-16 text-text-muted mb-4 opacity-20" />
                  <h3 className="text-lg font-medium text-text-secondary">No Records Selected</h3>
                  <p className="text-sm text-text-muted max-w-[240px] mt-2">
                    Connect your wallet and enter your Student ID to retrieve your certificates.
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {certificates.map((cert, index) => (
                    <motion.div
                      key={cert.ipfsCID}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <GlassCard className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center border border-accent/20">
                              <ShieldCheck className="h-6 w-6 text-accent" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg leading-tight">{cert.degree}</h3>
                              <p className="text-text-secondary text-sm">{cert.studentName}</p>
                              <div className="flex items-center gap-3 mt-3">
                                <span className="text-[10px] text-text-muted bg-white/5 px-2 py-0.5 rounded-md">
                                  Issued: {cert.issueDate}
                                </span>
                                <span className="text-[10px] text-text-muted bg-white/5 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                                  CID: {cert.ipfsCID.slice(0, 8)}...
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => setSelectedQR(selectedQR === cert.ipfsCID ? null : cert.ipfsCID)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-accent/10 hover:text-accent transition-all text-text-muted"
                              title="Share QR"
                            >
                              <QrCode className="h-4 w-4" />
                            </button>
                            <a 
                              href={`https://gateway.pinata.cloud/ipfs/${cert.ipfsCID}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-white/5 hover:bg-accent/10 hover:text-accent transition-all text-text-muted"
                              title="Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </div>
                        </div>

                        {/* Interactive Share Area */}
                        <AnimatePresence>
                          {selectedQR === cert.ipfsCID && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-6 pt-6 border-t border-white/5 flex flex-col items-center">
                                <div className="bg-white p-4 rounded-2xl mb-4">
                                  <QRCodeSVG 
                                    value={`http://localhost:3000/verify?h=${cert.ipfsCID}`}
                                    size={160}
                                    level="H"
                                  />
                                </div>
                                <p className="text-xs text-text-muted mb-4">Share this code with employers for instant verification</p>
                                <div className="flex gap-2 w-full">
                                  <button className="flex-1 py-2 rounded-xl bg-white/5 text-xs flex items-center justify-center gap-2 border border-white/10 hover:bg-white/10 transition-all">
                                    <Share2 className="h-3 w-3" />
                                    Copy Link
                                  </button>
                                  <button className="flex-1 py-2 rounded-xl bg-white/5 text-xs flex items-center justify-center gap-2 border border-white/10 hover:bg-white/10 transition-all">
                                    <FileText className="h-3 w-3" />
                                    LinkedIn Post
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </GlassCard>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
