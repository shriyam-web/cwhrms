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

export function getISTNow(): Date {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  
  const parts = formatter.formatToParts(now)
  const timeObj: Record<string, string> = {}
  parts.forEach(part => {
    if (part.type !== 'literal') {
      timeObj[part.type] = part.value
    }
  })
  
  const istDate = new Date(Date.UTC(
    parseInt(timeObj.year),
    parseInt(timeObj.month) - 1,
    parseInt(timeObj.day),
    parseInt(timeObj.hour),
    parseInt(timeObj.minute),
    parseInt(timeObj.second)
  ))
  
  return new Date(istDate.getTime() - 5.5 * 60 * 60 * 1000)
}
