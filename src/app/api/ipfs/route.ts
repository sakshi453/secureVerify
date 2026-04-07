import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const pinataFormData = new FormData();
    pinataFormData.append("file", file);

    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        type: "certificate",
      },
    });
    pinataFormData.append("pinataMetadata", metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    pinataFormData.append("pinataOptions", options);

    // Handle Mock Mode for local testing without Pinata keys
    if (process.env.NEXT_PUBLIC_MOCK_MODE === "true" || process.env.PINATA_JWT === "demo-pinata-jwt") {
      console.log("Mocking IPFS upload...");
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      return NextResponse.json({ cid: `mock-cid-${Date.now()}` });
    }

    if (!process.env.PINATA_JWT || process.env.PINATA_JWT === "" || process.env.PINATA_JWT.length < 20) {
       return NextResponse.json({ error: "Pinata JWT is missing or invalid. Please check .env.local" }, { status: 500 });
    }

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: pinataFormData,
    });

    const resData = await res.json();

    if (!res.ok) {
      // Pinata errors can sometimes be objects ({ message: "..." })
      const errorMsg = typeof resData.error === "object" ? resData.error.message : resData.error;
      throw new Error(errorMsg || "Failed to upload to Pinata (Status: " + res.status + ")");
    }

    return NextResponse.json({ cid: String(resData.IpfsHash) });
  } catch (error: any) {
    console.error("IPFS Upload Error Details:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
