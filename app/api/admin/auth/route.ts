import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { secretKey } = await request.json()
    const adminKey = process.env.ADMIN_SECRET_KEY

    if (!adminKey) {
      return NextResponse.json({ error: 'Admin key not configured on server' }, { status: 500 })
    }

    if (secretKey === adminKey) {
      return NextResponse.json({ authenticated: true })
    }

    return NextResponse.json({ authenticated: false, error: 'Invalid admin key' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}
