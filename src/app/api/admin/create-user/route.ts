import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Initialize Supabase Admin client (has elevated privileges)
// This uses the SERVICE_ROLE_KEY which bypasses RLS
const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

export async function POST(request: Request) {
    try {
        // Get request body
        const { email, password, firstName, lastName } = await request.json()

        // Validate inputs
        if (!email || !password || !firstName || !lastName) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Verify the requesting user is an admin
        // Get the auth token from the request
        const authHeader = request.headers.get('authorization')
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Verify admin status using the regular client
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Check if requesting user is admin
        const { data: profile } = await supabaseAdmin
            .from('author_profiles')
            .select('role')
            .eq('auth_user_id', user.id)  // ← FIXED: Query by auth_user_id
            .single()

        if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
            return NextResponse.json(
                { error: 'Insufficient permissions' },
                { status: 403 }
            )
        }

        // Create the new user using admin API
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm email
            user_metadata: {
                first_name: firstName,
                last_name: lastName
            }
        })

        if (createError) {
            console.error('Error creating user:', createError)
            return NextResponse.json(
                { error: createError.message },
                { status: 400 }
            )
        }

        if (!newUser.user) {
            return NextResponse.json(
                { error: 'Failed to create user' },
                { status: 500 }
            )
        }

        // Update author_profiles with beta tester status and admin info
        const { error: profileError } = await supabaseAdmin
            .from('author_profiles')
            .update({
                is_beta_tester: true,
                created_by_admin_id: user.id
            })
            .eq('id', newUser.user.id)

        if (profileError) {
            console.error('Error updating profile:', profileError)
            // Don't fail the request, user is created
        }

        return NextResponse.json({
            success: true,
            userId: newUser.user.id,
            email: newUser.user.email
        })

    } catch (error) {
        console.error('Error in create-user API:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}