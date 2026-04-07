/**
 * SecureVerify — Blockchain Interaction Layer
 * 
 * Provides helper functions to interact with the CertificateRegistry
 * smart contract on Polygon via ethers.js.
 * 
 * Supports a MOCK_MODE for local development without a live contract.
 */

import { ethers } from "ethers";
import { CERTIFICATE_REGISTRY_ABI } from "./contractABI";

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === "true";
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
const RPC_URL = process.env.POLYGON_RPC_URL || "https://rpc-amoy.polygon.technology";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

// ──────────────── Types ────────────────

export interface CertificateResult {
  exists: boolean;
  revoked: boolean;
  studentName: string;
  studentId: string;
  degree: string;
  issueDate: string;
  ipfsCID: string;
  issuer: string;
  timestamp: number;
}

// ──────────────── Mock Storage ────────────────

const mockStore = new Map<string, CertificateResult>();

// ──────────────── Provider & Contract ────────────────

function getProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(RPC_URL);
}

function getSignerContract(): ethers.Contract {
  const provider = getProvider();
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  return new ethers.Contract(CONTRACT_ADDRESS, CERTIFICATE_REGISTRY_ABI, wallet);
}

function getReadContract(): ethers.Contract {
  const provider = getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, CERTIFICATE_REGISTRY_ABI, provider);
}

// ──────────────── Issue Certificate ────────────────

export async function issueCertificateOnChain(
  certHash: string,
  studentName: string,
  studentId: string,
  degree: string,
  issueDate: string,
  ipfsCID: string
): Promise<{ txHash: string; certHash: string }> {
  if (MOCK_MODE) {
    // Simulate blockchain issuance
    await new Promise((resolve) => setTimeout(resolve, 1500));
    mockStore.set(certHash, {
      exists: true,
      revoked: false,
      studentName,
      studentId,
      degree,
      issueDate,
      ipfsCID,
      issuer: "0xMockIssuerAddress",
      timestamp: Math.floor(Date.now() / 1000),
    });
    return {
      txHash: `0xmock_${Date.now().toString(16)}_${certHash.slice(2, 10)}`,
      certHash,
    };
  }

  const contract = getSignerContract();
  const tx = await contract.issueCertificate(
    certHash,
    studentName,
    studentId,
    degree,
    issueDate,
    ipfsCID
  );
  const receipt = await tx.wait();
  return {
    txHash: receipt.hash,
    certHash,
  };
}

// ──────────────── Verify Certificate ────────────────

export async function verifyCertificateOnChain(
  certHash: string
): Promise<CertificateResult> {
  if (MOCK_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const stored = mockStore.get(certHash);
    if (stored) return stored;
    return {
      exists: false,
      revoked: false,
      studentName: "",
      studentId: "",
      degree: "",
      issueDate: "",
      ipfsCID: "",
      issuer: "",
      timestamp: 0,
    };
  }

  const contract = getReadContract();
  const result = await contract.verifyCertificate(certHash);
  return {
    exists: result[0],
    revoked: result[1],
    studentName: result[2],
    studentId: result[3],
    degree: result[4],
    issueDate: result[5],
    ipfsCID: result[6],
    issuer: result[7],
    timestamp: Number(result[8]),
  };
}

// ──────────────── Check Validity ────────────────

export async function isValidOnChain(certHash: string): Promise<boolean> {
  if (MOCK_MODE) {
    const stored = mockStore.get(certHash);
    return stored ? stored.exists && !stored.revoked : false;
  }
  const contract = getReadContract();
  return await contract.isValid(certHash);
}
