"use client"

interface StatusBadgeProps {
  status: string
  variant?: "success" | "warning" | "error" | "info"
}

export function StatusBadge({ status, variant = "info" }: StatusBadgeProps) {
  const variants = {
    success: "bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300",
    warning: "bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300",
    error: "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300",
    info: "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300",
  }

  const formatStatus = (str: string) => {
    return str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>
      {formatStatus(status)}
    </span>
  )
}
