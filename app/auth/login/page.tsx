import { LoginForm } from "@/components/auth/login-form"

export const metadata = {
  title: "Login - HRMS Platform",
  description: "Sign in to your HRMS account",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <LoginForm />
    </div>
  )
}
