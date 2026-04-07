/**
 * SecureVerify — Contract ABI (simplified for frontend usage)
 * 
 * This ABI is extracted from the compiled CertificateRegistry.sol contract.
 * After running `npx hardhat compile`, the full ABI will be in
 * src/lib/artifacts/contracts/CertificateRegistry.sol/CertificateRegistry.json
 */
export const CERTIFICATE_REGISTRY_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "certHash", type: "bytes32" },
      { indexed: false, internalType: "string", name: "studentName", type: "string" },
      { indexed: false, internalType: "string", name: "studentId", type: "string" },
      { indexed: false, internalType: "string", name: "degree", type: "string" },
      { indexed: false, internalType: "string", name: "ipfsCID", type: "string" },
      { indexed: true, internalType: "address", name: "issuer", type: "address" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" },
    ],
    name: "CertificateIssued",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "certHash", type: "bytes32" },
      { indexed: true, internalType: "address", name: "revokedBy", type: "address" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" },
    ],
    name: "CertificateRevoked",
    type: "event",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "_certHash", type: "bytes32" },
      { internalType: "string", name: "_studentName", type: "string" },
      { internalType: "string", name: "_studentId", type: "string" },
      { internalType: "string", name: "_degree", type: "string" },
      { internalType: "string", name: "_issueDate", type: "string" },
      { internalType: "string", name: "_ipfsCID", type: "string" },
    ],
    name: "issueCertificate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "_certHash", type: "bytes32" }],
    name: "verifyCertificate",
    outputs: [
      { internalType: "bool", name: "exists", type: "bool" },
      { internalType: "bool", name: "revoked", type: "bool" },
      { internalType: "string", name: "studentName", type: "string" },
      { internalType: "string", name: "studentId", type: "string" },
      { internalType: "string", name: "degree", type: "string" },
      { internalType: "string", name: "issueDate", type: "string" },
      { internalType: "string", name: "ipfsCID", type: "string" },
      { internalType: "address", name: "issuer", type: "address" },
      { internalType: "uint256", name: "timestamp", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "_certHash", type: "bytes32" }],
    name: "revokeCertificate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "_certHash", type: "bytes32" }],
    name: "isValid",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_issuer", type: "address" }],
    name: "addIssuer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "totalCertificates",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
