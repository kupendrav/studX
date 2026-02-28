import { NextRequest, NextResponse } from 'next/server'

// POST /api/admin/auth — verify admin secret
export async function POST(request: NextRequest) {
  try {
    const { secretKey } = await request.json()
    
    if (secretKey === process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ authenticated: true })
    }
    
    return NextResponse.json({ error: 'Invalid admin key' }, { status: 401 })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
