import Link from "next/link"
import { Button } from "@/components/ui/button"
// hello kitty
export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-12">
      <div className="max-w-2xl space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold text-white">HRMS Platform</h1>
          <p className="text-xl text-slate-300">
            Streamline your HR operations with our comprehensive management system
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row justify-center">
          <Link href="/auth/login">
            <Button size="lg" variant="default">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="lg" variant="outline">
              Create Account
            </Button>
          </Link>
        </div>

        <div className="space-y-4 pt-8">
          <h2 className="text-2xl font-semibold text-white">Features</h2>
          <ul className="space-y-2 text-slate-300">
            <li>✓ Employee & Agent Management</li>
            <li>✓ QR Code Attendance Tracking</li>
            <li>✓ Payroll Management</li>
            <li>✓ Performance Tracking</li>
            <li>✓ Real-time Notifications</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
