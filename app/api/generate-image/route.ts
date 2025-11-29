import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge"; // Use edge runtime for speed

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const prompt = searchParams.get("prompt");
  const size = searchParams.get("size") || "1024x1024";
  const seed = searchParams.get("seed") || Math.floor(Math.random() * 1000000).toString();
  const nologo = searchParams.get("nologo") || "true";

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  // Pollinations URL
  const src = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1280&height=1024&nologo=${nologo}&seed=${seed}&model=flux`;

  try {
    // Fetch from upstream
    const response = await fetch(src);

    if (!response.ok) {
      throw new Error(`Upstream error: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate image", details: error.message },
      { status: 502 }
    );
  }
}
