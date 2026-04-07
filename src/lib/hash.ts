/**
 * SecureVerify — SHA-256 Hashing Utility
 * 
 * Computes a deterministic hash from certificate data fields.
 * The same inputs always produce the same hash, ensuring
 * data integrity before blockchain submission.
 */

/**
 * Compute SHA-256 hash of certificate data.
 * Fields are concatenated with pipe delimiter for determinism.
 * 
 * @param studentName - Full name of the student
 * @param studentId   - Student ID / Roll Number
 * @param degree      - Degree / Certificate name
 * @param issueDate   - Date of issuance (YYYY-MM-DD)
 * @returns Hex string of the SHA-256 hash (0x-prefixed)
 */
export async function hashCertificateData(
  studentName: string,
  studentId: string,
  degree: string,
  issueDate: string
): Promise<string> {
  // Normalize: trim whitespace, lowercase for consistency
  const normalized = [
    studentName.trim().toLowerCase(),
    studentId.trim().toLowerCase(),
    degree.trim().toLowerCase(),
    issueDate.trim(),
  ].join("|");

  // Encode to bytes
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);

  // Hash with Web Crypto API (works in both Node.js 18+ and browsers)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return `0x${hashHex}`;
}

/**
 * Compute SHA-256 hash of a file (e.g., PDF certificate).
 * 
 * @param file - File or ArrayBuffer to hash
 * @returns Hex string of the SHA-256 hash (0x-prefixed)
 */
export async function hashFile(file: File | ArrayBuffer): Promise<string> {
  const buffer = file instanceof File ? await file.arrayBuffer() : file;
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return `0x${hashHex}`;
}

/**
 * Convert a hex hash string to bytes32 format for Solidity.
 * Ensures the hash is exactly 32 bytes (64 hex chars) with 0x prefix.
 */
export function toBytes32(hash: string): string {
  const clean = hash.startsWith("0x") ? hash.slice(2) : hash;
  if (clean.length !== 64) {
    throw new Error(`Invalid hash length: expected 64 hex chars, got ${clean.length}`);
  }
  return `0x${clean}`;
}
