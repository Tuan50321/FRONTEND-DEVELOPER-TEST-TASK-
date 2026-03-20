import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

/**
 * `POST /api/auth/signup`
 * Tạo user mới trong MongoDB.
 *
 * Lưu ý demo:
 * - Lưu password dạng text (chỉ phục vụ test UI)
 * - Email phải duy nhất (unique theo collection `users`)
 */

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      email: string
      password: string
      fullName: string
    }

    const email = normalizeEmail(body.email || '')
    const password = body.password || ''
    const fullName = body.fullName || ''

    const emailOk = /\S+@\S+\.\S+/.test(email)
    if (!emailOk) {
      return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Mật khẩu tối thiểu 6 ký tự' }, { status: 400 })
    }
    if (fullName.trim().length < 2) {
      return NextResponse.json({ error: 'Họ và tên không hợp lệ' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('learning-app')
    const usersCol = db.collection('users')

    const existing = await usersCol.findOne({ email })
    if (existing) {
      return NextResponse.json({ error: 'Email đã tồn tại' }, { status: 409 })
    }

    const username = email.split('@')[0]
    const nameParts = fullName.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    const userDoc = {
      id: Date.now(),
      username,
      email,
      firstName,
      lastName,
      gender: 'other',
      image: `https://dummyjson.com/icon/${username}/128`,
      password,
      createdAt: new Date(),
    }

    await usersCol.insertOne(userDoc)

    const { password: _pw, ...user } = userDoc
    return NextResponse.json({ user })
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Signup failed' },
      { status: 500 },
    )
  }
}

