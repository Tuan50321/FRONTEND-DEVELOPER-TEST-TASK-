import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

/**
 * `POST /api/auth/login`
 * Kiểm tra email/password trong MongoDB (`users`).
 * Trả về user (không bao gồm password) để UI set session local.
 */
function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email: string; password: string }
    const email = normalizeEmail(body.email || '')
    const password = body.password || ''

    if (!email) return NextResponse.json({ error: 'Email bắt buộc' }, { status: 400 })
    if (!password) return NextResponse.json({ error: 'Mật khẩu bắt buộc' }, { status: 400 })

    const client = await clientPromise
    const db = client.db('learning-app')
    const usersCol = db.collection('users')

    const user = await usersCol.findOne<{ id: number; email: string; password: string }>(
      { email, password },
    )

    if (!user) {
      return NextResponse.json({ error: 'Sai email hoặc mật khẩu' }, { status: 401 })
    }

    const { password: _pw, ...safeUser } = user
    return NextResponse.json({ user: safeUser })
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Login failed' },
      { status: 500 },
    )
  }
}

