'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import type { Course } from '@/types/course'
import { fetchCourseById } from '@/utils/mockCourseData'
import CourseCard from '@/components/CourseCard'
import { fetchCourseProgress, fetchUserEnrolledCourseIds } from '@/utils/userMongoApi'

export default function MyCoursesPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [progressByCourseId, setProgressByCourseId] = useState<Record<number, { percent: number }>>(
    {},
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    const run = async () => {
      setLoading(true)
      try {
        // Lấy dữ liệu "khóa học của tôi" từ MongoDB:
        // - enrolledIds từ `enrollments`
        // - progress từ `lesson_progress`
        const enrolledIds = await fetchUserEnrolledCourseIds(user.id)
        const [items, progresses] = await Promise.all([
          Promise.all(enrolledIds.map((id) => fetchCourseById(id))),
          Promise.all(enrolledIds.map((id) => fetchCourseProgress(user.id, id))),
        ])

        if (cancelled) return
        setCourses(items)
        setProgressByCourseId(
          enrolledIds.reduce((acc, id, idx) => {
            acc[id] = { percent: progresses[idx]?.percent ?? 0 }
            return acc
          }, {} as Record<number, { percent: number }>),
        )
      } finally {
        if (cancelled) return
        setLoading(false)
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [user])

  // Yêu cầu: chưa đăng nhập thì không hiển thị gì hết
  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Khóa học của tôi</h1>
            <p className="mt-2 text-gray-600">Tài khoản: {user.email}</p>
          </div>
          <div className="text-sm text-gray-600">
            ID user: <span className="font-semibold text-gray-900">{user.id}</span>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-600" />
            <p className="mt-4 text-gray-600">Đang tải khóa học...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 text-gray-700">
            Bạn chưa đăng ký khóa học nào.
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.map((c) => (
              <CourseCard
                key={c.id}
                course={c}
                completed={(() => {
                  return (progressByCourseId[c.id]?.percent ?? 0) === 100
                })()}
                progressPercent={(() => {
                  return progressByCourseId[c.id]?.percent ?? 0
                })()}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

