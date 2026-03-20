import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { seedLearningAppDataIfNeeded } from '@/lib/seedLearningAppData'

/**
 * `GET /api/courses/[courseId]`
 * Lấy 1 khóa học theo `id` từ MongoDB.
 * Frontend dùng endpoint này để render trang chi tiết khóa học.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> },
) {
  try {
    await seedLearningAppDataIfNeeded()
    const { courseId: courseIdParam } = await params
    const courseId = Number(courseIdParam)
    if (!Number.isFinite(courseId)) {
      return NextResponse.json({ error: 'Invalid courseId' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('learning-app')
    const coursesCol = db.collection('courses')
    const doc = await coursesCol.findOne({ id: courseId })
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const item = {
      id: Number(doc.id),
      title: doc.title,
      type: doc.type,
      level: doc.level,
      description: doc.description,
      thumbnail: doc.thumbnail,
      lessons: Number(doc.lessons),
      instructor: doc.instructor,
      rating: Number(doc.rating),
      reviews: Number(doc.reviews),
      price: Number(doc.price ?? 0),
      discountedPrice: Number(doc.discountedPrice ?? 0),
      enrolledStudents: Number(doc.enrolledStudents ?? 0),
    }

    return NextResponse.json({ item })
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to load course' },
      { status: 500 },
    )
  }
}

