/**
 * Uploads a file to IPFS via the local API route.
 * @param file The file to upload.
 * @returns The IPFS CID (hash).
 */
export const pinToIPFS = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/ipfs", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to upload to IPFS");
  }

  return data.cid;
};

/**
 * Returns the public gateway URL for a given CID.
 * @param cid The IPFS CID.
 * @returns The gateway URL.
 */
export const getGatewayUrl = (cid: string): string => {
  const gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL || "https://gateway.pinata.cloud";
  return `${gateway}/ipfs/${cid}`;
};
