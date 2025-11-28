import crypto from "crypto"

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-key-32-chars-long-!!!"

export function encryptToken(token: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY.padEnd(32, "0").slice(0, 32)), iv)

  let encrypted = cipher.update(token, "utf8", "hex")
  encrypted += cipher.final("hex")

  return iv.toString("hex") + ":" + encrypted
}

export function decryptToken(encryptedToken: string): string {
  const parts = encryptedToken.split(":")
  const iv = Buffer.from(parts[0], "hex")
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY.padEnd(32, "0").slice(0, 32)), iv)

  let decrypted = decipher.update(parts[1], "hex", "utf8")
  decrypted += decipher.final("utf8")

  return decrypted
}
