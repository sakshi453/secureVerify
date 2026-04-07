"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  QrCode,
  Hash,
  ExternalLink,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  Wallet,
} from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import Navbar from "@/components/Navbar";
import GlassCard from "@/components/ui/GlassCard";
import CertificateForm from "@/components/CertificateForm";
import CSVUploader from "@/components/CSVUploader";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { QRCodeSVG } from "qrcode.react";
import { useWeb3 } from "@/hooks/useWeb3";
import { pinToIPFS, getGatewayUrl } from "@/lib/ipfs";

interface IssuedCert {
  certHash: string;
  studentName: string;
  studentId: string;
  degree: string;
  issueDate: string;
  ipfsCID: string;
  txHash: string;
}

function LoginForm() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen">
      <AnimatedBackground />
      <Navbar />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <GlassCard hover={false} className="p-8">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4"
              >
                <LogIn className="h-8 w-8 text-accent" />
              </motion.div>
              <h1 className="text-2xl font-bold">
                {isSignUp ? "Create Account" : "Issuer Login"}
              </h1>
              <p className="text-text-secondary text-sm mt-2">
                {isSignUp
                  ? "Register your institutional account"
                  : "Sign in to access the certificate dashboard"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@university.edu"
                    required
                    className="input-field pl-11"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="input-field pl-11"
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-xl"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isSignUp ? (
                  <UserPlus className="h-5 w-5" />
                ) : (
                  <LogIn className="h-5 w-5" />
                )}
                {isSignUp ? "Create Account" : "Sign In"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                className="text-text-secondary text-sm hover:text-accent transition-colors"
              >
                {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </main>
  );
}

