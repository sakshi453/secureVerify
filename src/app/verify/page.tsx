"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  QrCode,
  Search,
  FileText,
  Camera,
  X,
  Hash,
  Shield,
  Loader2,
} from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import Navbar from "@/components/Navbar";
import GlassCard from "@/components/ui/GlassCard";
import VerificationResult from "@/components/VerificationResult";
import { AuthProvider } from "@/context/AuthContext";
import { useWeb3 } from "@/hooks/useWeb3";
import { ethers } from "ethers";
import CertificateRegistryABI from "@/lib/artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json";

import { Html5QrcodeScanner } from "html5-qrcode";

type VerifyMode = "pdf" | "qr" | "cid";

interface VerifyResult {
  verified: boolean;
  data: {
    certHash: string;
    exists: boolean;
    revoked: boolean;
    studentName: string;
    studentId: string;
    degree: string;
    issueDate: string;
    ipfsCID: string;
    issuer: string;
    timestamp: number;
  };
}

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
const RPC_URL = process.env.NEXT_PUBLIC_POLYGON_RPC_URL || "https://rpc-amoy.polygon.technology";

function VerifyContent() {
  const { readOnlyContract } = useWeb3();
  const [mode, setMode] = useState<VerifyMode>("cid");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [cidInput, setCidInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const verifyByCID = useCallback(async (cid: string) => {
    if (!cid || cid.trim() === "") return;
    
    setLoading(true);
    setResult(null);
    try {
      let contract = readOnlyContract;
      
      // If no wallet connected, use public RPC
      if (!contract) {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        contract = new ethers.Contract(CONTRACT_ADDRESS, CertificateRegistryABI.abi, provider);
      }

      const data = await contract.verifyCertificate(cid.trim());
      
      setResult({
        verified: Boolean(data.exists),
        data: {
          certHash: String(cid),
          exists: Boolean(data.exists),
          revoked: false,
          studentName: String(data.studentName || ""),
          studentId: "N/A", 
          degree: String(data.degree || ""),
          issueDate: String(data.issueDate || ""),
          ipfsCID: String(data.ipfsCID || ""),
          issuer: String(data.issuerName || ""),
          timestamp: Number(data.timestamp || 0),
        },
      });
    } catch (err: any) {
      console.error("Verification failed:", err);
      // Ensure we don't show [object Object] even in failure cases
      const errorMessage = err.reason || err.message || "Certificate not found";
      console.warn("Verify error message:", errorMessage);
      
      setResult({
        verified: false,
        data: {
          certHash: String(cid),
          exists: false,
          revoked: false,
          studentName: "",
          studentId: "",
          degree: "",
          issueDate: "",
          ipfsCID: "",
          issuer: "",
          timestamp: 0,
        },
      });
    } finally {
      setLoading(false);
    }
  }, [readOnlyContract]);

  const startCamera = useCallback(() => {
    setScanError(null);
    setCameraActive(true);
    
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render((decodedText) => {
        // Handle both raw CID and JSON QR formats
        let cid = decodedText;
        try {
           const parsed = JSON.parse(decodedText);
           if (parsed.certHash) cid = parsed.certHash;
           else if (parsed.ipfsCID) cid = parsed.ipfsCID;
        } catch (e) {
           // Use raw text as CID
        }
        
        scanner.clear();
        setCameraActive(false);
        verifyByCID(cid);
      }, (error) => {
        // Quietly fail scan attempts
      });
      
      scannerRef.current = scanner;
    }, 100);
  }, [verifyByCID]);

  const stopCamera = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const handleCidSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    verifyByCID(cidInput);
  }, [cidInput, verifyByCID]);

  const modes = [
    { key: "cid" as const, label: "Verify CID", icon: Hash },
    { key: "qr" as const, label: "Scan QR", icon: QrCode },
    { key: "pdf" as const, label: "Check PDF", icon: FileText, disabled: true },
  ];

  return (
    <main className="relative min-h-screen">
      <AnimatedBackground />
      <Navbar />

      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-32 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4"
          >
            <Shield className="h-8 w-8 text-accent" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-white">
            Employer <span className="gradient-text">Verification</span>
          </h1>
          <p className="text-text-secondary">
            Instantly verify the authenticity of academic certificates on the Polygon blockchain.
          </p>
        </motion.div>

        {/* Mode Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-2 mb-8 bg-white/5 p-1 rounded-2xl border border-white/10"
        >
          {modes.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                if (tab.disabled) return;
                setMode(tab.key);
                setResult(null);
                setFileName(null);
                if (tab.key !== "qr") stopCamera();
              }}
              disabled={tab.disabled}
              className={`
                flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all
                ${tab.disabled ? "opacity-30 cursor-not-allowed" : ""}
                ${mode === tab.key
                  ? "bg-accent/20 text-accent border border-accent/20 shadow-[0_0_15px_rgba(0,255,136,0.1)]"
                  : "text-text-secondary hover:text-white hover:bg-white/5"
                }
              `}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Mode Content */}
        <AnimatePresence mode="wait">
          {/* CID Input Mode */}
          {mode === "cid" && (
            <motion.div
              key="cid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GlassCard hover={false} className="p-8">
                <form onSubmit={handleCidSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-3">
                      IPFS Content Identifier (CID)
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                      <input
                        type="text"
                        value={cidInput}
                        onChange={(e) => setCidInput(e.target.value)}
                        placeholder="Qm... or bafy..."
                        className="input-field pl-11 font-mono text-sm"
                        required
                      />
                    </div>
                    <p className="text-text-muted text-[10px] mt-3 bg-white/5 p-2 rounded-lg leading-relaxed">
                       Enter the CID found on the student&apos;s digital certificate or provided by the holder. 
                       This unique ID is used to fetch the immutable record from the blockchain.
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={!cidInput.trim() || loading}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 h-12"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                    Verify Credentials
                  </button>
                </form>
              </GlassCard>
            </motion.div>
          )}

          {/* QR Scan Mode */}
          {mode === "qr" && (
            <motion.div
              key="qr"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GlassCard hover={false} className="p-8">
                <div className="flex flex-col items-center gap-6">
                  {cameraActive ? (
                    <div className="relative w-full max-w-sm">
                      <div 
                        id="reader" 
                        className="w-full rounded-2xl overflow-hidden border-2 border-accent/20 shadow-2xl"
                      />
                      <button
                        onClick={stopCamera}
                        className="absolute -top-3 -right-3 p-2 rounded-full bg-black/60 text-white hover:bg-red-500 transition-all z-20"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-40 h-40 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center bg-white/[0.02]">
                        <Camera className="h-12 w-12 text-text-muted mb-2 opacity-50" />
                        <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Ready to Scan</span>
                      </div>
                      <button onClick={startCamera} className="btn-primary flex items-center gap-2 px-8 h-12">
                        <Camera className="h-5 w-5" />
                        Activate Camera
                      </button>
                      <p className="text-text-muted text-xs text-center max-w-xs leading-relaxed">
                        Allow camera access to scan the secure QR code printed or displayed on the certificate.
                      </p>
                    </>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <div className="mt-10">
          <VerificationResult result={result} loading={loading} />
        </div>
      </div>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <AuthProvider>
      <VerifyContent />
    </AuthProvider>
  );
}
