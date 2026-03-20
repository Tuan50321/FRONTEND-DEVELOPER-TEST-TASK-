'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  gender: string
  image: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, fullName: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const SESSION_KEY = 'user'

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Chỉ dùng localStorage để lưu "session" user sau khi login/signup.
    // Dữ liệu đăng ký/progress/enrollment thật nằm trong MongoDB qua các API.
    const storedUser = localStorage.getItem(SESSION_KEY)
    setUser(storedUser ? JSON.parse(storedUser) : null)
  }, [])

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) return false
    const data = (await res.json()) as { user: User }
    setUser(data.user)
    localStorage.setItem(SESSION_KEY, JSON.stringify(data.user))
    return true
  }

  const signup = async (email: string, password: string, fullName: string) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName }),
    })
    if (!res.ok) return false
    const data = (await res.json()) as { user: User }
    setUser(data.user)
    localStorage.setItem(SESSION_KEY, JSON.stringify(data.user))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
