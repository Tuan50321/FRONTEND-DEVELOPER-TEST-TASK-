'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white">
            L
          </span>
          <span className="text-lg font-bold text-gray-900">Learny</span>
        </a>

        {/* Search */}
        <div className="hidden lg:flex flex-1 max-w-md items-center rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
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
          <input
            type="text"
            placeholder="Tìm khóa học, kỹ năng..."
            className="ml-3 w-full bg-transparent text-sm text-gray-700 outline-none"
          />
        </div>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-4 text-sm font-medium text-gray-700">
          <a href="/courses" className="hover:text-blue-600">
            Khóa học
          </a>
        </nav>

        {/* Profile / Auth */}
        <div className="flex items-center gap-3">
          {mounted && user ? (
            <div className="flex items-center gap-3">
              <span className="hidden md:inline text-sm font-medium text-gray-700">
                Xin chào, {user.firstName}
              </span>
              <button
                onClick={() => {
                  logout()
                  router.push('/auth/login')
                }}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/auth/signup')}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Đăng ký
              </button>
              <button
                onClick={() => router.push('/auth/login')}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                Đăng nhập
              </button>
            </div>
          )}

          <button className="md:hidden text-gray-600">
            ☰
          </button>
        </div>
      </div>
    </header>
  )
}