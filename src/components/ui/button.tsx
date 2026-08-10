import * as React from "react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    
    const variants = {
      default: "bg-sage-deep text-white hover:bg-sage-deep/90 focus:ring-sage-deep shadow-lg",
      outline: "border-2 border-line text-ink hover:bg-paper-warm focus:ring-sage-deep",
      ghost: "text-ink hover:bg-paper-warm focus:ring-sage-deep"
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