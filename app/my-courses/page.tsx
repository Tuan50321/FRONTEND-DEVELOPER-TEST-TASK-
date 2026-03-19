// Component client-side (sử dụng hooks)
'use client'

// Import hooks React
import { useEffect, useMemo, useState } from 'react'
// Import hook auth
import { useAuth } from '@/contexts/AuthContext'
// Import type Course
import type { Course } from '@/types/course'
// Import utils cho enrollments
import { getEnrolledCourseIds } from '@/utils/enrollmentsStorage'
// Import hàm fetch course
import { fetchCourseById } from '@/utils/mockCourseData'
// Import component CourseCard
import CourseCard from '@/components/CourseCard'

// Component trang "Khóa học của tôi"
export default function MyCoursesPage() {
  // Lấy user từ auth context
  const { user } = useAuth()
  // State lưu danh sách khóa học
  const [courses, setCourses] = useState<Course[]>([])
  // State loading
  const [loading, setLoading] = useState(false)

  // Memoized enrolled IDs để tránh re-compute không cần thiết
  const enrolledIds = useMemo(() => (user ? getEnrolledCourseIds(user.id) : []), [user])

  // useEffect để fetch courses khi user hoặc enrolledIds thay đổi
  useEffect(() => {
    if (!user) return // Nếu không có user, bỏ qua
    let cancelled = false // Flag để cancel async operation
    setLoading(true) // Set loading true

    // Fetch tất cả courses theo enrolled IDs
    Promise.all(enrolledIds.map((id) => fetchCourseById(id)))
      .then((items) => {
        if (cancelled) return // Nếu đã cancel, bỏ qua
        setCourses(items) // Set courses
      })
      .finally(() => {
        if (cancelled) return // Nếu đã cancel, bỏ qua
        setLoading(false) // Set loading false
      })

    return () => {
      cancelled = true // Cleanup: set cancelled true
    }
  }, [user, enrolledIds])

  // Yêu cầu: chưa đăng nhập thì không hiển thị gì hết
  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header với tiêu đề và info user */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Khóa học của tôi</h1>
            <p className="mt-2 text-gray-600">Tài khoản: {user.email}</p>
          </div>
          <div className="text-sm text-gray-600">
            ID user: <span className="font-semibold text-gray-900">{user.id}</span>
          </div>
        </div>

        {/* Hiển thị loading spinner */}
        {loading ? (
          <div className="py-16 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-blue-600" />
            <p className="mt-4 text-gray-600">Đang tải khóa học...</p>
          </div>
        ) : enrolledIds.length === 0 ? ( // Nếu chưa đăng ký khóa học nào
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 text-gray-700">
            Bạn chưa đăng ký khóa học nào.
          </div>
        ) : ( // Nếu có khóa học
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} /> // Render CourseCard cho mỗi course
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