function DashboardContent() {
  const { user, loading: authLoading } = useAuth();
  const { account, contract, connectWallet, isConnecting, error: web3Error } = useWeb3();

  const [mode, setMode] = useState<"manual" | "csv">("manual");
  const [issuedCerts, setIssuedCerts] = useState<IssuedCert[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [selectedQR, setSelectedQR] = useState<string | null>(null);

  const issueCertificate = useCallback(async (data: {
    studentName: string;
    studentId: string;
    studentAddress: string;
    degree: string;
    issueDate: string;
    file: File | null;
  }) => {
    if (!account || !contract) {
       setStatus({ type: "error", message: "Please connect your wallet first" });
       return;
    }

    setLoading(true);
    setStatus(null);
    try {
      if (!data.file) throw new Error("Certificate file is required");

      setStatus({ type: "success", message: "Uploading to IPFS..." });
      const cid = await pinToIPFS(data.file);
      
      setStatus({ type: "success", message: "Confirming transaction in MetaMask..." });
      const tx = await contract.issueCertificate(
        data.studentAddress,
        cid,
        data.studentName,
        data.degree,
        data.issueDate,
        "SecureVerify University" // Could be dynamic based on university profile
      );
      
      setStatus({ type: "success", message: "Transaction pending... waiting for confirmation." });
      const receipt = await tx.wait();
      
      const newCert: IssuedCert = {
        certHash: cid,
        studentName: data.studentName,
        studentId: data.studentId,
        degree: data.degree,
        issueDate: data.issueDate,
        ipfsCID: cid,
        txHash: receipt.hash,
      };

      setIssuedCerts((prev) => [newCert, ...prev]);
      setStatus({ type: "success", message: `Certificate successfully issued to ${data.studentName}!` });
    } catch (err: any) {
      console.error("Issuance error:", err);
      // Ethers v6 errors can be complex objects; ensure we extract a string message
      const message = 
        err.reason || 
        err.message || 
        (typeof err === "string" ? err : JSON.stringify(err)) ||
        "Failed to issue certificate";
      
      setStatus({ type: "error", message: String(message) });
    } finally {
      setLoading(false);
    }
  }, [account, contract]);

  const handleCSVData = useCallback(async (rows: any[]) => {
    // Note: CSV batch processing would need a multi-call or handled sequentially.
    // For this demo, we'll suggest manual entry for better UX with blockchain txs.
    setStatus({ type: "error", message: "CSV batch issuance coming soon. Please use manual entry." });
  }, []);

  if (authLoading) {
    return (
      <main className="relative min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <Loader2 className="h-8 w-8 text-accent animate-spin" />
      </main>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <main className="relative min-h-screen">
      <AnimatedBackground />
      <Navbar />

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-28 pb-16">
        {/* Connection Banner */}
        {!account && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <GlassCard hover={false} className="p-6 border-accent/20 bg-accent/5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Wallet className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Connect University Wallet</h3>
                    <p className="text-sm text-text-secondary">You need to connect an authorized institutional wallet to issue certificates on-chain.</p>
                  </div>
                </div>
                <button 
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="btn-primary flex items-center gap-2 whitespace-nowrap"
                >
                  {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                  Connect MetaMask
                </button>
              </div>
              {web3Error && <p className="text-red-400 text-xs mt-2">{web3Error}</p>}
            </GlassCard>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Issuer <span className="gradient-text">Dashboard</span>
          </h1>
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-text-secondary">
              Issue tamper-proof certificates to the Polygon blockchain.
            </p>
            {account && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-text-muted">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                {account.slice(0, 6)}...{account.slice(-4)}
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* ── Left: Form ── */}
          <div className="lg:col-span-2">
            <GlassCard hover={false} className="p-6">
              {/* Mode Toggle */}
              <div className="flex gap-2 mb-6">
                {[
                  { key: "manual" as const, label: "Manual Entry", icon: FileText },
                  { key: "csv" as const, label: "CSV Upload", icon: Upload },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setMode(tab.key)}
                    className={`
                      flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all
                      ${mode === tab.key
                        ? "bg-accent/15 text-accent border border-accent/30"
                        : "bg-white/[0.03] text-text-secondary border border-white/[0.06] hover:bg-white/[0.06]"
                      }
                    `}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Form Content */}
              <AnimatePresence mode="wait">
                {mode === "manual" ? (
                  <motion.div
                    key="manual"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <CertificateForm onSubmit={issueCertificate} loading={loading} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="csv"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <CSVUploader onDataParsed={handleCSVData} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Status Message */}
              <AnimatePresence>
                {status && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mt-4 flex items-center gap-2 p-3 rounded-xl text-sm ${
                      status.type === "success"
                        ? "bg-accent/10 text-accent font-medium"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {status.type === "success" ? (
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    )}
                    {status.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          </div>

          {/* ── Right: Issued Certificates ── */}
          <div className="lg:col-span-3">
            <GlassCard hover={false} className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                <CheckCircle className="h-5 w-5 text-accent" />
                Latest Issuances
                {issuedCerts.length > 0 && (
                  <span className="text-xs bg-accent/15 text-accent px-2 py-0.5 rounded-full">
                    {issuedCerts.length}
                  </span>
                )}
              </h2>

              {issuedCerts.length === 0 ? (
                <div className="text-center py-16 text-text-muted">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No certificates issued yet</p>
                  <p className="text-sm mt-1">Submit the form to issue your first on-chain certificate</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {issuedCerts.map((cert, i) => (
                    <motion.div
                      key={cert.txHash}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-accent/20 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm text-white truncate">{cert.studentName}</p>
                            <span className="badge-verified text-[8px] py-0.5 px-1.5">On-Chain</span>
                          </div>
                          <p className="text-text-secondary text-xs mt-0.5">{cert.degree}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-3">
                            <span className="text-[10px] text-text-muted flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md">
                              <Hash className="h-3 w-3" />
                              {cert.ipfsCID.slice(0, 10)}...
                            </span>
                            <a 
                              href={`https://amoy.polygonscan.com/tx/${cert.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-accent hover:underline flex items-center gap-1"
                            >
                              View TX <ExternalLink className="h-2 w-2" />
                            </a>
                            <a 
                              href={getGatewayUrl(cert.ipfsCID)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-text-muted hover:text-white flex items-center gap-1"
                            >
                              PDF <FileText className="h-2 w-2" />
                            </a>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedQR(selectedQR === cert.txHash ? null : cert.txHash)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-accent/15 text-text-muted hover:text-accent transition-all flex-shrink-0"
                          title="Generate QR Code"
                        >
                          <QrCode className="h-5 w-5" />
                        </button>
                      </div>

                      {/* QR Code */}
                      <AnimatePresence>
                        {selectedQR === cert.txHash && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col items-center gap-4">
                              <div className="bg-white p-4 rounded-2xl shadow-xl">
                                <QRCodeSVG
                                  value={cert.ipfsCID}
                                  size={160}
                                  level="H"
                                  includeMargin={false}
                                />
                              </div>
                              <div className="text-center">
                                <p className="text-white font-medium text-xs">Verification QR Code</p>
                                <p className="text-text-muted text-[10px] mt-1">
                                  Employers can scan this to verify authenticity
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}
