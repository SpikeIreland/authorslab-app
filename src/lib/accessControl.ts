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
        .eq('auth_user_id', userId)
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

    // For now, admin and beta testers get full access
    // Package detection will be added when Complete Package is implemented in Stripe
    const purchased_package: PackageType = null  // TODO: Implement package detection

    const hasFullAccess = profile.is_admin || profile.is_beta_tester || purchased_package === 'complete'

    console.log('👤 User Access Check:', {
        userId,
        is_admin: profile.is_admin,
        is_beta_tester: profile.is_beta_tester,
        hasFullAccess
    })

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

    // For now, no package = no access
    // TODO: Add proper package checking when Stripe integration is complete
    return false
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