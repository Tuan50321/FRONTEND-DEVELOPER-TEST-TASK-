import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { seedLearningAppDataIfNeeded } from '@/lib/seedLearningAppData'

type LessonStatus = 'not-started' | 'in-progress' | 'completed'

/**
 * `GET /api/users/[userId]/courses/[courseId]/lessons/[lessonId]`
 * `POST /api/users/[userId]/courses/[courseId]/lessons/[lessonId]`
 *
 * API này lưu/đọc `status` của 1 bài theo user trong MongoDB (`lesson_progress`).
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string; courseId: string; lessonId: string }> },
) {
  try {
    await seedLearningAppDataIfNeeded()
    const { userId: userIdParam, courseId: courseIdParam, lessonId } = await params
    const userId = Number(userIdParam)
    const courseId = Number(courseIdParam)
    if (!Number.isFinite(userId) || !Number.isFinite(courseId)) {
      return NextResponse.json({ error: 'Invalid userId/courseId' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('learning-app')
    const progressCol = db.collection('lesson_progress')

    const doc = await progressCol.findOne<{ status: LessonStatus }>({ userId, courseId, lessonId })
    return NextResponse.json({ status: doc?.status ?? 'not-started' })
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to load lesson status' },
      { status: 500 },
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string; courseId: string; lessonId: string }> },
) {
  try {
    await seedLearningAppDataIfNeeded()
    const { userId: userIdParam, courseId: courseIdParam, lessonId } = await params
    const userId = Number(userIdParam)
    const courseId = Number(courseIdParam)
    if (!Number.isFinite(userId) || !Number.isFinite(courseId)) {
      return NextResponse.json({ error: 'Invalid userId/courseId' }, { status: 400 })
    }

    const body = (await req.json()) as { status: LessonStatus }
    const status = body.status
    if (status !== 'not-started' && status !== 'in-progress' && status !== 'completed') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('learning-app')
    const progressCol = db.collection('lesson_progress')

    await progressCol.updateOne(
      { userId, courseId, lessonId },
      { $set: { userId, courseId, lessonId, status, updatedAt: new Date() } },
      { upsert: true },
    )

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to update lesson status' },
      { status: 500 },
    )
  }
}

