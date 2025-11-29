import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";

const CACHE_DIR = path.join(process.cwd(), "cache");
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const prompt = searchParams.get("prompt");
  const size = searchParams.get("size") || "1024x1024";
  const seed = searchParams.get("seed") || Math.floor(Math.random() * 1000000).toString();
  const nologo = searchParams.get("nologo") || "true";

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const src = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1280&height=1024&nologo=${nologo}&seed=${seed}&model=flux`;
  
  // Generate cache key based on the full source URL
  const key = crypto.createHash("sha1").update(src).digest("hex");
  const filePath = path.join(CACHE_DIR, `${key}.png`);

  try {
    // Check cache
    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // Fetch from upstream
    const response = await fetch(src, {
        // Pollinations can sometimes be slow, give it time
        signal: AbortSignal.timeout(60000) 
    });

    if (!response.ok) {
      throw new Error(`Upstream error: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save to cache
    fs.writeFileSync(filePath, buffer);

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
