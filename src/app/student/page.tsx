"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  Loader2,
  FileText,
  ExternalLink,
  Award,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Building,
} from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import Navbar from "@/components/Navbar";
import GlassCard from "@/components/ui/GlassCard";
import { useWeb3 } from "@/hooks/useWeb3";
import { getGatewayUrl } from "@/lib/ipfs";

interface Certificate {
  ipfsCID: string;
  studentName: string;
  degree: string;
  issueDate: string;
  issuerName: string;
  timestamp: bigint;
  exists: boolean;
}

export default function StudentPortal() {
  const { account, connectWallet, readOnlyContract, isConnecting } = useWeb3();
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCertificates = useCallback(async (address: string) => {
    if (!readOnlyContract) return;
    setLoading(true);
    try {
      const data = await readOnlyContract.getCertificates(address);
      // Map and clean data from smart contract
      const formattedCerts = data.map((c: any) => ({
        ipfsCID: c.ipfsCID,
        studentName: c.studentName,
        degree: c.degree,
        issueDate: c.issueDate,
        issuerName: c.issuerName,
        timestamp: c.timestamp,
        exists: c.exists,
      }));
      setCerts(formattedCerts);
    } catch (err) {
      console.error("Failed to fetch certificates:", err);
    } finally {
      setLoading(false);
    }
  }, [readOnlyContract]);

  useEffect(() => {
    if (account) {
      fetchCertificates(account);
    }
  }, [account, fetchCertificates]);

  return (
    <main className="relative min-h-screen pb-20">
      <AnimatedBackground />
      <Navbar />

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-32">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl sm:text-5xl font-bold text-white tracking-tight"
            >
              Student <span className="gradient-text">Portal</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-text-secondary mt-3 max-w-lg"
            >
              Access and share your blockchain-verified academic credentials. 
              Stored permanently on IPFS and Polygon.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {account ? (
              <div className="flex flex-col items-end gap-2">
                 <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-accent/10 border border-accent/20 text-accent font-mono text-sm shadow-[0_0_20px_rgba(0,255,136,0.15)]">
                   <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                   {account.slice(0, 6)}...{account.slice(-4)}
                 </div>
                 <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Connected Wallet</p>
              </div>
            ) : (
              <button 
                onClick={connectWallet}
                disabled={isConnecting}
                className="btn-primary py-3 px-8 text-lg font-semibold flex items-center gap-3 shadow-[0_4px_20px_rgba(0,255,136,0.25)]"
              >
                {isConnecting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Wallet className="h-6 w-6" />}
                Connect Wallet
              </button>
            )}
          </motion.div>
        </div>

        {/* Content Section */}
        {!account ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="relative mb-8">
              <Award className="h-24 w-24 text-white/5" />
              <ShieldCheck className="h-10 w-10 text-accent absolute -bottom-2 -right-2" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Wallet Disconnected</h2>
            <p className="text-text-secondary max-w-sm mb-8">
              Connect your MetaMask wallet to view the certificates issued to your address by your university.
            </p>
            <button 
                onClick={connectWallet}
                className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
              >
                Try Connecting Again
              </button>
          </motion.div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <Loader2 className="h-12 w-12 text-accent animate-spin" />
            <p className="text-text-secondary font-medium animate-pulse">Querying the blockchain for your records...</p>
          </div>
        ) : certs.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-16 px-8 rounded-3xl bg-white/[0.03] border border-white/10 text-center"
          >
            <FileText className="h-16 w-16 text-text-muted mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-white mb-2">No Certificates Found</h3>
            <p className="text-text-secondary">
              We couldn&apos;t find any certificates issued to <span className="text-white font-mono break-all">{account}</span>. 
              Please ensure you are using the correct wallet or contact your institution.
            </p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certs.map((cert, index) => (
              <motion.div
                key={cert.ipfsCID}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="h-full"
              >
                <GlassCard className="p-0 overflow-hidden group border-white/10 hover:border-accent/40 h-full flex flex-col">
                  <div className="p-6 flex-1">
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-3 rounded-2xl bg-accent/10 text-accent group-hover:scale-110 transition-transform duration-300">
                        <Award className="h-8 w-8" />
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted bg-white/5 px-2 py-1 rounded-full">
                        ON-CHAIN
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white leading-tight mb-2 min-h-[56px] group-hover:text-accent transition-colors">
                      {cert.degree}
                    </h3>
                    
                    <div className="space-y-3 mt-6">
                      <div className="flex items-center gap-3 text-sm text-text-secondary">
                        <Building className="h-4 w-4 text-accent/60 flex-shrink-0" />
                        <span className="truncate">{cert.issuerName}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-text-secondary">
                        <Calendar className="h-4 w-4 text-accent/60 flex-shrink-0" />
                        <span>Issued: {cert.issueDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-between">
                    <a 
                      href={getGatewayUrl(cert.ipfsCID)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-bright transition-colors"
                    >
                      View Certificate <ExternalLink className="h-4 w-4" />
                    </a>
                    <button className="p-2 rounded-xl bg-white/5 text-text-muted hover:text-white hover:bg-white/10 transition-all">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
