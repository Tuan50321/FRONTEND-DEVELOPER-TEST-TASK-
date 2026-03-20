import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { seedLearningAppDataIfNeeded } from '@/lib/seedLearningAppData'

/**
 * `DELETE /api/users/[userId]/enrollments/[courseId]`
 * Xóa enrollment của user khỏi MongoDB.
 */
export async function DELETE(
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
    const enrollCol = db.collection('enrollments')

    await enrollCol.deleteOne({ userId, courseId })
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to unenroll course' },
      { status: 500 },
    )
  }
}

