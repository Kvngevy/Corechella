import QRCode from "qrcode";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const data = searchParams.get("data");

  if (!data) {
    return NextResponse.json({ error: "Missing data parameter" }, { status: 400 });
  }

  const size = Math.min(512, Math.max(64, Number(searchParams.get("size")) || 256));

  const png = await QRCode.toBuffer(data, {
    type: "png",
    width: size,
    margin: 2,
    color: { dark: "#000000", light: "#FFFFFF" },
  });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
