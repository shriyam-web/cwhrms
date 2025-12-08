import type React from "react"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/react"
import '../styles/globals.css'

export const metadata = {
  title: 'CityWitty HRMS - Employee Management System',
  description: 'Powerful HRMS solution designed for CityWitty Community. Streamline attendance, payroll, and performance management with our comprehensive platform.',
  keywords: ['HRMS', 'Human Resource Management', 'Employee Management', 'Payroll', 'Attendance Tracking'],
  openGraph: {
    title: 'CityWitty HRMS - Employee Management System',
    description: 'Powerful HRMS solution designed for CityWitty Community',
    type: 'website',
    url: 'https://hrms.citywittycommunity.com',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`font-sans antialiased`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
