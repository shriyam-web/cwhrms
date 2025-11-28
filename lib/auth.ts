import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export interface JwtPayload {
  id: string
  email: string
  role: string
  iat: number
  exp: number
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

export function generateToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload
  } catch {
    return null
  }
}

export function generateEmployeeId(birthDate: Date, cityCode: string): string {
  const month = String(birthDate.getMonth() + 1).padStart(2, "0")
  const day = String(birthDate.getDate()).padStart(2, "0")
  const code = cityCode.toUpperCase().slice(0, 3)
  return `CW/${code}-${month}${day}`
}
