import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

function verifyAdmin(request: NextRequest) {
  const adminKey = request.headers.get('x-admin-key')
  return adminKey === process.env.ADMIN_SECRET_KEY
}

// GET /api/admin/users — list all users
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = getAdminClient()
    const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const users = data.users.map((u) => ({
      id: u.id,
      email: u.email,
      email_confirmed_at: u.email_confirmed_at,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      role: u.role,
    }))

    return NextResponse.json({ users })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
