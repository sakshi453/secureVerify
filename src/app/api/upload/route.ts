import { NextRequest, NextResponse } from "next/server";
import { uploadFileToPinata } from "@/lib/pinata";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const { cid, url } = await uploadFileToPinata(file);

    return NextResponse.json({
      success: true,
      data: {
        cid,
        url,
        fileName: file.name,
        fileSize: file.size,
      },
    });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to upload file: ${message}` },
      { status: 500 }
    );
  }
}
