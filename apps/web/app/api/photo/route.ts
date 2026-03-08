import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')
  if (!key) return NextResponse.json({ error: 'key required' }, { status: 400 })

  const session = await auth()
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const res = await fetch(
    `${apiUrl}/storage/presign/download?key=${encodeURIComponent(key)}`,
    { headers: { Authorization: `Bearer ${session.accessToken}` } },
  )

  if (!res.ok) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const { data } = await res.json()
  return NextResponse.redirect(data.url)
}
