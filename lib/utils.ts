import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateEmployeeCode(city: string, dateOfBirth: Date): string {
  // Get first 3 letters of city, uppercase
  const cityCode = city.replace(/\s+/g, '').substring(0, 3).toUpperCase()

  // Format date as DDMM
  const day = String(dateOfBirth.getDate()).padStart(2, '0')
  const month = String(dateOfBirth.getMonth() + 1).padStart(2, '0')
  const dateCode = `${day}${month}`

  return `CW/${cityCode}-${dateCode}`
}
