import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { studentId, account } = await request.json();

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    // This is a Mock search for the Holder process demonstration
    // In a production app, this would query a blockchain indexer or Firestore
    const mockRecords = [
      {
        studentName: "John Doe",
        degree: "Bachelor of Computer Science",
        issueDate: "2024-06-15",
        ipfsCID: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
        issuer: "0x1234...5678",
      }
    ];

    // Only return if it matches our "demo" student ID
    if (studentId === "STU-2024-001" || studentId === "demo") {
      return NextResponse.json({ records: mockRecords });
    }

    return NextResponse.json({ records: [] });
  } catch (error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
