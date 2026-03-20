import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { seedLearningAppDataIfNeeded } from '@/lib/seedLearningAppData'

/**
 * `GET /api/users/[userId]/courses/[courseId]/progress`
 * Trả về:
 * - `completed`: số bài đã completed
 * - `total`: tổng số bài trong course
 * - `percent`: phần trăm hoàn thành
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string; courseId: string }> },
) {
  try {
    await seedLearningAppDataIfNeeded()
    const { userId: userIdParam, courseId: courseIdParam } = await params
    const userId = Number(userIdParam)
    const courseId = Number(courseIdParam)
    if (!Number.isFinite(userId) || !Number.isFinite(courseId)) {
      return NextResponse.json({ error: 'Invalid userId/courseId' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('learning-app')
    const lessonsCol = db.collection('lessons')
    const progressCol = db.collection('lesson_progress')

    const total = await lessonsCol.countDocuments({ courseId })
    const completed = await progressCol.countDocuments({ userId, courseId, status: 'completed' })
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100)

    return NextResponse.json({ completed, total, percent })
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to load progress' },
      { status: 500 },
    )
  }
}

