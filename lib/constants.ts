export const ROLES = {
  ADMIN: "ADMIN",
  HR: "HR",
  MANAGER: "MANAGER",
  EMPLOYEE: "EMPLOYEE",
  AGENT: "AGENT",
} as const

export const EMPLOYMENT_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  ON_LEAVE: "ON_LEAVE",
  TERMINATED: "TERMINATED",
} as const

export const ATTENDANCE_STATUS = {
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
  HALF_DAY: "HALF_DAY",
  LATE: "LATE",
} as const

export const PAYOUT_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  PROCESSED: "PROCESSED",
  PAID: "PAID",
  REJECTED: "REJECTED",
} as const

export const QR_ROTATION_INTERVAL = 30 // seconds
export const ATTENDANCE_RADIUS = 100 // meters
