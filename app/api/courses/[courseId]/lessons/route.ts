import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { seedLearningAppDataIfNeeded } from '@/lib/seedLearningAppData'
import type { LessonStatus } from '@/types/lesson'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    // Frontend có thể truyền `?userId=...` để API trả về `lesson.status`
    // theo bảng `lesson_progress` (đã completed theo đúng user).
    await seedLearningAppDataIfNeeded()
    const { courseId: courseIdParam } = await params
    const courseId = Number(courseIdParam)
    if (!Number.isFinite(courseId)) {
      return NextResponse.json({ error: 'Invalid courseId' }, { status: 400 })
    }

    const url = new URL(req.url)
    const userIdParam = url.searchParams.get('userId')
    const userId = userIdParam ? Number(userIdParam) : undefined

    const client = await clientPromise
    const db = client.db('learning-app')
    const lessonsCol = db.collection('lessons')
    const progressCol = db.collection('lesson_progress')

    type LessonDoc = {
      id: string | number
      courseId: number
      index: number
      title: string
      durationMinutes: number
      status?: LessonStatus
      description: string
      videoThumbnail?: string
    }

    const docs = (await lessonsCol
      .find({ courseId })
      .sort({ index: 1 })
      .toArray()) as unknown as LessonDoc[]

    let progressMap: Map<string, string> | null = null
    if (typeof userId === 'number' && Number.isFinite(userId)) {
      const lessonIds = docs.map((d) => String(d.id))

      type LessonProgressDoc = { lessonId: string; status: LessonStatus }
      const progressDocs = await progressCol
        .find({ userId, courseId, lessonId: { $in: lessonIds } })
        .toArray() as unknown as LessonProgressDoc[]

      progressMap = new Map(progressDocs.map((d) => [String(d.lessonId), String(d.status)]))
    }

    const items = docs.map((d) => ({
      id: String(d.id),
      courseId: Number(d.courseId),
      index: Number(d.index),
      title: d.title,
      durationMinutes: Number(d.durationMinutes),
      status: progressMap ? (progressMap.get(String(d.id)) ?? 'not-started') : d.status ?? 'not-started',
      description: d.description,
      videoThumbnail: d.videoThumbnail ?? undefined,
    }))

    return NextResponse.json({ items })
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to load lessons' },
      { status: 500 },
    )
  }
}

