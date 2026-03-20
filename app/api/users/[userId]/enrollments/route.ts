import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { seedLearningAppDataIfNeeded } from '@/lib/seedLearningAppData'

/**
 * `GET /api/users/[userId]/enrollments`
 * - Trả về mảng `courseIds` user đã đăng ký.
 *
 * `POST /api/users/[userId]/enrollments`
 * - Body: `{ courseId }`
 * - Dùng để "đăng ký khóa học" và lưu vào MongoDB.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    await seedLearningAppDataIfNeeded()
    const { userId: userIdParam } = await params
    const userId = Number(userIdParam)
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: 'Invalid userId' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('learning-app')
    const enrollCol = db.collection('enrollments')

    type EnrollmentDoc = { courseId: number }
    const docs = (await enrollCol.find({ userId }).toArray()) as unknown as EnrollmentDoc[]
    const courseIds = docs
      .map((d) => Number(d.courseId))
      .filter((n) => Number.isFinite(n))

    return NextResponse.json({ courseIds })
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to load enrollments' },
      { status: 500 },
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    await seedLearningAppDataIfNeeded()
    const { userId: userIdParam } = await params
    const userId = Number(userIdParam)
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: 'Invalid userId' }, { status: 400 })
    }

    const body = (await req.json()) as { courseId: number }
    const courseId = Number(body.courseId)
    if (!Number.isFinite(courseId)) {
      return NextResponse.json({ error: 'Invalid courseId' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('learning-app')
    const enrollCol = db.collection('enrollments')

    await enrollCol.updateOne(
      { userId, courseId },
      { $setOnInsert: { userId, courseId, enrolledAt: new Date() } },
      { upsert: true },
    )

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to enroll course' },
      { status: 500 },
    )
  }
}

