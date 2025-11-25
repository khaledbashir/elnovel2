import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        // Dynamic import for pdf-parse module
        const pdfParseModule = await import('pdf-parse');
        const parsePDF = (pdfParseModule as any).default || pdfParseModule;
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 },
            );
        }

        // Validate file type
        if (file.type !== "application/pdf") {
            return NextResponse.json(
                {
                    error: "Only PDF files are supported. Please upload a PDF document.",
                },
                { status: 400 },
            );
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                {
                    error: "File too large. Maximum size is 10MB.",
                },
                { status: 413 },
            );
        }

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Parse PDF
        const data = await parsePDF(buffer);

        // Return parsed data
        return NextResponse.json({
            success: true,
            text: data.text,
            pages: data.numpages,
            metadata: {
                fileName: file.name,
                fileSize: file.size,
                uploadedAt: new Date().toISOString(),
            },
        });
    } catch (error: any) {
        console.error("PDF parsing error:", error);

        // Handle specific error cases
        if (error.message?.includes("encrypted")) {
            return NextResponse.json(
                {
                    error: "PDF is encrypted. Please provide an unencrypted version.",
                },
                { status: 400 },
            );
        }

        if (error.message?.includes("Invalid PDF")) {
            return NextResponse.json(
                {
                    error: "Invalid or corrupted PDF file. Please check the file and try again.",
                },
                { status: 400 },
            );
        }

        return NextResponse.json(
            {
                error: "Failed to parse PDF. The file may be corrupted or in an unsupported format.",
            },
            { status: 500 },
        );
    }
}
