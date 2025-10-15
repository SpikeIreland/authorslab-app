import * as React from "react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    
    const variants = {
      default: "bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 focus:ring-yellow-400 shadow-lg",
      outline: "border-2 border-blue-900 text-blue-900 hover:bg-blue-50 focus:ring-blue-900",
      ghost: "text-blue-900 hover:bg-blue-50 focus:ring-blue-900"
    }
    
    const sizeStyles = "px-6 py-3 text-base"
    
    return (
      <button
        className={`${baseStyles} ${variants[variant]} ${sizeStyles} ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }