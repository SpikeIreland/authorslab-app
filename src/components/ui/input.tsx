import * as React from "react"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`flex w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-base ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus:border-blue-900 focus:ring-2 focus:ring-blue-900 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-all ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }