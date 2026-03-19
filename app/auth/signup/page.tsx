'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function SignupPage() {
  const { signup } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isValid = 
    formData.fullName.trim() !== '' &&
    formData.email.trim() !== '' &&
    /\S+@\S+\.\S+/.test(formData.email) &&
    formData.password.length >= 6 &&
    formData.password === formData.confirmPassword

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSignup = async () => {
    setLoading(true)
    setError('')

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      setLoading(false)
      return
    }

    const success = await signup(
      formData.email,
      formData.password,
      formData.fullName
    )

    setLoading(false)
    if (success) {
      router.push('/courses')
    } else {
      setError('Email đã tồn tại hoặc đăng ký thất bại.')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Đăng ký tài khoản</h2>

      <div className="space-y-4">
        <input
          type="text"
          name="fullName"
          placeholder="Họ và tên"
          className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.fullName}
          onChange={handleInputChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.email}
          onChange={handleInputChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Mật khẩu (tối thiểu 6 ký tự)"
          className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.password}
          onChange={handleInputChange}
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Xác nhận mật khẩu"
          className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.confirmPassword}
          onChange={handleInputChange}
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
      )}

      <button
        disabled={!isValid || loading}
        onClick={handleSignup}
        className="w-full bg-blue-500 text-white p-3 mt-6 rounded font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Đang đăng ký...' : 'Đăng ký'}
      </button>

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