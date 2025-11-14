/**
 * Access Control Helper
 * Centralized logic for determining user access to different phases
 */

import { createClient } from '@/lib/supabase/client'

export type PackageType = 'editing' | 'complete' | null

export interface UserAccess {
    is_admin: boolean
    is_beta_tester: boolean
    purchased_package: PackageType
    hasFullAccess: boolean
}

/**
 * Gets the user's access level and package type
 */
export async function getUserAccess(userId: string): Promise<UserAccess> {
    const supabase = createClient()

    const { data: profile, error } = await supabase
        .from('author_profiles')
        .select('is_admin, is_beta_tester')
        .eq('user_id', userId)
        .single()

    if (error || !profile) {
        console.error('Error fetching user access:', error)
        return {
            is_admin: false,
            is_beta_tester: false,
            purchased_package: null,
            hasFullAccess: false
        }
    }

    // For now, determine package from purchased phases
    // TODO: Update this when package_type column is added to database
    const { data: purchases } = await supabase
        .from('user_purchases')
        .select('phase_number')
        .eq('user_id', userId)

    let purchased_package: PackageType = null

    if (purchases && purchases.length > 0) {
        const phaseNumbers = purchases.map(p => p.phase_number)
        // If they have phase 4 or 5, they have complete package
        if (phaseNumbers.includes(4) || phaseNumbers.includes(5)) {
            purchased_package = 'complete'
        } else if (phaseNumbers.includes(1) || phaseNumbers.includes(2) || phaseNumbers.includes(3)) {
            purchased_package = 'editing'
        }
    }

    const hasFullAccess = profile.is_admin || profile.is_beta_tester || purchased_package === 'complete'

    return {
        is_admin: profile.is_admin || false,
        is_beta_tester: profile.is_beta_tester || false,
        purchased_package,
        hasFullAccess
    }
}

/**
 * Check if user has access to a specific phase
 */
export async function hasPhaseAccess(userId: string, phaseNumber: number): Promise<boolean> {
    const access = await getUserAccess(userId)

    // Admins and beta testers get full access
    if (access.is_admin || access.is_beta_tester) {
        return true
    }

    // Complete package gets access to all phases
    if (access.purchased_package === 'complete') {
        return true
    }

    // Editing package only gets phases 1-3
    if (access.purchased_package === 'editing' && phaseNumber <= 3) {
        return true
    }

    // Otherwise, check if they specifically purchased this phase
    const supabase = createClient()
    const { data: purchase } = await supabase
        .from('user_purchases')
        .select('id')
        .eq('user_id', userId)
        .eq('phase_number', phaseNumber)
        .single()

    return !!purchase
}

/**
 * Get user's package display name
 */
export function getPackageDisplayName(packageType: PackageType): string {
    switch (packageType) {
        case 'editing':
            return 'Editing Package'
        case 'complete':
            return 'Complete Package'
        default:
            return 'No Package'
    }
}

/**
 * Check if user needs to upgrade to access phase
 */
export async function needsUpgradeForPhase(userId: string, phaseNumber: number): Promise<boolean> {
    const access = await getUserAccess(userId)

    // Admins and beta testers never need upgrade
    if (access.is_admin || access.is_beta_tester) {
        return false
    }

    // Complete package never needs upgrade
    if (access.purchased_package === 'complete') {
        return false
    }

    // Editing package needs upgrade for phase 4+
    if (access.purchased_package === 'editing' && phaseNumber >= 4) {
        return true
    }

    // No package = needs to purchase
    return access.purchased_package === null
}

/**
 * Get available phases for user
 */
export async function getAvailablePhases(userId: string): Promise<number[]> {
    const access = await getUserAccess(userId)

    // Admins and beta testers get all phases
    if (access.is_admin || access.is_beta_tester) {
        return [1, 2, 3, 4, 5]
    }

    // Complete package gets all phases
    if (access.purchased_package === 'complete') {
        return [1, 2, 3, 4, 5]
    }

    // Editing package gets phases 1-3
    if (access.purchased_package === 'editing') {
        return [1, 2, 3]
    }

    // No package
    return []
}