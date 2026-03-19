// Component client-side (sử dụng hooks)
'use client'

// Import hooks và context
import { useAuth } from '@/contexts/AuthContext' // Hook auth
import { useRouter } from 'next/navigation' // Hook router của Next.js
import { useEffect, useState } from 'react' // Hooks React

// Component Header - Thanh điều hướng trên cùng
export default function Header() {
  // Lấy user và logout từ auth context
  const { user, logout } = useAuth()
  // Hook router để navigation
  const router = useRouter()
  // State kiểm tra component đã mount (tránh hydration mismatch)
  const [mounted, setMounted] = useState(false)
  // State cho query tìm kiếm
  const [query, setQuery] = useState('')

  // useEffect để set mounted = true sau khi component mount
  useEffect(() => setMounted(true), [])

  // Hàm xử lý tìm kiếm
  const goSearch = () => {
    const q = query.trim() // Loại bỏ khoảng trắng
    if (!q) {
      router.push('/courses') // Nếu không có query, đi đến trang courses
      return
    }
    router.push(`/courses?q=${encodeURIComponent(q)}`) // Navigate với query
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        {/* Logo - Link về trang chủ */}
        <a href="/" className="flex items-center gap-2">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white">
            L {/* Icon logo */}
          </span>
          <span className="text-lg font-bold text-gray-900">Learny</span> {/* Tên app */}
        </a>

        {/* Search - Thanh tìm kiếm (ẩn trên mobile) */}
        <div className="hidden lg:flex flex-1 max-w-md items-center rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
          {/* Icon search */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 9.5 17.5a7.5 7.5 0 0 0 7.15-4.15z"
            />
          </svg>
          {/* Input tìm kiếm */}
          <input
            type="text"
            placeholder="Tìm khóa học, kỹ năng..."
            value={query}
            onChange={(e) => setQuery(e.target.value)} // Cập nhật state query
            onKeyDown={(e) => {
              if (e.key === 'Enter') goSearch() // Tìm khi nhấn Enter
            }}
            className="ml-3 w-full bg-transparent text-sm text-gray-700 outline-none"
          />
          {/* Button tìm */}
          <button
            type="button"
            onClick={goSearch} // Gọi hàm tìm kiếm
            className="ml-2 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Tìm
          </button>
        </div>

        {/* Navigation - Menu điều hướng (ẩn trên mobile) */}
        <nav className="hidden lg:flex items-center gap-4 text-sm font-medium text-gray-700">
          <a href="/courses" className="hover:text-blue-600">
            Khóa học
          </a>
          {/* Chỉ hiển thị "Khóa học của tôi" nếu đã đăng nhập */}
          {mounted && user ? (
            <a href="/my-courses" className="hover:text-blue-600">
              Khóa học của tôi
            </a>
          ) : null}
        </nav>

        {/* Profile / Auth - Phần đăng nhập/đăng ký hoặc profile */}
        <div className="flex items-center gap-3">
          {/* Nếu đã đăng nhập */}
          {mounted && user ? (
            <div className="flex items-center gap-3">
              {/* Hiển thị tên người dùng (ẩn trên mobile) */}
              <span className="hidden md:inline text-sm font-medium text-gray-700">
                Xin chào, {user.firstName}
              </span>
              {/* Button đăng xuất */}
              <button
                onClick={() => {
                  logout() // Gọi hàm logout
                  router.push('/auth/login') // Chuyển về trang login
                }}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            /* Nếu chưa đăng nhập */
            <div className="flex items-center gap-2">
              {/* Button đăng ký */}
              <button
                onClick={() => router.push('/auth/signup')}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Đăng ký
              </button>
              {/* Button đăng nhập */}
              <button
                onClick={() => router.push('/auth/login')}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                Đăng nhập
              </button>
            </div>
          )}

          {/* Button menu mobile (hamburger) */}
          <button className="md:hidden text-gray-600">
            ☰
          </button>
        </div>
      </div>
    </header>
  )
}