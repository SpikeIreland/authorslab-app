'use client'

import { useState } from 'react'

export function BetaBanner() {
    const [dismissed, setDismissed] = useState(false)

    if (dismissed) return null

    return (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 relative">
            <div className="container mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">🚀</span>
                    <div className="text-sm md:text-base">
                        <strong>Early Access Pricing!</strong> AuthorsLab is in beta - help us refine the platform and lock in this special $299 rate.
                        <span className="hidden md:inline"> Your feedback shapes our future.</span>
                    </div>
                </div>
                <button
                    onClick={() => setDismissed(true)}
                    className="text-white/80 hover:text-white text-xl px-2"
                    aria-label="Dismiss"
                >
                    ×
                </button>
            </div>
        </div>
    )
}