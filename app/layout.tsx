import type React from "react"
// ... existing code ...
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/react"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        {/* <CHANGE> Added Toaster for notifications */}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}


import '../styles/globals.css'

export const metadata = {
      generator: 'v0.app'
    };
