import * as React from 'react'

export function VisuallyHidden({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className="sr-only"
      {...props}
    >
      {children}
    </div>
  )
}
