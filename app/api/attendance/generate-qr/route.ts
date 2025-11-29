import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db-wrapper"
import { verifyToken } from "@/lib/auth"
import { encryptToken } from "@/lib/encryption"
import QRCode from "qrcode"

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization")
    let userId: string | null = null

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7)
      const payload = verifyToken(token)
      if (payload) {
        userId = payload.id
      }
    }

    // Generate unique token for this QR code
    const uniqueToken = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const encryptedToken = encryptToken(uniqueToken)

    let officeSettings = await prisma.officeSettings.findFirst()
    if (!officeSettings) {
      officeSettings = await prisma.officeSettings.create({
        data: {
          officeName: "Default Office",
          location: "Default Location",
          latitude: 0,
          longitude: 0,
          qrRotationInterval: 30,
        },
      })
    }

    // Create QR token in database
    const qrToken = await prisma.qrToken.create({
      data: {
        token: uniqueToken,
        encryptedToken,
        officeId: officeSettings.id,
        expiresAt: new Date(Date.now() + (officeSettings.qrRotationInterval || 30) * 1000),
      },
    })

    // Generate QR code with full URL
    const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://hrms.citywitty.com"}/dashboard/attendance/scan?token=${encodeURIComponent(encryptedToken)}`
    const qrCodeDataUrl = await QRCode.toDataURL(qrUrl)

    return NextResponse.json(
      {
        qrCode: qrCodeDataUrl,
        token: uniqueToken,
        qrUrl,
        expiresIn: officeSettings.qrRotationInterval || 30,
        expiresAt: qrToken.expiresAt,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[Generate QR Error]", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
