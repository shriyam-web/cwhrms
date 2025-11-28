import { SignupForm } from "@/components/auth/signup-form"

export const metadata = {
  title: "Sign Up - HRMS Platform",
  description: "Create your HRMS account",
}

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <SignupForm />
    </div>
  )
}
