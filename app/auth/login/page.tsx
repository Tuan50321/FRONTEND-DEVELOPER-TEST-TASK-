// Component client-side cho trang đăng nhập
'use client'

// Import hooks React
import { useState } from 'react'
// Import hook router của Next.js
import { useRouter } from 'next/navigation'
// Import Link để navigation
import Link from 'next/link'
// Import hook auth từ context
import { useAuth } from '@/contexts/AuthContext'

// Component trang đăng nhập
export default function LoginPage() {
  // Lấy hàm login từ auth context
  const { login } = useAuth()
  // Hook router để chuyển trang
  const router = useRouter()

  // State lưu email
  const [email, setEmail] = useState('')
  // State lưu mật khẩu
  const [password, setPassword] = useState('')
  // State lưu lỗi (nếu có)
  const [error, setError] = useState('')
  // State loading khi đang xử lý
  const [loading, setLoading] = useState(false)

  // Kiểm tra form có hợp lệ không
  const isValid = email.trim() !== '' && /\S+@\S+\.\S+/.test(email) && password.length >= 6

  // Hàm xử lý đăng nhập
  const handleLogin = async () => {
    setLoading(true) // Bật loading
    setError('') // Xóa lỗi cũ
    const success = await login(email, password) // Gọi hàm login
    setLoading(false) // Tắt loading
    if (success) {
      router.push('/courses') // Thành công -> chuyển đến trang courses
    } else {
      setError('Sai email hoặc mật khẩu') // Thất bại -> hiển thị lỗi
    }
  }

  return (
    // Container form đăng nhập
    <div className="max-w-sm mx-auto mt-20 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Đăng nhập</h2>

      {/* Input email */}
      <input
        type="email"
        placeholder="Email"
        className="w-full border p-2 mb-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)} // Cập nhật email
      />

      {/* Input mật khẩu */}
      <input
        type="password"
        placeholder="Mật khẩu"
        className="w-full border p-2 mb-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)} // Cập nhật mật khẩu
      />

      {/* Hiển thị lỗi nếu có */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Button đăng nhập */}
      <button
        disabled={!isValid || loading} // Disable nếu không hợp lệ hoặc đang loading
        onClick={handleLogin} // Gọi hàm đăng nhập
        className="w-full bg-blue-500 text-white p-2 mt-3 disabled:bg-gray-300"
      >
        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'} {/* Text thay đổi theo trạng thái */}
      </button>

      {/* Link đến trang đăng ký */}
      <div className="text-center mt-4">
        <p className="text-gray-600 text-sm">
          Chưa có tài khoản?{' '}
          <Link href="/auth/signup" className="text-blue-500 hover:text-blue-700 font-medium">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  )
}