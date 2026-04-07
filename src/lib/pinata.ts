/**
 * SecureVerify — Pinata IPFS Integration
 * 
 * Server-side only: uploads certificate data to IPFS via Pinata.
 * Never expose PINATA_JWT to client-side code.
 */

const PINATA_API_URL = "https://api.pinata.cloud";
const PINATA_JWT = process.env.PINATA_JWT || "";
const GATEWAY_URL = process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL || "https://gateway.pinata.cloud";

interface PinataUploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

/**
 * Upload a file to IPFS via Pinata
 */
export async function uploadFileToPinata(file: File): Promise<{ cid: string; url: string }> {
  if (process.env.NEXT_PUBLIC_MOCK_MODE === "true") {
    // Mock mode: return a fake CID for local development
    const mockCID = "Qm" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + "MockCID";
    return {
      cid: mockCID,
      url: `${GATEWAY_URL}/ipfs/${mockCID}`,
    };
  }

  const formData = new FormData();
  formData.append("file", file);

  const metadata = JSON.stringify({
    name: `SecureVerify_${file.name}`,
  });
  formData.append("pinataMetadata", metadata);

  const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Pinata upload failed: ${response.statusText}`);
  }

  const data: PinataUploadResponse = await response.json();
  return {
    cid: data.IpfsHash,
    url: `${GATEWAY_URL}/ipfs/${data.IpfsHash}`,
  };
}

/**
 * Upload JSON metadata to IPFS via Pinata
 */
export async function uploadJSONToPinata(
  jsonData: Record<string, unknown>,
  name: string
): Promise<{ cid: string; url: string }> {
  if (process.env.NEXT_PUBLIC_MOCK_MODE === "true") {
    const mockCID = "Qm" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + "MockJSON";
    return {
      cid: mockCID,
      url: `${GATEWAY_URL}/ipfs/${mockCID}`,
    };
  }

  const response = await fetch(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify({
      pinataContent: jsonData,
      pinataMetadata: { name: `SecureVerify_${name}` },
    }),
  });

  if (!response.ok) {
    throw new Error(`Pinata JSON upload failed: ${response.statusText}`);
  }

  const data: PinataUploadResponse = await response.json();
  return {
    cid: data.IpfsHash,
    url: `${GATEWAY_URL}/ipfs/${data.IpfsHash}`,
  };
}
