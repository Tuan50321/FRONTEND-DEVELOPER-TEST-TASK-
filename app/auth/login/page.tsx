'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isValid = email.trim() !== '' && /\S+@\S+\.\S+/.test(email) && password.length >= 6

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const success = await login(email, password)
    setLoading(false)
    if (success) {
      router.push('/courses')
    } else {
      setError('Sai email hoặc mật khẩu')
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Đăng nhập</h2>

      <input
        type="email"
        placeholder="Email"
        className="w-full border p-2 mb-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Mật khẩu"
        className="w-full border p-2 mb-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        disabled={!isValid || loading}
        onClick={handleLogin}
        className="w-full bg-blue-500 text-white p-2 mt-3 disabled:bg-gray-300"
      >
        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>

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