import { type NextRequest, NextResponse } from "next/server"
import jsQR from "jsqr"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { imageData, width, height } = body

    if (!imageData || !width || !height) {
      return NextResponse.json(
        { error: "Invalid image data" },
        { status: 400 }
      )
    }

    const uint8Array = new Uint8ClampedArray(imageData)
    const code = jsQR(uint8Array, width, height)

    if (code?.data) {
      const qrText = code.data
      const tokenMatch = qrText.match(/token=([^&]+)/)
      
      if (tokenMatch && tokenMatch[1]) {
        const token = decodeURIComponent(tokenMatch[1])
        return NextResponse.json({ token }, { status: 200 })
      }
    }

    return NextResponse.json(
      { message: "No QR code detected" },
      { status: 200 }
    )
  } catch (error) {
    console.error("[QR Scan Error]", error)
    return NextResponse.json(
      { error: "Failed to scan QR code" },
      { status: 500 }
    )
  }
}
