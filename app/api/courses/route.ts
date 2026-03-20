import { NextResponse } from 'next/server'
import { seedLearningAppDataIfNeeded } from '@/lib/seedLearningAppData'
import clientPromise from '@/lib/mongodb'
import type { Course } from '@/types/course'

/**
 * `GET /api/courses`
 * Trả về danh sách khóa học lấy từ MongoDB.
 * UI (`app/courses/page.tsx`) dùng endpoint này gián tiếp qua `utils/mockCourseData.ts`.
 *
 * Lưu ý: `seedLearningAppDataIfNeeded()` tự seed dữ liệu nếu collections còn rỗng.
 */
export async function GET() {
  try {
    await seedLearningAppDataIfNeeded()
    const client = await clientPromise
    const db = client.db('learning-app')

    const coursesCol = db.collection('courses')
    const docs = await coursesCol.find({}).sort({ id: 1 }).toArray()

    type CourseDoc = {
      id?: number
      title?: string
      type?: string
      level?: Course['level']
      description?: string
      thumbnail?: string
      lessons?: number
      instructor?: string
      rating?: number
      reviews?: number
      price?: number
      discountedPrice?: number
      enrolledStudents?: number
    }

    // Normalize fields to Course shape
    const items = docs.map((d) => ({
      id: Number((d as CourseDoc).id),
      title: (d as CourseDoc).title ?? '',
      type: (d as CourseDoc).type ?? '',
      level: (d as CourseDoc).level ?? 'S',
      description: (d as CourseDoc).description ?? '',
      thumbnail: (d as CourseDoc).thumbnail ?? '',
      lessons: Number((d as CourseDoc).lessons ?? 0),
      instructor: (d as CourseDoc).instructor ?? '',
      rating: Number((d as CourseDoc).rating ?? 0),
      reviews: Number((d as CourseDoc).reviews ?? 0),
      price: Number((d as CourseDoc).price ?? 0),
      discountedPrice: Number((d as CourseDoc).discountedPrice ?? 0),
      enrolledStudents: Number((d as CourseDoc).enrolledStudents ?? 0),
    }))

    return NextResponse.json({ items })
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to load courses' },
      { status: 500 },
    )
  }
}

