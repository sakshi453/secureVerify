import { NextRequest, NextResponse } from "next/server";
import { hashCertificateData, toBytes32 } from "@/lib/hash";
import { verifyCertificateOnChain } from "@/lib/blockchain";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { certHash, studentName, studentId, degree, issueDate } = body;

    let hashToVerify: string;

    if (certHash) {
      // Direct hash verification
      hashToVerify = certHash.startsWith("0x") ? certHash : `0x${certHash}`;
    } else if (studentName && studentId && degree && issueDate) {
      // Recompute hash from data fields
      const hashHex = await hashCertificateData(studentName, studentId, degree, issueDate);
      hashToVerify = toBytes32(hashHex);
    } else {
      return NextResponse.json(
        { error: "Provide either certHash or all certificate fields (studentName, studentId, degree, issueDate)" },
        { status: 400 }
      );
    }

    // Query blockchain
    const result = await verifyCertificateOnChain(hashToVerify);

    return NextResponse.json({
      success: true,
      verified: result.exists && !result.revoked,
      data: {
        certHash: hashToVerify,
        exists: result.exists,
        revoked: result.revoked,
        studentName: result.studentName,
        studentId: result.studentId,
        degree: result.degree,
        issueDate: result.issueDate,
        ipfsCID: result.ipfsCID,
        issuer: result.issuer,
        timestamp: result.timestamp,
      },
    });
  } catch (error: unknown) {
    console.error("Verify certificate error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to verify certificate: ${message}` },
      { status: 500 }
    );
  }
}
