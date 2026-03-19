'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import type { Course } from '@/types/course'
import { getEnrolledCourseIds } from '@/utils/enrollmentsStorage'
import { fetchCourseById } from '@/utils/mockCourseData'
import CourseCard from '@/components/CourseCard'

export default function MyCoursesPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)

  const enrolledIds = useMemo(() => (user ? getEnrolledCourseIds(user.id) : []), [user])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setLoading(true)

    Promise.all(enrolledIds.map((id) => fetchCourseById(id)))
      .then((items) => {
        if (cancelled) return
        setCourses(items)
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user, enrolledIds])

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
        ) : enrolledIds.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 text-gray-700">
            Bạn chưa đăng ký khóa học nào.
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

