"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, ExternalLink, Copy, Shield } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

interface VerificationResultProps {
  result: {
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
  } | null;
  loading?: boolean;
}

export default function VerificationResult({ result, loading }: VerificationResultProps) {
  if (loading) {
    return (
      <GlassCard hover={false} className="p-8">
        <div className="space-y-4">
          <div className="scan-overlay h-32 rounded-xl bg-surface-tertiary flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Shield className="h-12 w-12 text-accent" />
            </motion.div>
          </div>
          <p className="text-center text-text-secondary animate-pulse">
            Verifying on blockchain...
          </p>
        </div>
      </GlassCard>
    );
  }

  if (!result) return null;

  const { verified, data } = result;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <GlassCard
        hover={false}
        glow={verified}
        className={`p-8 ${
          verified
            ? "border-accent/40 shadow-[0_0_40px_rgba(0,255,136,0.15)]"
            : "border-red-500/30 shadow-[0_0_40px_rgba(255,50,50,0.1)]"
        }`}
      >
        {/* Status Header */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            {verified ? (
              <div className="relative">
                <CheckCircle className="h-20 w-20 text-accent" />
                <motion.div
                  className="absolute inset-0 bg-accent/20 rounded-full blur-2xl"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            ) : (
              <XCircle className="h-20 w-20 text-red-500" />
            )}
          </motion.div>

          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`text-2xl font-bold mt-4 ${
              verified ? "text-accent" : "text-red-400"
            }`}
          >
            {verified ? "Certificate Verified ✓" : "Certificate Not Found"}
          </motion.h3>

          <p className="text-text-secondary mt-2 text-sm">
            {verified
              ? "This certificate is authentic and recorded on the Polygon blockchain."
              : data.revoked
              ? "This certificate has been revoked by the issuer."
              : "No matching certificate found on the blockchain."}
          </p>
        </div>

        {/* Certificate Details */}
        {verified && data.exists && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {[
              { label: "Student Name", value: data.studentName },
              { label: "Student ID", value: data.studentId },
              { label: "Degree", value: data.degree },
              { label: "Issue Date", value: data.issueDate },
              { label: "IPFS CID", value: data.ipfsCID, copy: true },
              { label: "Issuer", value: data.issuer, copy: true, mono: true },
              {
                label: "Timestamp",
                value: data.timestamp
                  ? new Date(data.timestamp * 1000).toLocaleString()
                  : "N/A",
              },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="flex justify-between items-start gap-4 py-2"
              >
                <span className="text-text-muted text-sm flex-shrink-0">
                  {item.label}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm text-right ${
                      item.mono ? "font-mono text-xs" : ""
                    } text-text-primary`}
                  >
                    {item.value
                      ? item.mono && item.value.length > 20
                        ? `${item.value.slice(0, 10)}...${item.value.slice(-8)}`
                        : item.value
                      : "—"}
                  </span>
                  {item.copy && item.value && (
                    <button
                      onClick={() => copyToClipboard(item.value!)}
                      className="text-text-muted hover:text-accent transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}

            {data.ipfsCID && (
              <motion.a
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                href={`https://gateway.pinata.cloud/ipfs/${data.ipfsCID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 mt-4 px-4 py-3 rounded-xl bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-all"
              >
                <ExternalLink className="h-4 w-4" />
                View on IPFS
              </motion.a>
            )}
          </motion.div>
        )}
      </GlassCard>
    </motion.div>
  );
}
