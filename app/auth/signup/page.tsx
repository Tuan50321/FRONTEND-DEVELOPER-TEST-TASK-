// Component client-side cho trang đăng ký
'use client'

// Import hooks React
import { useState } from 'react'
// Import hook router của Next.js
import { useRouter } from 'next/navigation'
// Import Link để navigation
import Link from 'next/link'
// Import hook auth từ context
import { useAuth } from '@/contexts/AuthContext'

// Component trang đăng ký tài khoản
export default function SignupPage() {
  // Lấy hàm signup từ auth context
  const { signup } = useAuth()
  // Hook router để chuyển trang
  const router = useRouter()

  // State lưu dữ liệu form đăng ký
  const [formData, setFormData] = useState({
    fullName: '', // Họ và tên
    email: '', // Email
    password: '', // Mật khẩu
    confirmPassword: '' // Xác nhận mật khẩu
  })
  // State lưu lỗi (nếu có)
  const [error, setError] = useState('')
  // State loading khi đang xử lý
  const [loading, setLoading] = useState(false)

  // Kiểm tra form có hợp lệ không
  const isValid = 
    formData.fullName.trim() !== '' && // Họ tên không rỗng
    formData.email.trim() !== '' && // Email không rỗng
    /\S+@\S+\.\S+/.test(formData.email) && // Email hợp lệ
    formData.password.length >= 6 && // Mật khẩu >= 6 ký tự
    formData.password === formData.confirmPassword // Mật khẩu xác nhận khớp

  // Hàm xử lý thay đổi input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target // Lấy name và value từ input
    setFormData(prev => ({
      ...prev,
      [name]: value // Cập nhật field tương ứng
    }))
  }

  // Hàm xử lý đăng ký
  const handleSignup = async () => {
    setLoading(true) // Bật loading
    setError('') // Xóa lỗi cũ

    // Kiểm tra mật khẩu xác nhận
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      setLoading(false)
      return
    }

    // Gọi hàm signup từ context
    const success = await signup(
      formData.email,
      formData.password,
      formData.fullName
    )

    setLoading(false) // Tắt loading
    if (success) {
      router.push('/courses') // Thành công -> chuyển đến trang courses
    } else {
      setError('Email đã tồn tại hoặc đăng ký thất bại.') // Thất bại -> hiển thị lỗi
    }
  }

  return (
    // Container form đăng ký
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Đăng ký tài khoản</h2>

      {/* Form inputs */}
      <div className="space-y-4">
        {/* Input họ và tên */}
        <input
          type="text"
          name="fullName"
          placeholder="Họ và tên"
          className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.fullName}
          onChange={handleInputChange}
        />

        {/* Input email */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.email}
          onChange={handleInputChange}
        />

        {/* Input mật khẩu */}
        <input
          type="password"
          name="password"
          placeholder="Mật khẩu (tối thiểu 6 ký tự)"
          className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.password}
          onChange={handleInputChange}
        />

        {/* Input xác nhận mật khẩu */}
        <input
          type="password"
          name="confirmPassword"
          placeholder="Xác nhận mật khẩu"
          className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.confirmPassword}
          onChange={handleInputChange}
        />
      </div>

      {/* Hiển thị lỗi nếu có */}
      {error && (
        <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
      )}

      {/* Button đăng ký */}
      <button
        disabled={!isValid || loading} // Disable nếu không hợp lệ hoặc đang loading
        onClick={handleSignup} // Gọi hàm đăng ký
        className="w-full bg-blue-500 text-white p-3 mt-6 rounded font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Đang đăng ký...' : 'Đăng ký'} {/* Text thay đổi theo trạng thái */}
      </button>

      {/* Link đến trang đăng nhập */}
      <div className="text-center mt-6">
        <p className="text-gray-600">
          Đã có tài khoản?{' '}
          <Link href="/auth/login" className="text-blue-500 hover:text-blue-700 font-medium">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}