import { NextRequest, NextResponse } from "next/server";
import { hashCertificateData, toBytes32 } from "@/lib/hash";
import { uploadFileToPinata, uploadJSONToPinata } from "@/lib/pinata";
import { issueCertificateOnChain } from "@/lib/blockchain";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const studentName = formData.get("studentName") as string;
    const studentId = formData.get("studentId") as string;
    const degree = formData.get("degree") as string;
    const issueDate = formData.get("issueDate") as string;
    const file = formData.get("file") as File;

    // Validate required fields
    if (!studentName || !studentId || !degree || !issueDate || !file) {
      return NextResponse.json(
        { error: "Missing required fields or certificate file" },
        { status: 400 }
      );
    }

    // Step 1: Upload the actual Certificate FILE to IPFS
    const { cid: fileCID, url: fileUrl } = await uploadFileToPinata(file);

    // Step 2: Compute SHA-256 hash of the record data
    const hashHex = await hashCertificateData(studentName, studentId, degree, issueDate);
    const certHash = toBytes32(hashHex);

    // Step 3: Upload record metadata JSON to IPFS
    const metadata = {
      studentName,
      studentId,
      degree,
      issueDate,
      fileCID,
      fileUrl,
      certHash,
      issuedAt: new Date().toISOString(),
      platform: "SecureVerify",
    };

    const { cid: metadataCID, url: metadataUrl } = await uploadJSONToPinata(
      metadata,
      `cert_${studentId}_${Date.now()}`
    );

    // Step 4: Issue on blockchain (Storing the File CID as the primary reference)
    const { txHash } = await issueCertificateOnChain(
      certHash,
      studentName,
      studentId,
      degree,
      issueDate,
      fileCID // Store the File CID on-chain
    );

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        certHash,
        fileCID,
        fileUrl,
        metadataCID,
        metadataUrl,
        txHash,
        studentName,
        studentId,
        degree,
        issueDate,
      },
    });
  } catch (error: unknown) {
    console.error("Issue certificate error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to issue certificate: ${message}` },
      { status: 500 }
    );
  }
}
